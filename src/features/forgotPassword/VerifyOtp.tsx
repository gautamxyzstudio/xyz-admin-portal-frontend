import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForgotPasswordApi } from "./forgotPasswordApi";
import { toast } from "react-toastify";
import Asrto from "../../assets/images/curved.webp";
import logo from "../../assets/images/logo-ct.webp";
import backGroundImage from "../../assets/images/bgImage.webp";
import CustomButton from "../../components/CustomButton/CustomButton";

const OTP_LENGTH = 6;

interface LocationState {
    email?: string;
}

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { email } = (location.state as LocationState) || {};
    const { verifyOtp, isLoading, resendOtp } = useForgotPasswordApi();
    const [otp, setOtp] = useState<string[]>(
        Array(OTP_LENGTH).fill("")
    );

    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const [timeLeft, setTimeLeft] = useState(5 * 60);
    const [isResending, setIsResending] = useState(false);
    /*
     * If user directly opens this URL without coming
     * from Send OTP page, redirect back.
     */
    useEffect(() => {
        if (!email) {
            navigate("/forgot-password", {
                replace: true,
            });
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setTimeout(() => {
            setTimeLeft((prev) =>
                prev > 0 ? prev - 1 : 0
            );
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
    ).padStart(2, "0")}`;

    const isExpired = timeLeft === 0;

    const handleOtpChange = (
        index: number,
        value: string
    ) => {
        // Allow numbers only
        const numericValue = value.replace(/\D/g, "");

        if (!numericValue) {
            const updatedOtp = [...otp];
            updatedOtp[index] = "";
            setOtp(updatedOtp);
            return;
        }

        const updatedOtp = [...otp];

        updatedOtp[index] = numericValue.slice(-1);

        setOtp(updatedOtp);

        // Move automatically to next box
        if (index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }

        if (event.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (
            event.key === "ArrowRight" &&
            index < OTP_LENGTH - 1
        ) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (
        event: React.ClipboardEvent<HTMLInputElement>
    ) => {
        event.preventDefault();

        const pastedValue = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH);

        if (!pastedValue) return;

        const updatedOtp = Array(OTP_LENGTH).fill("");

        pastedValue.split("").forEach((digit, index) => {
            updatedOtp[index] = digit;
        });

        setOtp(updatedOtp);

        const focusIndex = Math.min(
            pastedValue.length,
            OTP_LENGTH - 1
        );

        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerifyOtp = async () => {
        if (!email) {
            toast.error("Email is missing. Please request OTP again.");
            navigate("/forgot-password");
            return;
        }

        if (isExpired) {
            toast.error("OTP has expired. Please resend OTP.");
            return;
        }

        const enteredOtp = otp.join("");

        if (enteredOtp.length !== OTP_LENGTH) {
            toast.error("Please enter the complete 6-digit OTP.");
            return;
        }

        try {
            console.log("Verify OTP payload:", {
                email,
                otp: enteredOtp,
            });

            const response = await verifyOtp(
                email,
                enteredOtp
            );

            console.log(
                "Verify OTP response:",
                response
            );

            toast.success(
                response?.message ||
                "OTP verified successfully"
            );

            navigate("/reset-password", {
                state: {
                    email,
                },
                replace: true,
            });

        } catch (error: any) {
            console.error(
                "Verify OTP error:",
                error
            );

            const message =
                error?.message ||
                "Invalid or expired OTP. Please try again.";

            toast.error(message);

            if (
                message.toLowerCase().includes("expired")
            ) {
                setTimeLeft(0);
            }
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            toast.error("Email is missing. Please request OTP again.");
            navigate("/forgot-password");
            return;
        }

        try {
            setIsResending(true);

            const response = await resendOtp(email);

            toast.success(
                response?.message || "OTP resent successfully"
            );

            // Clear previously entered OTP
            setOtp(Array(OTP_LENGTH).fill(""));

            // New OTP is valid for another 5 minutes
            setTimeLeft(5 * 60);

            // Focus first OTP box
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 0);
        } catch (error: any) {
            console.error("Resend OTP error:", error);

            toast.error(
                error?.message ||
                "Failed to resend OTP. Please try again."
            );
        } finally {
            setIsResending(false);
        }
    };

    const isOtpComplete = otp.every(
        (digit) => digit !== ""
    );

    return (
        <div
            className="w-full min-h-screen flex flex-col justify-center items-center"
            style={{
                backgroundImage: `url(${backGroundImage})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                overflowX: "hidden",
            }}
        >
            <div className="flex flex-row max-w-5xl w-full justify-center items-stretch mx-auto rounded-lg overflow-hidden">
                {/* Left Image */}
                <img
                    src={Asrto}
                    alt="Background"
                    className="hidden md:block object-cover w-1/2 rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                />

                {/* Right Section */}
                <div className="md:p-8.5 bg-white w-full md:w-1/2 min-h-[600px] flex flex-col justify-start pt-20!">
                    <img
                        src={logo}
                        className="w-[60%] mb-6 object-contain"
                        alt="Logo"
                    />

                    <h2 className="text-gray-800 font-bold text-xl md:text-2xl">
                        Verify OTP
                    </h2>

                    <p className="text-orange-500 mt-3 text-md">
                        We’ve sent a 6-digit verification code to
                    </p>

                    {email && (
                        <p className="text-gray-700 font-medium mt-1 break-all">
                            {email}
                        </p>
                    )}

                    {/* OTP Inputs */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    inputRefs.current[index] = element;
                                }}
                                type="text"
                                inputMode="numeric"
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                maxLength={1}
                                value={digit}
                                onChange={(event) =>
                                    handleOtpChange(index, event.target.value)
                                }
                                onKeyDown={(event) =>
                                    handleKeyDown(index, event)
                                }
                                onPaste={handlePaste}
                                className="
  w-12 h-12
  text-center
  text-xl
  font-semibold
  text-gray-800
  border
  border-gray-300
  rounded-md
  outline-none!
  ring-0!
  shadow-none!
  focus:outline-none!
  focus:ring-0!
  focus:shadow-none!
  focus:border-2
  focus:border-orange-500!
"
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-center mt-7 text-sm">
                        {!isExpired ? (
                            <p className="text-gray-500">
                                OTP expires in{" "}
                                <span className="text-orange-500 font-medium">
                                    {formattedTime}
                                </span>
                            </p>
                        ) : (
                            <p className="text-gray-500">
                                Didn't receive OTP?{" "}
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isResending}
                                    className="text-orange-500 font-medium hover:underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isResending
                                        ? "Resending..."
                                        : "Resend OTP"}
                                </button>
                            </p>
                        )}
                    </div>


                    {/* Verify Button */}
                    <div className="mt-8 w-full">
                        <CustomButton
                            label={isLoading ? undefined : "Verify OTP"}
                            icon={
                                isLoading ? (
                                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : undefined
                            }
                            customStyles="w-full py-3!"
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={!isOtpComplete || isExpired || isLoading}
                        />
                    </div>

                    {/* Back */}
                    <div className="flex justify-center mt-6">
                        <p className="text-sm text-gray-500">
                            Entered the wrong email?{" "}
                            <Link
                                to="/forgot-password"
                                className="text-orange-500 font-medium hover:underline"
                            >
                                Go Back
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;