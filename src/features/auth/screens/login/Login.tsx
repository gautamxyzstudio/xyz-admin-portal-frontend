/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Asrto from "../../../../assets/images/curved.webp";
import logo from "../../../../assets/images/logo-ct.webp";
import Insta from "../../../../assets/images/instagram.svg";
import Facebook from "../../../../assets/images/facebook.svg";
import LinkedIn from "../../../../assets/images/linkedin.svg";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import FormTextInput from "../../../../shared/components/formInput/FormInput";
import PasswordInput from "../../../../shared/components/PasswordInput/PasswordInput";
import { Controller, useForm } from "react-hook-form";
import { useLazyUserDetailsQuery, useLoginMutation } from "../../authApi";
import backGroundImage from "../../../../assets/images/bgImage.webp";
import CustomButton from "../../../../components/CustomButton/CustomButton";

interface LoginValues {
  identifier: string;
  password: string;
}

const LoginPage = () => {
  const { setIsLoading } = useLoadingWrapper();
  const navigation = useNavigate();
  const [login] = useLoginMutation();
  const [getUserDetails] = useLazyUserDetailsQuery();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginValues): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await login({
        identifier: values.identifier,
        password: values.password,
      }).unwrap();
      console.log(response.user, "user login response");
      if (response && response.user.user_type !== "Admin") {
        const userDetailsResponse = await getUserDetails({
          id: response?.user?.id,
        }).unwrap();
        if (userDetailsResponse) {
          navigation("/");
        }
      } else {
        navigation("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${backGroundImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        overflowX: "hidden",
      }}
    >
      <div className="flex flex-row max-w-5xl w-full justify-center items-center mx-auto rounded-lg overflow-hidden">
        <img
          src={Asrto}
          alt="Background"
          className="hidden md:block object-cover h-full w-1/2 rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
        />
        <div className="md:p-8.5 bg-white w-1/2 h-full flex flex-col">
          <img src={logo} className=" w-[65%] mb-6 object-cover" alt="Logo" />
          <h2 className="text-gray-800 font-bold text-2xl md:text-3xl">
            Log in to your Account
          </h2>
          <span className="text-orange-500 mt-8">
            Welcome back! Please login
          </span>
          <div className="flex flex-col gap-6 my-4">
            <Controller
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              name="identifier"
              render={({ field }) => (
                <FormTextInput
                  label="Email"
                  type="email"
                  value={field.value}
                  onChange={field.onChange}
                  errorMessage={(errors as any).identifier?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
              }}
              render={({ field }) => (
                <PasswordInput
                  showPassword={showPassword}
                  handleClickShowPassword={() => setShowPassword(!showPassword)}
                  value={field.value}
                  errorMessage={errors.password?.message}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="mt-8 w-full">
            <CustomButton
              label="Login"
              customStyles="w-full py-3!"
              type="submit"
              onClick={handleSubmit(handleLogin)}
            />
          </div>
          <div className="flex items-center w-full mt-6">
            <hr className="flex-1 text-primary" />
            <div className="px-2 bg-white items-center flex space-x-2">
              <Link
                to="https://www.instagram.com/xyzdotstudio/"
                target="_blank"
              >
                <img src={Insta} alt="Instagram" />
              </Link>
              <Link to="https://www.facebook.com/xyzdotstudio/" target="_blank">
                <img src={Facebook} alt="Facebook" />
              </Link>
              <Link
                to="https://www.linkedin.com/company/xyzdotstudio"
                target="_blank"
              >
                <img src={LinkedIn} alt="LinkedIn" />
              </Link>
            </div>
            <hr className="flex-1 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
