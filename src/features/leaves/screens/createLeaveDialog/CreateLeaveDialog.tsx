/* eslint-disable @typescript-eslint/no-explicit-any */
import FormTextInput from "../../../../shared/components/formInput/FormInput.js";
import PickerInput from "../../../../shared/components/pickerInput/PickerInput.js";
import { Autocomplete, TextField, Dialog } from "@mui/material";
import TimePickerInput from "../../../../shared/components/timepickerinput/TimePickerInput.js";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useApplyLeaveMutation } from "../../leavesApi.js";
import { userInState } from "../../../auth/authSlice.js";
import { useSelector } from "react-redux";
import {
  formatDateToMMDDYYYY,
  formatTimeToHHMMSS,
  getError,
  getString,
} from "../../../../utils/utils.js";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import { toast } from "react-toastify";
import CustomBox from "../../../../components/CustomBox/CustomBox.js";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient.js";
import { getLeaveCategory, getLeaveType } from "../../utils.js";
import CustomButton from "../../../../components/CustomButton/CustomButton.js";

type LeaveForm = {
  title: string;
  description: string;
  leaveCategory: "Full Day" | "Half Day" | "Short Leave";
  leaveType: "Causal Leave" | "Earn Leave" | "Sick Leave" | "Unpaid Leave";
  half: "First Half" | "Second Half";
  date: dayjs.Dayjs;
  startTime: dayjs.Dayjs | null;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
};

const CreateLeaveDialog = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const user = useSelector(userInState);
  const { setIsLoading } = useLoadingWrapper();
  const [applyLeave] = useApplyLeaveMutation();

  const leaveCategories = ["Full Day", "Half Day", "Short Leave"] as const;
  const halfDay = ["First Half", "Second Half"] as const;
  const leaveTypes = [
    "Causal Leave",
    "Earn Leave",
    "Sick Leave",
    "Unpaid Leave",
  ] as const;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<LeaveForm>({
    defaultValues: {
      title: "",
      description: "",
      leaveCategory: "Full Day",
      leaveType: "Causal Leave",
      half: halfDay[0],
      date: dayjs(),
      startTime: null,
      startDate: dayjs(),
      endDate: dayjs(),
    },
  });

  // Calculate number of days for full day leaves
  const leaveCategory = watch("leaveCategory");

  // Handle leave apply
  const handleApplyLeave = async (data: LeaveForm) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await applyLeave({
        data: {
          start_date: formatDateToMMDDYYYY(data.startDate.toDate()),
          end_date:
            data?.endDate && data?.endDate?.isValid()
              ? formatDateToMMDDYYYY(data.endDate.toDate())
              : formatDateToMMDDYYYY(data.date.toDate()),
          status: "pending",
          decline_reason: "",
          description: data.description,
          title: data.title,
          leave_type:
            data.leaveCategory === "Short Leave"
              ? null
              : (getLeaveType(data.leaveType) as
                  | "CL"
                  | "EL"
                  | "SL"
                  | "un-paid"),
          leave_category: getLeaveCategory(data.leaveCategory) as
            | "short_leave"
            | "half_day"
            | "full_day",
          start_time: data.startTime
            ? formatTimeToHHMMSS(data.startTime)
            : null,
          half_day_type:
            data.leaveCategory === "Half Day"
              ? data.half === "First Half"
                ? "first_half"
                : "second_half"
              : null,
          user: user.id.toString(),
        },
      }).unwrap();

      console.log("Response", response);

      if (response) {
        toast.success("Leave applied successfully");
        onSuccess();
        reset() 
      }

    } catch (error: any) {
      toast.error(error?.message ?? "Failed to apply leave");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          padding: 0,
          overflow: "scroll",
          msOverflowStyle: "none", 
          scrollbarWidth: "none",
        },
        "& .MuiDialog-paper::-webkit-scrollbar": {
          display: "none", 
        },
      }}
      
    >
      <CustomBox customClasses="p-6 flex   flex-col gap-y-3">
        <h4 className="text-xl font-semibold">Apply Leave</h4>
        <LinearGradient customClasses=" " />
        <div className="flex w-full max-w-2xl flex-col gap-6 mt-2">
          {/* Title */}
          <Controller
            control={control}
            name="title"
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <FormTextInput
                label="Title"
                value={getString(field.value)}
                placeholder="Title"
                onChange={field.onChange}
                errorMessage={getError(errors.title)}
              />
            )}
          />
          {/* Leave Category */}
          <div className="flex flex-row items-start gap-x-5 w-full">
            <Controller
              control={control}
              name="leaveCategory"
              render={({ field }) => (
                <Autocomplete
                  fullWidth
                  disablePortal
                  options={leaveCategories}
                  disableClearable
                  freeSolo={false}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Leave Category"
                      variant="outlined"
                      inputProps={{
                        ...params.inputProps,
                        readOnly: true,
                      }}
                    />
                  )}
                />
              )}
            />
            {/* Leave Type */}
            {leaveCategory !== "Short Leave" && (
              <Controller
                control={control}
                name="leaveType"
                rules={{
                  required: "Leave type is required",
                }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    fullWidth
                    disablePortal
                    options={leaveTypes}
                    disableClearable
                    freeSolo={false}
                    value={field.value}
                    onChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Leave Type"
                        variant="outlined"
                        fullWidth
                        inputProps={{
                          ...params.inputProps,
                          readOnly: true,
                        }}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            )}
          </div>
          {/* Date Pickers */}
          {(leaveCategory === "Half Day" ||
            leaveCategory === "Short Leave") && (
            <div className="flex flex-row items-start gap-x-5 w-full">
              {(leaveCategory === "Half Day" ||
                leaveCategory === "Short Leave") && (
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <PickerInput
                      label="Start Date"
                      value={field.value}
                      disablePast
                      setValue={field.onChange}
                      errorMessage={getError(errors.date)}
                    />
                  )}
                />
              )}
              {/* Half Day */}
              {leaveCategory === "Half Day" && (
                <Controller
                  control={control}
                  name="half"
                  render={({ field }) => (
                    <Autocomplete
                      fullWidth
                      disablePortal
                      options={halfDay}
                      disableClearable
                      freeSolo={false}
                      value={field.value}
                      onChange={(_, value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Half"
                          variant="outlined"
                          inputProps={{
                            ...params.inputProps,
                            readOnly: true,
                          }}
                        />
                      )}
                    />
                  )}
                />
              )}
              {/* Short Leave Time Picker */}
              {leaveCategory === "Short Leave" && (
                <Controller
                  control={control}
                  name="startTime"
                  rules={{
                    required: "Start time is required for short leave",
                  }}
                  render={({ field }) => (
                    <TimePickerInput
                      label="Start Time"
                      value={field.value ?? dayjs()}
                      setValue={field.onChange}
                      errorMessage={getError(errors.startTime)}
                    />
                  )}
                />
              )}
            </div>
          )}
          {/* Full Day Date Pickers */}
          {leaveCategory === "Full Day" && (
            <div className="flex flex-row items-start gap-x-5 w-full">
              <Controller
                control={control}
                name="startDate"
                rules={{
                  required: "Start date is required",
                  validate: (value) => {
                    const endDate = watch("endDate");
                    if (endDate && value && value.isAfter(endDate, "day")) {
                      return "Start date must be before or equal to end date";
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <PickerInput
                    disablePast
                    label="Start Date"
                    value={field.value}
                    setValue={field.onChange}
                    errorMessage={getError(errors.startDate)}
                  />
                )}
              />
              <Controller
                control={control}
                name="endDate"
                rules={{
                  required: "End date is required",
                  validate: (value) => {
                    const startDate = watch("startDate");
                    if (
                      startDate &&
                      value &&
                      value.isBefore(startDate, "day")
                    ) {
                      return "End date must be after or equal to start date";
                    }
                    return true;
                  },
                }}
                render={({ field }) => {
                  const startDate = watch("startDate");
                  const shouldDisableDate = (date: dayjs.Dayjs) => {
                    return startDate ? date.isBefore(startDate, "day") : false;
                  };

                  return (
                    <PickerInput
                      label="End Date"
                      value={field.value}
                      setValue={field.onChange}
                      errorMessage={getError(errors.endDate)}
                      shouldDisableDate={shouldDisableDate}
                    />
                  );
                }}
              />
            </div>
          )}
          {/* Description */}
          <Controller
            control={control}
            name="description"
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <FormTextInput
                label="Description"
                multiline
                rows={4}
                value={getString(field.value)}
                placeholder="Description"
                onChange={field.onChange}
                errorMessage={getError(errors.description)}
              />
            )}
          />
          <LinearGradient />
          <div className="flex flex-row items-start justify-end w-full gap-x-3">
            <CustomButton
              type="submit"
              label="Apply Leave"
              onClick={handleSubmit(handleApplyLeave)}
              buttonStyle="primary"
            />
            <CustomButton
              label="Cancel Leave"
              onClick={() => {
                reset();

                onSuccess();
              }}
              buttonStyle="secondary"
            />
          </div>
        </div>
      </CustomBox>
    </Dialog>
  );
};

export default CreateLeaveDialog;
