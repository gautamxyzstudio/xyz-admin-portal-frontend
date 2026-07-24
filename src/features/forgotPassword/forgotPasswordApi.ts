import { AxiosError } from "axios";
import { useMutation } from "../../api/customApi";
import { endpoints } from "../../api/endpoints";
import axios from "axios";

export const useForgotPasswordApi = () => {
  const { makeRequest, isLoading } = useMutation();

  // Helper only for forgot password APIs
  const handleForgotPasswordError = (error: any) => {
    const axiosError = error as AxiosError<any>;

    const message =
      axiosError.response?.data?.error?.message ||
      axiosError.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    throw {
      statusCode: axiosError.response?.status || error?.statusCode || 0,
      message,
    };
  };

  const sendOtp = async (email: string) => {
    try {
      return await makeRequest({
        url: endpoints.sendOtp,
        type: "post",
        body: {
          email,
        },
      });
    } catch (error) {
      handleForgotPasswordError(error);
    }
  };


const verifyOtp = async (
  email: string,
  otp: string
) => {
  try {
    const response = await axios.post(
      endpoints.verifyOtp,
      {
        email,
        otp,
      }
    );

    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 0,

      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to verify OTP",
    };
  }
};

  const resendOtp = async (email: string) => {
    try {
      return await makeRequest({
        url: endpoints.resendOtp,
        type: "post",
        body: {
          email,
        },
      });
    } catch (error) {
      handleForgotPasswordError(error);
    }
  };

 const resetPassword = async (
  email: string,
  password: string,
  confirmPassword: string
) => {
  return await makeRequest({
    url: endpoints.resetPassword,
    type: "post",
    body: {
      email,
      password,
      confirmPassword,
    },
  });
};

  return {
    sendOtp,
    verifyOtp,
    resendOtp,
    resetPassword,
    isLoading,
  };
};