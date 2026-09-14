/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Autocomplete, Dialog, IconButton, TextField } from "@mui/material";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import { CgClose } from "react-icons/cg";
import { FaCheck, FaTimes } from "react-icons/fa";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import { type ILeaveDay, type ILeaveRequest } from "../../leaves.types";
import { Controller, useForm } from "react-hook-form";
import { getLeaveCategoryTitle, getLeaveTypeTitle } from "../../utils";
import dayjs from "dayjs";
import { convertTo12HourFormat } from "../../../../utils/timeUtils";
import FormTextInput from "../../../../shared/components/formInput/FormInput";
import { getError } from "../../../../utils/utils";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import axios from "axios";
import { endpoints } from "../../../../api/endpoints";
import { useSelector } from "react-redux";
import { userInState } from "../../../auth/authSlice";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import { toast } from "react-toastify";

interface LeaveRequestFormValues {
  leaveDay: ILeaveDay[];
  decline_reason: string;
}

const LeaveRequestDialog = ({
  open,
  onClose,
  leave,
  onSuccess,
}: {
  open: boolean;
  leave?: ILeaveRequest;
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const leaveOptions = ["CL", "EL", "SL", "un-paid"].map((type) => ({
    label: getLeaveTypeTitle(type as "CL" | "EL" | "SL" | "un-paid"),
    value: type,
  }));

  const {
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
    handleSubmit,
    getValues,
  } = useForm<LeaveRequestFormValues>({
    defaultValues: {
      leaveDay: [],
      decline_reason: "",
    },
  });

  const { setIsLoading } = useLoadingWrapper();
  const user = useSelector(userInState);

  // Initialize form whenever leave changes or dialog opens
  useEffect(() => {
    if (open && leave) {
      const initialDays: ILeaveDay[] =
        leave.leave_days && leave.leave_days.length > 0
          ? leave.leave_days.map((day) => ({
              ...day,
              approval_status:
                day.editable === false
                  ? "approved"
                  : (day.approval_status ?? "approved"),
              leave_type: day.leave_type || leave.leave_type || "CL",
            }))
          : [
              {
                day: dayjs(leave.start_date).format("ddd"),
                date: leave.start_date || dayjs().format("YYYY-MM-DD"),
                duration:
                  leave.leave_category === "short_leave"
                    ? 0.25
                    : leave.leave_category === "half_day"
                      ? 0.5
                      : 1,
                editable: true,
                leave_type: leave.leave_type || "CL",
                approval_status: "approved",
              },
            ];

      reset({
        leaveDay: initialDays,
        decline_reason: leave.decline_reason || "",
      });
    }
  }, [open, leave, reset]);

  const watchedLeaveDays = watch("leaveDay") || [];

  // Determine if this is a multi-day full-day leave
  const isMultiDay =
    leave?.leave_category === "full_day" &&
    ((watchedLeaveDays && watchedLeaveDays.length > 1) ||
      (Boolean(leave?.start_date && leave?.end_date) &&
        leave.start_date !== leave.end_date));

  const editableDays = watchedLeaveDays.filter(
    (d) => d.editable !== false && d.leave_type !== "Holiday",
  );
  const approvedDays = watchedLeaveDays.filter(
    (d) =>
      (d.approval_status ?? "approved") === "approved" &&
      d.leave_type !== "Holiday",
  );
  const declinedDays = watchedLeaveDays.filter(
    (d) => d.approval_status === "declined",
  );

  const isAllApproved =
    editableDays.length > 0 && approvedDays.length === editableDays.length;
  const isAllDeclined =
    editableDays.length > 0 && declinedDays.length === editableDays.length;
  const isPartial = isMultiDay && approvedDays.length > 0 && declinedDays.length > 0;

  // Batch action handlers
  const handleApproveAll = () => {
    const updated = watchedLeaveDays.map((day) =>
      day.editable !== false && day.leave_type !== "Holiday"
        ? { ...day, approval_status: "approved" as const }
        : day,
    );
    setValue("leaveDay", updated, { shouldValidate: true, shouldDirty: true });
  };

  const handleDeclineAll = () => {
    const updated = watchedLeaveDays.map((day) =>
      day.editable !== false && day.leave_type !== "Holiday"
        ? { ...day, approval_status: "declined" as const }
        : day,
    );
    setValue("leaveDay", updated, { shouldValidate: true, shouldDirty: true });
  };

  const handleToggleDayStatus = (
    index: number,
    newStatus: "approved" | "declined",
  ) => {
    const updated = [...watchedLeaveDays];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        approval_status: newStatus,
      };
      setValue("leaveDay", updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleLeaveAction = async () => {
    if (!leave?.id) return;
    const { leaveDay, decline_reason } = getValues();

    const currentEditableDays = leaveDay.filter(
      (d) => d.editable !== false && d.leave_type !== "Holiday",
    );
    const currentApprovedDays = leaveDay.filter(
      (d) =>
        (d.approval_status ?? "approved") === "approved" &&
        d.leave_type !== "Holiday",
    );
    const currentDeclinedDays = leaveDay.filter(
      (d) => d.approval_status === "declined",
    );

    const willBeAllDeclined =
      currentEditableDays.length > 0 &&
      currentDeclinedDays.length === currentEditableDays.length;

    const apiStatus = willBeAllDeclined ? "declined" : "approved";

    const payload = {
      status: apiStatus,
      decline_reason: decline_reason || "",
      days: leaveDay.map((day) => ({
        date: dayjs(day.date).format("YYYY-MM-DD"),
        leave_type: day.leave_type,
        approval_status:
          day.editable === false
            ? "approved"
            : (day.approval_status ?? "approved"),
      })),
    };

    try {
      setIsLoading(true);
      await axios.put(endpoints.hrApproveleave(leave.id), payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (willBeAllDeclined) {
        toast.success("Leave request declined successfully");
      } else if (
        isMultiDay &&
        currentApprovedDays.length > 0 &&
        currentDeclinedDays.length > 0
      ) {
        toast.success(
          `Leave partially approved: ${currentApprovedDays.length} approved, ${currentDeclinedDays.length} declined`,
        );
      } else {
        toast.success("Leave approved successfully");
      }

      onSuccess?.();
      reset();
      onClose();
    } catch (error: any) {
      console.error("Failed to update leave status", error);
      const errMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to update leave status";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine submit button label
  const getSubmitButtonLabel = () => {
    if (isAllDeclined) {
      return "Decline Leave";
    }
    if (isPartial) {
      return `Submit Partial Approval (${approvedDays.length}/${editableDays.length} Days)`;
    }
    return "Approve Leave";
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          padding: 0,
          maxHeight: "90vh",
          overflowY: "auto",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        },
        "& .MuiDialog-paper::-webkit-scrollbar": {
          display: "none",
        },
      }}
      fullWidth
    >
      <CustomBox customClasses="w-full h-full p-6 flex flex-col gap-y-3">
        <div className="w-full flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="text-xl font-semibold">Leave Request</h4>
            {isMultiDay && isPartial && (
              <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-300">
                Partially Approved ({approvedDays.length} Approved,{" "}
                {declinedDays.length} Declined)
              </span>
            )}
            {isMultiDay && isAllApproved && editableDays.length > 0 && (
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold border border-green-300">
                All Days Approved ({approvedDays.length}{" "}
                {approvedDays.length === 1 ? "Day" : "Days"})
              </span>
            )}
            {isMultiDay && isAllDeclined && editableDays.length > 0 && (
              <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold border border-red-300">
                All Days Declined ({declinedDays.length}{" "}
                {declinedDays.length === 1 ? "Day" : "Days"})
              </span>
            )}
          </div>
          <IconButton
            onClick={() => {
              reset();
              onClose();
            }}
          >
            <CgClose className="text-black" size={26} />
          </IconButton>
        </div>
        <LinearGradient customClasses=" " />
        <div className="w-full flex flex-col gap-y-5 mt-3">
          <TextField
            disabled
            label="Employee"
            value={leave?.user?.data?.attributes?.username || "N/A"}
          />
          <TextField disabled label="Title" value={leave?.title || "N/A"} />
          <div className="w-full flex flex-row items-center-safe gap-x-5">
            <TextField
              fullWidth
              disabled
              label="Leave Category"
              value={getLeaveCategoryTitle(leave?.leave_category ?? "")}
            />
            {leave?.leave_category !== "short_leave" && (
              <TextField
                fullWidth
                disabled
                label="Leave Type"
                value={getLeaveTypeTitle(leave?.leave_type)}
              />
            )}
          </div>

          {/* Date Pickers for Half Day or Short Leave */}
          {(leave?.leave_category === "half_day" ||
            leave?.leave_category === "short_leave") && (
            <div className="flex flex-row items-start gap-x-5 w-full">
              <TextField
                fullWidth
                disabled
                label="Date"
                value={dayjs(leave.start_date).format("DD/MM/YYYY")}
              />
              {/* Half Day */}
              {leave?.leave_category === "half_day" && (
                <TextField
                  fullWidth
                  disabled
                  label="Which Half"
                  value={
                    leave.half_day_type === "first_half"
                      ? "First Half"
                      : "Second Half"
                  }
                />
              )}
              {/* Short Leave Start Time */}
              {leave?.leave_category === "short_leave" && (
                <TextField
                  fullWidth
                  disabled
                  label="Start Time"
                  value={convertTo12HourFormat(leave.start_time ?? "")}
                />
              )}
            </div>
          )}

          {/* Full Day Date Pickers */}
          {leave?.leave_category === "full_day" && (
            <div className="flex flex-row items-start gap-x-5 w-full">
              <TextField
                fullWidth
                disabled
                label="Start Date"
                value={dayjs(leave.start_date).format("DD/MM/YYYY")}
              />
              <TextField
                fullWidth
                disabled
                label="End Date"
                value={dayjs(leave.end_date).format("DD/MM/YYYY")}
              />
            </div>
          )}

          <TextField
            multiline
            minRows={3}
            disabled
            label="Description"
            value={leave?.description || "N/A"}
          />
          {/* Leave Days Table with Day-wise Partial Approval Actions */}
          {watchedLeaveDays.length > 0 && (
            <div className="w-full flex flex-col gap-y-2">
              <div className="flex flex-row items-center justify-between px-1">
                <span className="text-sm font-semibold text-gray-700">
                  Day-by-Day Approval Breakdown
                </span>
                {editableDays.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApproveAll}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition duration-150 cursor-pointer"
                    >
                      Approve All Days
                    </button>
                    <button
                      type="button"
                      onClick={handleDeclineAll}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red hover:bg-red-100 border border-red-200 transition duration-150 cursor-pointer"
                    >
                      Decline All Days
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="col-span-3">Date</div>
                  <div className="col-span-2">Day</div>
                  {leave?.leave_category !== "short_leave" ? (
                    <>
                      <div className="col-span-4">Leave Type</div>
                      <div className="col-span-3 text-center">Action</div>
                    </>
                  ) : (
                    <div className="col-span-7 text-center">Action</div>
                  )}
                </div>

                {/* Table Rows */}
                {watchedLeaveDays.map((day, index) => {
                  const isHoliday =
                    day.leave_type === "Holiday" || day.editable === false;
                  const isDeclined = day.approval_status === "declined";

                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-12 px-4 py-3 items-center border-t border-gray-200 transition-colors ${
                        isDeclined
                          ? "bg-red-50/40"
                          : isHoliday
                            ? "bg-gray-50/50"
                            : "bg-white"
                      }`}
                    >
                      {/* Date */}
                      <div className="col-span-3 text-sm font-medium text-gray-800">
                        {dayjs(day.date).format("DD/MM/YYYY")}
                      </div>

                      {/* Day */}
                      <div className="col-span-2 text-sm text-gray-600">
                        {day.day}
                      </div>

                      {/* Leave Type */}
                      {leave?.leave_category !== "short_leave" && (
                        <div className="col-span-4 pr-3">
                          {isHoliday ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                              Holiday
                            </span>
                          ) : (
                            <Controller
                              control={control}
                              name={`leaveDay.${index}.leave_type`}
                              rules={{ required: "Leave type is required" }}
                              render={({ field, fieldState }) => (
                                <Autocomplete
                                  fullWidth
                                  options={leaveOptions}
                                  getOptionLabel={(option) => option.label}
                                  disableClearable
                                  freeSolo={false}
                                  slotProps={{
                                    popper: {
                                      placement: "top-start",
                                      modifiers: [
                                        {
                                          name: "flip",
                                          enabled: true,
                                          options: {
                                            fallbackPlacements: [
                                              "top-start",
                                              "bottom-start",
                                            ],
                                          },
                                        },
                                        {
                                          name: "preventOverflow",
                                          enabled: true,
                                          options: {
                                            boundary: "clippingParents",
                                            padding: 8,
                                          },
                                        },
                                      ],
                                      sx: { zIndex: 1400 },
                                    },
                                  }}
                                  value={
                                    leaveOptions.find(
                                      (opt) => opt.value === field.value,
                                    ) || undefined
                                  }
                                  onChange={(_, option) =>
                                    field.onChange(option?.value || "")
                                  }
                                  disabled={isDeclined}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      size="small"
                                      label="Leave Type"
                                      variant="outlined"
                                      fullWidth
                                      error={!!fieldState.error}
                                      helperText={fieldState.error?.message}
                                      sx={{
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: "8px",
                                        },
                                      }}
                                    />
                                  )}
                                />
                              )}
                            />
                          )}
                        </div>
                      )}

                      {/* Day Action Buttons (Approve / Decline) */}
                      <div
                        className={`${
                          leave?.leave_category !== "short_leave"
                            ? "col-span-3"
                            : "col-span-7"
                        } flex justify-center`}
                      >
                        {isHoliday ? (
                          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                            Non-Editable
                          </span>
                        ) : (
                          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-100">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleDayStatus(index, "approved")
                              }
                              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition duration-150 cursor-pointer ${
                                !isDeclined
                                  ? "bg-green text-white shadow-xs"
                                  : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                              }`}
                            >
                              <FaCheck size={11} />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleDayStatus(index, "declined")
                              }
                              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition duration-150 cursor-pointer ${
                                isDeclined
                                  ? "bg-red text-white shadow-xs"
                                  : "text-gray-600 hover:text-red hover:bg-red-50"
                              }`}
                            >
                              <FaTimes size={11} />
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Decline reason field (required if all declined, optional if partially approved) */}
          {declinedDays.length > 0 && (
            <Controller
              control={control}
              name="decline_reason"
              rules={{
                required: isAllDeclined
                  ? "Decline reason is required when declining leave"
                  : false,
              }}
              render={({ field }) => (
                <FormTextInput
                  multiline
                  minRows={2}
                  name="decline_reason"
                  variant="outlined"
                  label={
                    isAllDeclined
                      ? "Decline Reason *"
                      : "Reason for Partial Decline (Optional)"
                  }
                  placeholder={
                    isAllDeclined
                      ? "Why decline this leave? Please share the reason..."
                      : "Optional reason for declining specific days..."
                  }
                  value={field.value}
                  onChange={field.onChange}
                  errorMessage={getError(errors.decline_reason)}
                />
              )}
            />
          )}
        </div>

        <LinearGradient customClasses=" " />
        <div className="w-full flex flex-row gap-x-4 justify-end">
          <CustomButton
            type="reset"
            label="Cancel"
            buttonStyle="secondary"
            onClick={() => {
              reset();
              onClose();
            }}
          />
          <CustomButton
            type="submit"
            label={getSubmitButtonLabel()}
            buttonStyle={isAllDeclined ? "secondary" : "primary"}
            customStyles={
              isAllDeclined ? "!bg-red !text-white hover:!bg-red-700" : ""
            }
            onClick={handleSubmit(handleLeaveAction)}
          />
        </div>
      </CustomBox>
    </Dialog>
  );
};

export default LeaveRequestDialog;

