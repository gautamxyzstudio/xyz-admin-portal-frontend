import { Autocomplete, Dialog, IconButton, TextField } from "@mui/material";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import { CgClose } from "react-icons/cg";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import {
  statusList,
  type ILeaveDay,
  type ILeaveRequest,
  type UIStatus,
} from "../../leaves.types";
import { Controller, useForm } from "react-hook-form";
import {
  getLeaveCategoryTitle,
  getLeaveTypeTitle,
  mapStatusToUI,
} from "../../utils";
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

const buildLeaveApprovalPayload = (
  status: UIStatus,
  leaveDays: ILeaveDay[],
  decline_reason: string
) => {
  const apiStatus = status === "Approved" ? "approved" : "declined";

  return {
    status: apiStatus,
    decline_reason: decline_reason,
    days: leaveDays
      .filter((day) => day.leave_type !== "Holiday")
      .map((day) => ({
        date: dayjs(day.date).format("YYYY-MM-DD"),
        leave_type: day.leave_type,
        approval_status: apiStatus,
      })),
  };
};

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
    handleSubmit,
    getValues,
  } = useForm<{
    status: UIStatus;
    leaveDay: ILeaveDay[];
    decline_reason: string;
  }>({
    defaultValues: {
      status: mapStatusToUI(leave?.status),
      leaveDay: leave?.leave_days,
      decline_reason: "",
    },
  });
  const status = watch("status");
  const { setIsLoading } = useLoadingWrapper();
  const user = useSelector(userInState);

  const handleLeaveAction = async () => {
    if (!leave?.id) return;
    const { status, leaveDay, decline_reason } = getValues();
    const payload = buildLeaveApprovalPayload(status, leaveDay, decline_reason);

    try {
      setIsLoading(true);
      await axios.put(endpoints.hrApproveleave(leave.id), payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      onSuccess?.();
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to update leave status", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
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
      fullWidth
    >
      <CustomBox customClasses="w-full h-full p-6 flex flex-col gap-y-3">
        <div className="w-full flex flex-row items-center justify-between">
          <h4 className="text-xl font-semibold">Leave Request</h4>
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
            value={leave?.user.data.attributes.username}
          />
          <TextField disabled label="Title" value={leave?.title} />
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
          {/* Date Pickers */}
          {(leave?.leave_category === "half_day" ||
            leave?.leave_category === "short_leave") && (
            <div className="flex flex-row items-start gap-x-5 w-full">
              {(leave?.leave_category === "half_day" ||
                leave?.leave_category === "short_leave") && (
                <TextField
                  fullWidth
                  disabled
                  label="Start Date"
                  value={dayjs(leave.start_date).format("DD/MM/YYYY")}
                />
              )}
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
              {/* Short Leave Time Picker */}
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
                label="Start Date"
                value={dayjs(leave.end_date).format("DD/MM/YYYY")}
              />
            </div>
          )}
          <TextField
            multiline
            minRows={3}
            disabled
            label="Description"
            value={leave?.description}
          />
          {/* Leave Days Table */}
          {watch("leaveDay").length > 0 && (
            <div className="w-full border border-gray-200 rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
                <div>Date</div>
                <div>Day</div>
                <div>Leave Type</div>
              </div>

              {/* Table Rows */}
              {leave?.leave_days.map((day, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 px-4 py-3 items-center border-t border-gray-200"
                >
                  {/* Date */}
                  <div className="text-sm text-gray-800">
                    {dayjs(day.date).format("DD/MM/YYYY")}
                  </div>

                  {/* Day */}
                  <div className="text-sm text-gray-800">{day.day}</div>

                  {/* Leave Type */}
                  <div>
                    <Controller
                      control={control}
                      name={`leaveDay.${index}.leave_type`}
                      rules={{ required: "Leave type is required" }}
                      render={({ field, fieldState }) => (
                        <Autocomplete
                          fullWidth
                          disablePortal
                          options={leaveOptions}
                          getOptionLabel={(option) => option.label}
                          disableClearable
                          freeSolo={false}
                          value={
                            leaveOptions.find(
                              (opt) => opt.value === field.value
                            ) || undefined
                          }
                          onChange={(_, option) =>
                            field.onChange(option?.value || "")
                          }
                          disabled={day.leave_type === "Holiday"}  
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
                                minWidth: 120,
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "9999px",
                                },
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Controller
            control={control}
            name="status"
            rules={{
              required: "Status is required",
            }}
            render={({ field, fieldState }) => (
              <Autocomplete
                fullWidth
                disablePortal
                options={statusList}
                disableClearable
                freeSolo={false}
                value={field.value}
                onChange={(_, value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
                getOptionDisabled={(option) => {
                  if (option === "Pending") {
                    return true;
                  }
                  return false;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Status"
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
          {status === "Declined" && (
            <Controller
              control={control}
              name="decline_reason"
              rules={{
                required: "Decline reason is required, if leave is declined",
              }}
              render={({ field }) => (
                <FormTextInput
                  multiline
                  minRows={2}
                  name="decline_reason"
                  variant="outlined"
                  label="Decline Reason"
                  placeholder="Why decline leave? Please share the reason"
                  value={field.value}
                  onChange={field.onChange}
                  errorMessage={getError(errors.decline_reason)}
                />
              )}
            />
          )}
        </div>
        <LinearGradient customClasses=" " />
        <div className="w-full flex flex-row gap-x-4">
          <CustomButton
            type="submit"
            label={
              status === "Pending"
                ? "Pending"
                : status === "Approved"
                ? "Approved"
                : "Reject"
            }
            buttonStyle={status === "Pending" ? "secondary" : "primary"}
            disabled={status === "Pending"}
            onClick={handleSubmit(handleLeaveAction)}
          />
          <CustomButton
            type="reset"
            label="Cancel"
            buttonStyle="secondary"
            onClick={() => {
              reset();
              onClose();
            }}
          />
        </div>
      </CustomBox>
    </Dialog>
  );
};

export default LeaveRequestDialog;
