/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { IEmployee } from "../../types";
import { Controller, useForm } from "react-hook-form";
import PhotoUpload from "../../../../shared/components/photoUpload/PhotoUpload";
import FormTextInput from "../../../../shared/components/formInput/FormInput";
import { Autocomplete, Switch, TextField } from "@mui/material";
import {
  EmergencyContactRelation,
  EmployeeRole,
} from "../../../../shared/enums";
import dayjs from "dayjs";
import PickerInput from "../../../../shared/components/pickerInput/PickerInput";
import { useUpdateEmployeeDetailsMutation } from "../../employeeApis";
import { toast } from "react-toastify";
import { getError, getString } from "../../../../utils/utils.js";
import CustomBox from "../../../../components/CustomBox/CustomBox.js";
import CustomButton from "../../../../components/CustomButton/CustomButton.js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type EditEmployeeForm = {
  name: string;
  phone: string;
  status: boolean;
  avatar: string | null;
  photoId: string;
  designation: string;
  employeeCode: string;
  role: string;
  coverImage?: string;
  date_of_birth?: string;
  active_blogs?: boolean;
  joinig_date?: string;
  emergency_contact: string;
  relation_of: string;
};

const EditEmployee = () => {
  const { employee } = useLocation()?.state as { employee: IEmployee };
  const navigate = useNavigate();
  const [updateEmployee, { isLoading }] = useUpdateEmployeeDetailsMutation();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<EditEmployeeForm>({
    defaultValues: {
      name: "",
      phone: "",
      status: employee.status,
      joinig_date: "",
      avatar: null,
      photoId: employee.imageId ? employee.imageId.toString() : "",
      designation: "",
      employeeCode: "",
      role: "",
      date_of_birth: "",
      active_blogs: false,
      coverImage: "",
      emergency_contact: "",
      relation_of: "",
    },
  });

  // console.log(employee);

  // Populate form fields with employee data
  useEffect(() => {
    if (employee) {
      setValue("name", employee.name);
      setValue("phone", employee.phoneNumber);
      setValue("role", employee.role);
      setValue("designation", employee.designation);
      setValue("employeeCode", employee.empCode);
      setValue("joinig_date", employee.joiningDate);
      setValue("avatar", employee.image);
      setValue("photoId", employee.imageId ? employee.imageId.toString() : "");
      setValue("status", employee.status);
      setValue("date_of_birth", employee.dateOfBirth);
      setValue("active_blogs", employee.active_blogs);
      setValue("emergency_contact", employee.emergency_contact);
      setValue("relation_of", employee.relation_of);
    }
  }, [employee, setValue]);

  const onSubmit = async (data: EditEmployeeForm) => {
    const employeePayload = {
      name: data.name,
      designation: data.designation,
      empCode: data.employeeCode,
      joinig_date: dayjs(data.joinig_date).format("YYYY-MM-DD"),
      phoneNumber: data.phone,
      Photo: [data.photoId],
      status: data.status,
      date_of_birth: dayjs(data.date_of_birth).format("YYYY-MM-DD"),
      active_blogs: data.active_blogs,
      emergency_contact: data.emergency_contact,
      relation_of: data.relation_of.toLowerCase(),
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
    <CustomBox customClasses="flex flex-col w-full p-6 h-full overflow-scroll scrollbar-hide">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm font-bold text-primary cursor-pointer "
      >
        <ArrowBackIcon fontSize="small" />
        Back
      </button>
      <div className="flex flex-col justify-center w-full items-start p-4">
        {/* Avatar Upload */}
        <div className="flex justify-center items-center  w-full">
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
        </div>
        <Controller
          control={control}
          name="photoId"
          render={({ field }) => <input type="hidden" {...field} />}
        />

        <div className="flex  w-full justify-center gap-4">
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
                      error={!!(errors as any).role}
                      helperText={getError(errors.role)}
                      inputProps={{ ...params.inputProps, readOnly: true }}
                    />
                  )}
                />
              )}
            />
            <Controller
              control={control}
              name="relation_of"
              rules={{ required: "Relation is required" }}
              render={({ field }) => (
                <Autocomplete
                  disablePortal
                  options={Object.values(EmergencyContactRelation)}
                  disableClearable
                  freeSolo={false}
                  value={field.value || ""}
                  sx={{
                    "& .MuiOutlinedInput-root .MuiAutocomplete-input": {
                      textTransform: "capitalize",
                    },
                  }}
                  onChange={(_, value) => field.onChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Relation of"
                      variant="outlined"
                      error={!!(errors as any).relation_of}
                      helperText={getError(errors.relation_of)}
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
              name="date_of_birth"
              rules={{ required: "Date of birth is required" }}
              render={({ field }) => (
                <PickerInput
                  label="Date of Birth"
                  value={field.value ? dayjs(field.value) : dayjs()}
                  disableFuture
                  setValue={field.onChange}
                  errorMessage={getError(errors.date_of_birth)}
                />
              )}
            />
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
              name="joinig_date"
              rules={{ required: "Joining Date is required" }}
              render={({ field }) => (
                <PickerInput
                  label="Joining Date"
                  value={field.value ? dayjs(field.value) : dayjs()}
                  setValue={field.onChange}
                  disableFuture
                  errorMessage={getError(errors.joinig_date)}
                />
              )}
            />

            <Controller
              control={control}
              name="emergency_contact"
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
                  errorMessage={getError(errors.emergency_contact)}
                  label={"Emergency Contact"}
                  value={field.value}
                  placeholder="Emergency Contact"
                  onChange={field.onChange}
                />
              )}
            />

            <div className="flex flex-row items-center justify-between gap-2">
              <div className="flex flex-row items-center gap-x-2">
                <p className="text-sm font-semibold">Status:</p>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      color="warning"
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  )}
                />
              </div>
              <div className="flex flex-row items-center gap-2">
                <p className="text-sm font-semibold">Active Blog:</p>
                <Controller
                  control={control}
                  name="active_blogs"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      color="warning"
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-row mt-12 w-full justify-center items-center mb-5">
          <CustomButton
            label={isLoading ? "Updating..." : "Update"}
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            buttonStyle={isLoading ? "disabled" : "primary"}
            customStyles="bg-orange hover:bg-darkOrange"
          />
        </div>
      </div>
    </CustomBox>
  );
};

export default EditEmployee;
