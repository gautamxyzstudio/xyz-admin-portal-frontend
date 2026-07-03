/* eslint-disable @typescript-eslint/no-explicit-any */
import { Autocomplete, InputAdornment, Switch, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import FormTextInput from "../../../../shared/components/formInput/FormInput";
import PhotoUpload from "../../../../shared/components/photoUpload/PhotoUpload";
import PasswordInput from "../../../../shared/components/PasswordInput/PasswordInput";
import { useEffect, useState } from "react";
import type { AddEmployeeFormData } from "./AddEmployeeForm.types";
import {
  EmergencyContactRelation,
  EmployeeRole,
} from "../../../../shared/enums";
import dayjs from "dayjs";
import PickerInput from "../../../../shared/components/pickerInput/PickerInput";
import { toast } from "react-toastify";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { inputBaseClasses } from "@mui/material/InputBase";

const AddEmployeeForm = ({
  onPressSubmit,
}: {
  onPressSubmit: (data: AddEmployeeFormData) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const defaultValues: AddEmployeeFormData = {
    name: "",
    email: "",
    phone: "",
    password: "",
    joiningDate: "",
    avatar: "",
    status: true,
    activeBlog: false,
    designation: "",
    employeeCode: "",
    role: "",
    dob: "",
    emergencyContact: "",
    relationOf: "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    defaultValues,
  });

  const onSubmit = (data: AddEmployeeFormData) => {
    onPressSubmit({
      ...data,
      dob: data.dob ? dayjs(data.dob).format("YYYY-MM-DD") : "",
    });
    reset();
  };

  useEffect(() => {
    if (errors.avatar) {
      toast.error(errors.avatar.message);
    }
  }, [errors.avatar]);

  return (
    <CustomBox customClasses="w-full h-full flex flex-col p-6 gap-y-10 overflow-scroll scrollbar-hide">
      <button
        type="button"
        onClick={() => {
          reset();
          navigate(-1);
        }}
        className="flex items-center gap-1 text-sm font-bold text-primary cursor-pointer"
      >
        <ArrowBackIcon fontSize="small" />
        Back
      </button>

      <div className="flex flex-row w-full justify-center items-center">
        <Controller
          control={control}
          name="avatar"
          rules={{ required: "Avatar is required" }}
          render={({ field }) => (
            <PhotoUpload getUploadedImageId={(id) => field.onChange(id)} />
          )}
        />
      </div>
      <div className="flex flex-row w-full h-full justify-around items-start">
        <div className="flex flex-col gap-6 w-[40%] h-full ">
          <Controller
            control={control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormTextInput
                errorMessage={(errors as any).name?.message}
                label={"Name"}
                value={field.value}
                placeholder="Name"
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            name="email"
            render={({ field }) => (
              <FormTextInput
                errorMessage={(errors as any).email?.message}
                label={"Email"}
                value={field.value}
                placeholder="Email"
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            }}
            render={({ field }) => (
              <PasswordInput
                errorMessage={errors.password?.message}
                label={"Password"}
                value={field.value}
                placeholder="Password"
                onChange={field.onChange}
                showPassword={showPassword}
                handleClickShowPassword={() => setShowPassword(!showPassword)}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            rules={{
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Invalid phone number",
              },
            }}
            render={({ field }) => (
              <FormTextInput
                errorMessage={(errors as any).phone?.message}
                label={"Phone number"}
                value={field.value}
                maxLength={10}
                placeholder="Phone"
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="relationOf"
            rules={{ required: "Relation is required" }}
            render={({ field }) => (
              <Autocomplete
                disablePortal
                options={Object.values(EmergencyContactRelation)}
                disableClearable
                freeSolo={false}
                value={field.value || ""}
                onChange={(_, value) => field.onChange(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Relation of"
                    variant="outlined"
                    error={!!(errors as any).relationOf}
                    helperText={(errors as any).relationOf?.message}
                    inputProps={{
                      ...params.inputProps,
                      readOnly: true,
                    }}
                  />
                )}
              />
            )}
          />

          <Controller
            control={control}
            name="role"
            rules={{ required: "Role is required" }}
            render={({ field }) => (
              <Autocomplete
                disablePortal
                options={Object.values(EmployeeRole)}
                disableClearable
                freeSolo={false}
                value={field.value || ""}
                onChange={(_, value) => field.onChange(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Role"
                    variant="outlined"
                    error={!!(errors as any).role}
                    helperText={(errors as any).role?.message}
                    inputProps={{
                      ...params.inputProps,
                      readOnly: true,
                    }}
                  />
                )}
              />
            )}
          />
        </div>
        <div className="flex flex-col gap-6 w-[40%] h-full">
          <Controller
            control={control}
            name="designation"
            rules={{ required: "Designation is required" }}
            render={({ field }) => (
              <FormTextInput
                errorMessage={(errors as any).designation?.message}
                label={"Designation"}
                value={field.value}
                placeholder="Designation"
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="employeeCode"
            rules={{ required: "Employee Code is required" }}
            render={({ field }) => (
              <FormTextInput
                errorMessage={(errors as any).employeeCode?.message}
                label={"Employee Code"}
                value={field.value}
                placeholder="Employee Code"
                onChange={field.onChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          opacity: 0,
                          pointerEvents: "none",
                          [`[data-shrink=true] ~ .${inputBaseClasses.root} > &`]:
                            {
                              opacity: 1,
                            },
                        }}
                      >
                        XYZ
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="joiningDate"
            rules={{ required: "Joining Date is required" }}
            render={({ field }) => (
              <PickerInput
                label="Joining Date"
                value={field.value ? dayjs(field.value) : null}
                setValue={(value) =>
                  field.onChange(value ? value.format("YYYY-MM-DD") : "")
                }
                disableFuture={true}
                disableWeekend={true}
                errorMessage={errors.joiningDate?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="dob"
            rules={{ required: "Date of birth is required" }}
            render={({ field }) => (
              <PickerInput
                label="Date of Birth"
                value={field.value ? dayjs(field.value) : null}
                setValue={(value) => field.onChange(value)}
                errorMessage={errors.dob?.message}
                popperPlacement="top-end"
                disableWeekend={false}
                disableFuture={true}
              />
            )}
          />
          <Controller
            control={control}
            name="emergencyContact"
            rules={{
              required: "Emergency Contact is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Invalid phone number",
              },
              minLength: {
                value: 10,
                message: "Phone number must be at least 10 digits",
              },
              maxLength: {
                value: 10,
                message: "Phone number must be at most 10 digits",
              },
              validate: (value) =>
                value !== getValues("phone") ||
                "Emergency contact cannot be the same as phone number",
            }}
            render={({ field }) => (
              <FormTextInput
                errorMessage={(errors as any).emergencyContact?.message}
                label={"Emergency Contact"}
                value={field.value}
                placeholder="Emergency Contact"
                onChange={field.onChange}
              />
            )}
          />

          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <p className="text-base font-semibold">Status:</p>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Switch
                    defaultChecked={field.value}
                    color="warning"
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="text-base font-semibold"> Active Blogs:</p>
              <Controller
                control={control}
                name="activeBlog"
                render={({ field }) => (
                  <Switch
                    defaultChecked={field.value}
                    color="warning"
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row w-full h-fit justify-center items-center">
        <CustomButton
          onClick={handleSubmit(onSubmit)}
          customStyles=""
          label="Create"
          type="submit"
        />
      </div>
    </CustomBox>
  );
};

export default AddEmployeeForm;
