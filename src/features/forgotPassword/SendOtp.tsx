import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useForgotPasswordApi } from "./forgotPasswordApi";
import { toast } from "react-toastify";
import Asrto from "../../assets/images/curved.webp";
import logo from "../../assets/images/logo-ct.webp";
import backGroundImage from "../../assets/images/bgImage.webp";
import FormTextInput from "../../shared/components/formInput/FormInput";
import CustomButton from "../../components/CustomButton/CustomButton";
interface SendOtpValues {
    email: string;
}

const SendOtp = () => {
    const navigate = useNavigate();
    const { sendOtp, isLoading } = useForgotPasswordApi();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<SendOtpValues>({
        defaultValues: {
            email: "",
        },
    });


    const handleSendOtp = async (values: SendOtpValues) => {
        try {
            const email = values.email.trim().toLowerCase();

            console.log("Sending OTP to:", email);

            const response = await sendOtp(email);

            console.log("Send OTP response:", response);

            toast.success(response?.message || "OTP sent successfully");

            navigate("/verify-reset-otp", {
                state: {
                    email,
                },
            });
        } catch (error: any) {
            console.error("Send OTP error:", error);

            toast.error(
                error?.message || "Failed to send OTP. Please try again."
            );
        }
    };

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
                        Forgot Password?
                    </h2>

                    <p className="text-orange-500 mt-3 mb-8 text-md">
                        Enter your registered email address and we’ll send you an OTP to
                        reset your password.
                    </p>

                    <form onSubmit={handleSubmit(handleSendOtp)}>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address",
                                },
                            }}
                            render={({ field }) => (
                                <FormTextInput
                                    label="Email"
                                    type="email"
                                    value={field.value}
                                    onChange={field.onChange}
                                    errorMessage={errors.email?.message as string}
                                />
                            )}
                        />

                        <div className="mt-8 w-full">
                            <CustomButton
                                label={isLoading ? undefined : "Send OTP"}
                                icon={
                                    isLoading ? (
                                        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : undefined
                                }
                                customStyles="w-full py-3!"
                                type="submit"
                                disabled={isLoading}
                            />
                        </div>
                    </form>

                    <div className="flex justify-center mt-6">
                        <p className="text-sm text-gray-500">
                            Remember your password?{" "}
                            <Link
                                to="/login"
                                className="text-orange-500 font-medium hover:underline"
                            >
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendOtp;