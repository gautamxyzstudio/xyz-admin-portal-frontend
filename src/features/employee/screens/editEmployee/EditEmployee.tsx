/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { IEmployee } from "../../types";
import { Controller, useForm } from "react-hook-form";
import PhotoUpload from "../../../../shared/components/photoUpload/PhotoUpload";
import FormTextInput from "../../../../shared/components/formInput/FormInput";
import { Autocomplete, Switch, TextField } from "@mui/material";
import { EmployeeRole } from "../../../../shared/enums";
import dayjs from "dayjs";
import PickerInput from "../../../../shared/components/pickerInput/PickerInput";
import {
  useGetEmployeeLeaveBalanceQuery,
  useUpdateEmployeeDetailsMutation,
} from "../../employeeApis";
import { toast } from "react-toastify";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import { getError, getString } from "../../../../utils/utils.js";
import CustomBox from "../../../../components/CustomBox/CustomBox.js";
import CustomButton from "../../../../components/CustomButton/CustomButton.js";

type EditEmployeeForm = {
  name: string;
  phone: string;
  status: boolean;
  joiningDate: string;
  avatar: string | null;
  photoId: string;
  designation: string;
  employeeCode: string;
  role: string;
  dateOfBirth: string;
};

const EditEmployee = () => {
  const { employee } = useLocation()?.state as { employee: IEmployee };
  const navigate = useNavigate();
  const { setIsLoading } = useLoadingWrapper();
  const [updateEmployee, { isLoading }] = useUpdateEmployeeDetailsMutation();

  // Fetch leave balances internally, but not used in the form
  const { isFetching } = useGetEmployeeLeaveBalanceQuery(
    { id: employee.id.toString() },
    { skip: !employee, refetchOnMountOrArgChange: true }
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditEmployeeForm>({
    defaultValues: {
      name: "",
      phone: "",
      status: employee.status,
      joiningDate: "",
      avatar: null,
      photoId: employee.imageId ? employee.imageId.toString() : "",
      designation: "",
      employeeCode: "",
      role: "",
      dateOfBirth: "",
    },
  });

  // Loading state
  useEffect(() => {
    setIsLoading(isFetching);
  }, [isFetching, setIsLoading]);

  // Populate form fields with employee data
  useEffect(() => {
    if (employee) {
      setValue("name", employee.name);
      setValue("phone", employee.phoneNumber);
      setValue("role", employee.role);
      setValue("designation", employee.designation);
      setValue("employeeCode", employee.empCode);
      setValue("joiningDate", employee.joiningDate);
      setValue("avatar", employee.image);
      setValue("photoId", employee.imageId ? employee.imageId.toString() : "");
      setValue("status", employee.status);
      setValue("dateOfBirth", employee.dateOfBirth);
    }
  }, [employee, setValue]);

  const onSubmit = async (data: EditEmployeeForm) => {
    const employeePayload = {
      name: data.name,
      designation: data.designation,
      empCode: data.employeeCode,
      joiningDate: data.joiningDate,
      phoneNumber: data.phone,
      Photo: [data.photoId],
      status: data.status,
      dateOfBirth: data.dateOfBirth,
    };

    try {
      await updateEmployee({
        id: employee.details_id.toString(),
        data: employeePayload,
      }).unwrap();
      toast.success("Employee updated successfully");
      navigate("/employees");
    } catch (error: any) {
      toast.error(error?.message ?? "Something went wrong");
    }
  };

  return (
    <CustomBox customClasses="flex flex-col w-full justify-center items-center">
      {/* Avatar Upload */}
      <Controller
        control={control}
        name="avatar"
        rules={{ required: "Avatar is required" }}
        render={({ field }) => (
          <PhotoUpload
            initialValue={employee.image}
            getUploadedImageId={(id) => {
              field.onChange(id);
              setValue("photoId", String(id));
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="photoId"
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <div className="flex flex-row w-full justify-around items-start">
        {/* Left Column */}
        <div className="flex flex-col mt-10 gap-6 w-[40%]">
          <Controller
            control={control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormTextInput
                errorMessage={getError(errors.name)}
                label="Name"
                value={getString(field.value)}
                placeholder="Name"
                onChange={field.onChange}
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
                errorMessage={getError(errors.phone)}
                label="Phone number"
                value={getString(field.value)}
                maxLength={10}
                placeholder="Phone"
                onChange={field.onChange}
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
                    inputProps={{ ...params.inputProps, readOnly: true }}
                  />
                )}
              />
            )}
          />
          <div className="flex flex-row items-center gap-2">
            <p className="text-sm font-medium">Status:</p>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Switch
                  checked={!!field.value}
                  color="warning"
                  onChange={(_, checked) => field.onChange(checked)}
                />
              )}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col mt-10 gap-6 w-[40%]">
          <Controller
            control={control}
            name="designation"
            rules={{ required: "Designation is required" }}
            render={({ field }) => (
              <FormTextInput
                errorMessage={getError(errors.designation)}
                label="Designation"
                value={getString(field.value)}
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
                disabled
                errorMessage={getError(errors.employeeCode)}
                label="Employee Code"
                value={getString(field.value)}
                placeholder="Employee Code"
                onChange={field.onChange}
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
                value={field.value ? dayjs(field.value) : dayjs()}
                setValue={field.onChange}
                disableFuture={dayjs()}
                errorMessage={getError(errors.joiningDate)}
              />
            )}
          />
          <Controller
            control={control}
            name="dateOfBirth"
            rules={{ required: "Date of birth is required" }}
            render={({ field }) => (
              <PickerInput
                label="Date of Birth"
                value={field.value ? dayjs(field.value) : null}
                disableFuture={dayjs()}
                setValue={field.onChange}
                errorMessage={getError(errors.dateOfBirth)}
              />
            )}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-row mt-12 w-full justify-center items-center mb-5">
        <CustomButton
          label={isLoading || isFetching ? "Updating..." : "Update"}
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading || isFetching}
          buttonStyle={isLoading || isFetching ? "disabled" : "primary"}
          customStyles="bg-orange hover:bg-darkOrange"
        />
      </div>
    </CustomBox>
  );
};

export default EditEmployee;
