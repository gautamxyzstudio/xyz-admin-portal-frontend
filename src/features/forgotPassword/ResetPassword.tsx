/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useForgotPasswordApi } from "./forgotPasswordApi";

import Asrto from "../../assets/images/curved.webp";
import logo from "../../assets/images/logo-ct.webp";
import backGroundImage from "../../assets/images/bgImage.webp";

import PasswordInput from "../../shared/components/PasswordInput/PasswordInput";
import CustomButton from "../../components/CustomButton/CustomButton";

interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

interface LocationState {
  email?: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { email } = (location.state as LocationState) || {};

  const { resetPassword, isLoading } = useForgotPasswordApi();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  /*
   * User should only reach this page
   * after successfully verifying OTP.
   */
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", {
        replace: true,
      });
    }
  }, [email, navigate]);

  const handleResetPassword = async (
    values: ResetPasswordValues
  ) => {
    if (!email) {
      toast.error(
        "Reset session is missing. Please request OTP again."
      );

      navigate("/forgot-password", {
        replace: true,
      });

      return;
    }

    try {
      console.log("Reset password payload:", {
        email,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      const response = await resetPassword(
        email,
        values.newPassword,
        values.confirmPassword
      );

      console.log(
        "Reset password response:",
        response
      );

      toast.success(
        response?.message ||
          "Password reset successfully"
      );

      navigate("/login", {
        replace: true,
      });
    } catch (error: any) {
      console.error(
        "Reset password error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to reset password. Please try again."
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
            Reset Password
          </h2>

          <p className="text-orange-500 mt-3 mb-8 text-md">
            Create a new password for your account.
          </p>

          <form
            onSubmit={handleSubmit(handleResetPassword)}
          >
            {/* New Password */}
            <Controller
              control={control}
              name="newPassword"
              rules={{
                required: "New password is required",
                minLength: {
                  value: 8,
                  message:
                    "Password must be at least 8 characters",
                },
              }}
              render={({ field }) => (
                <PasswordInput
                  label="New Password"
                  showPassword={showNewPassword}
                  handleClickShowPassword={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  value={field.value}
                  onChange={field.onChange}
                  errorMessage={
                    errors.newPassword
                      ?.message as string
                  }
                />
              )}
            />

            {/* Confirm Password */}
            <div className="mt-6">
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required:
                    "Confirm password is required",

                  validate: (value) =>
                    value === newPassword ||
                    "Passwords do not match",
                }}
                render={({ field }) => (
                  <PasswordInput
                    label="Confirm Password"
                    showPassword={
                      showConfirmPassword
                    }
                    handleClickShowPassword={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={
                      errors.confirmPassword
                        ?.message as string
                    }
                  />
                )}
              />
            </div>

            {/* Reset Button */}
            <div className="mt-8 w-full">
              <CustomButton
                label={
                  isLoading
                    ? undefined
                    : "Reset Password"
                }
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

          {/* Back to Login */}
          <div className="flex justify-center mt-6">
            <Link
              to="/login"
              className="text-sm text-orange-500 font-medium hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;