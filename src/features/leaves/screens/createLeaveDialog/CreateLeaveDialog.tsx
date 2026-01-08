/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import FormTextInput from "../../../../shared/components/formInput/FormInput.js";
import PickerInput from "../../../../shared/components/pickerInput/PickerInput.js";
import {
  Autocomplete,
  TextField,
  Card,
  Grid,
  Box,
  Typography,
  Button,
  Dialog,
} from "@mui/material";
import TimePickerInput from "../../../../shared/components/timepickerinput/TimePickerInput.js";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import {
  useApplyLeaveMutation,
  useUpdateLeaveMutation,
} from "../../leavesApi.js";
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
import { useLocation, useNavigate } from "react-router-dom";
import { useGeLeaveBalanceQuery } from "../../../employee/employeeApis.js";
import type { ILeaveBalance } from "../../../employee/types.js";
import CustomBox from "../../../../components/CustomBox/CustomBox.js";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient.js";
import { LeaveType } from "../../../../shared/enums.js";
import { getLeaveCategory } from "../../utils.js";

type LeaveForm = {
  title: string;
  description: string;
  leaveDuration: "short_leave" | "half_day" | "full_day";
  leaveType: "Causal Leave" | "Earn Leave" | "Sick Leave" | "Unpaid Leave";
  half: string;
  date: dayjs.Dayjs;
  startTime: dayjs.Dayjs | null;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
};

const CreateLeaveDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const location = useLocation();
  const user = useSelector(userInState);
  const { setIsLoading } = useLoadingWrapper();
  const leave = location.state?.leave;
  // const { data: leaveBalance, isFetching } = useGetEmployeeLeaveBalanceQuery(
  //   { id: user?.id?.toString() ?? "" },
  //   {
  //     skip: !user,
  //     refetchOnMountOrArgChange: true,
  //     refetchOnFocus: true,
  //   }
  // );

  const { data: leaveBalance } = useGeLeaveBalanceQuery<ILeaveBalance>();

  // useEffect(() => {
  //   setIsLoading(isFetching);
  // }, [isFetching, setIsLoading]);

  console.log(leaveBalance, "Balance");

  const [applyLeave] = useApplyLeaveMutation();
  const [updateLeave] = useUpdateLeaveMutation();
  const navigate = useNavigate();

  const leaveDurations = ["full_day", "half_day", "short_leave"] as const;
  const HalfDay = ["First Half", "Second Half"] as const;
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
  } = useForm<LeaveForm>({
    defaultValues: {
      title: "",
      description: "",
      leaveDuration: leaveDurations[0],
      leaveType: "Causal Leave",
      half: HalfDay[0],
      date: dayjs(),
      startTime: null,
      startDate: dayjs(),
      endDate: dayjs(),
    },
  });

  // Populate form if editing a leave
  // useEffect(() => {
  //   if (leave) {
  //     setValue("title", leave.title);
  //     setValue("description", leave.description);
  //     setValue("leaveDuration", leave.leave_category);
  //     setValue(
  //       "leaveType",
  //       leave. ? LeaveType.Casual : LeaveType.UnPaid
  //     );
  //     setValue("date", dayjs(leave.start_date));
  //     setValue(
  //       "startTime",
  //       leave.start_time ? dayjs(leave.start_time, "HH:mm:ss") : null
  //     );
  //     setValue("startDate", dayjs(leave.start_date));
  //     setValue("endDate", dayjs(leave.end_date));
  //     setValue("half", leave.is_first_half ? "First" : "Second");
  //   }
  // }, [leave, setValue]);

  // Calculate number of days for full day leaves
  const leaveDuration = watch("leaveDuration");
  const leaveType = watch("leaveType");
  // const startDate = watch("startDate");
  // const endDate = watch("endDate");

  // const calculateDays = () => {
  //   if (leaveDuration === "full_day" && startDate && endDate) {
  //     return endDate.diff(startDate, "day") + 1;
  //   }
  //   return 1;
  // };

  // Check if user can select Casual leave type
  // const canSelectCasual = () => {
  //   const days = calculateDays();
  //   return (leaveBalance?.cl_balance || 0) >= days;
  // };

  // Auto-switch to Unpaid if insufficient balance for Casual
  // useEffect(() => {
  //   if (leaveType === LeaveType. && !canSelectCasual()) {
  //     setValue("leaveType", LeaveType.UnPaid);
  //   }
  // }, [leaveType, leaveDuration, startDate, endDate, leaveBalance, setValue]);

  // Auto-set leave type to Casual for short leave
  // useEffect(() => {
  //   if (leaveDuration === "short_leave") {
  //     setValue("leaveType", LeaveType.CL;
  //   }
  // }, [leaveDuration, setValue]);

  // Handle leave update
  const handleUpdateLeave = async (data: LeaveForm) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await updateLeave({
        id: leave.id,
        data: {
          title: data.title,
          description: data.description,
          leave_category: data.leaveDuration,
          start_date: formatDateToMMDDYYYY(data.date.toDate()),
          end_date: formatDateToMMDDYYYY(data.endDate.toDate()),
          status: leave.status,
          user: user.id,
          decline_reason: "",
          start_time: data.startTime
            ? formatTimeToHHMMSS(data.startTime)
            : undefined,
          is_paid: data.leaveType === LeaveType.CL,
          is_first_half: data.half === "First",
        },
      }).unwrap();
      if (response) {
        toast.success("Leave updated successfully");
        navigate("/leaves");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to update leave");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle leave apply
  const handleApplyLeave = async (data: LeaveForm) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await applyLeave({
        data: {
          start_date: formatDateToMMDDYYYY(data.date.toDate()),
          end_date:
            data?.endDate && data?.endDate?.isValid()
              ? formatDateToMMDDYYYY(data.endDate.toDate())
              : formatDateToMMDDYYYY(data.date.toDate()),
          status: "pending",
          decline_reason: "",
          description: data.description,
          title: data.title,
          leave_type: getLeaveCategory(data.leaveType) as
            | "CL"
            | "EL"
            | "SL"
            | "un_paid",
          leave_category: data.leaveDuration,
          start_time: data.startTime
            ? formatTimeToHHMMSS(data.startTime)
            : undefined,
            half_day_type: 'first_half',
          user: user.id.toString(),
        },
      }).unwrap();

      if (response) {
        toast.success("Leave applied successfully");
        navigate("/leaves");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to apply leave");
    } finally {
      setIsLoading(false);
    }
  };

  const totalLeaveBalance =
    leaveBalance?.el_balance +
    leaveBalance?.cl_balance +
    leaveBalance?.sl_balance;
  console.log(totalLeaveBalance);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          padding: 0,
        },
      }}
      fullWidth
    >
      <CustomBox customClasses="p-6 flex flex-col gap-y-3">
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
          {/* Leave Duration */}
          <div className="flex flex-row ite"></div>
          <Controller
            control={control}
            name="leaveDuration"
            render={({ field }) => (
              <Autocomplete
                disablePortal
                options={leaveDurations}
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
          {leaveDuration !== "short_leave" && (
            <Controller
              control={control}
              name="leaveType"
              rules={{
                required: "Leave type is required",
                validate: (value) => {
                  if (value === "Causal Leave" && !canSelectCasual()) {
                    return "Insufficient leave balance for casual leave";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <Autocomplete
                  disablePortal
                  options={leaveTypes}
                  disableClearable
                  freeSolo={false}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value)}
                  getOptionDisabled={(option) => {
                    if (option === "Causal Leave") {
                      return !canSelectCasual();
                    }
                    return false;
                  }}
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
                      helperText={
                        !canSelectCasual() && leaveType === 'Causal Leave'
                          ? "Insufficient leave balance for casual leave"
                          : ""
                      }
                      error={!canSelectCasual() && leaveType === 'Causal Leave'}
                    />
                  )}
                />
              )}
            />
          )}
          {/* Date Pickers */}
          {(leaveDuration === "half_day" ||
            leaveDuration === "short_leave") && (
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <PickerInput
                  label="Start Date"
                  value={field.value}
                  setValue={field.onChange}
                  errorMessage={getError(errors.date)}
                />
              )}
            />
          )}
          {/* Half Day */}
          {leaveDuration === "half_day" && (
            <Controller
              control={control}
              name="half"
              render={({ field }) => (
                <Autocomplete
                  disablePortal
                  options={HalfDay}
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
          {leaveDuration === "short_leave" && (
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
          {/* Full Day Date Pickers */}
          {leaveDuration === "full_day" && (
            <>
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
            </>
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

          <Button
            variant="contained"
            onClick={handleSubmit(
              leave?.id ? handleUpdateLeave : handleApplyLeave
            )}
          >
            {leave?.id ? "Update" : "Create Leave"}
          </Button>
        </div>
      </CustomBox>
    </Dialog>
  );
};

export default CreateLeaveDialog;
