import { Dialog, IconButton } from "@mui/material";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import dayjs from "dayjs";
import { convertTo12HourFormat } from "../../../../utils/timeUtils";
import {
  getLeaveCategoryTitle,
  getLeaveTypeTitle,
  isLeavePartiallyApproved,
} from "../../utils";
import { getLeaveStatusColor } from "../../../../utils/utils";
import { useGetLeavesDetialsQuery } from "../../leavesApi";
import type { ILeaveDay } from "../../leaves.types";
import { CgClose } from "react-icons/cg";

const LeaveDetailsDialog = ({
  open,
  onClose,
  leaveId,
}: {
  open: boolean;
  leaveId: string;
  onClose: () => void;
}) => {
  const { data, isFetching } = useGetLeavesDetialsQuery(leaveId);

  const leaveDays = data?.leave_days ?? [];
  const isPartial = isLeavePartiallyApproved(data);
  const displayStatus = isPartial
    ? "Partially Approved"
    : (data?.status ?? "pending");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
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
    >
      {isFetching ? (
        <CustomBox customClasses="p-5 w-full h-full flex flex-col gap-y-3">
          <div className="flex flex-row items-center justify-between">
            <div className="w-40 h-6 animate-pulse bg-black-20/60 rounded" />
            <div className="w-10 h-6 animate-pulse bg-black-20/60 rounded-xl" />
          </div>
          <div className="w-full h-1 animate-pulse bg-black-20/60 rounded" />
          <div className="flex flex-col gap-y-1.5">
            <div className="w-[30%] h-4 animate-pulse bg-black-20/60 rounded" />
            <div className="w-full h-6 animate-pulse bg-black-20/60 rounded" />
          </div>
          <div className="flex flex-col gap-y-1.5">
            <div className="w-[30%] h-4 animate-pulse bg-black-20/60 rounded" />
            <div className="w-full h-6 animate-pulse bg-black-20/60 rounded" />
            <div className="w-[70%] h-6 animate-pulse bg-black-20/60 rounded" />
          </div>
          <div className="w-[50%] h-4 animate-pulse bg-black-20/60 rounded" />
          <div className="w-full h-6 animate-pulse bg-black-20/60 rounded" />
          <div className="w-full h-6 animate-pulse bg-black-20/60" />
        </CustomBox>
      ) : (
        <CustomBox customClasses="p-6 w-full h-full flex flex-col gap-y-3.5">
          <div className="w-full flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <h6 className="font-semibold text-xl">Leave Details</h6>
              <span
                className={`${getLeaveStatusColor(
                  isPartial
                    ? "partially_approved"
                    : (data?.status ?? "pending"),
                )} text-xs py-1.5 px-3.5 rounded-full font-semibold`}
              >
                {displayStatus}
              </span>
            </div>
            <IconButton onClick={onClose}>
              <CgClose className="text-black" size={24} />
            </IconButton>
          </div>
          <LinearGradient />
          <div className="flex flex-col gap-y-0.5">
            <span className="text-black-80 text-sm font-semibold">Title</span>
            <p className="text-base">{data?.title || "N/A"}</p>
          </div>
          <div className="flex flex-col gap-y-0.5">
            <span className="text-black-80 text-sm font-semibold">
              Description
            </span>
            <p className="text-base">{data?.description || "N/A"}</p>
          </div>
          <LinearGradient />
          <div className="w-full flex flex-row flex-wrap items-start gap-y-3">
            <div className="w-[60%] flex flex-col gap-y-0.5">
              <span className="text-black-80 text-sm font-semibold">
                Leave category
              </span>
              <p className="text-base capitalize">
                {getLeaveCategoryTitle(data?.leave_category ?? "")}
              </p>
            </div>
            <div className="w-[40%] flex flex-col gap-y-0.5">
              <span className="text-black-80 text-sm font-semibold">
                Leave Type
              </span>
              <p className="text-base capitalize">
                {getLeaveTypeTitle(
                  data?.leave_type as "CL" | "EL" | "SL" | "un-paid",
                )}
              </p>
            </div>
            {data?.leave_category === "short_leave" && (
              <div className="w-[50%] flex flex-col gap-y-0.5">
                <span className="text-black-50 text-sm font-medium">
                  Start Time
                </span>
                <p className="text-base capitalize">
                  {convertTo12HourFormat(data.start_time ?? "")}
                </p>
              </div>
            )}
            {data?.leave_category === "half_day" && (
              <div className="flex flex-col gap-y-0.5">
                <span className="text-black-50 text-sm font-medium">
                  Which Half?
                </span>
                <p className="text-base capitalize">
                  {data.half_day_type === "second_half"
                    ? "Second Half"
                    : "First Half"}
                </p>
              </div>
            )}
          </div>

          <div className="w-full flex flex-row items-start">
            <div className="w-[60%] flex flex-col gap-y-0.5">
              <span className="text-black-80 text-sm font-semibold">
                Start Date & End Date
              </span>
              <p className="text-base">
                {dayjs(data?.start_date).format("DD MMM, YYYY")} &nbsp; & &nbsp;
                {dayjs(data?.end_date).format("DD MMM, YYYY")}
              </p>
            </div>
            {data?.leave_category !== "short_leave" && (
              <div className="flex flex-col gap-y-0.5">
                <span className="text-black-80 text-sm font-semibold">
                  Approved Leave Days
                </span>
                <p className="text-base font-medium">{data?.days ?? 1} Days</p>
              </div>
            )}
          </div>

          {/* Leaves Breakdown Table */}
          {leaveDays && leaveDays.length > 0 && (
            <>
              <LinearGradient />
              <div className="flex flex-row items-center justify-between">
                <span className="text-black-80 text-sm font-semibold">
                  Leaves Breakdown ({leaveDays.length}{" "}
                  {leaveDays.length === 1 ? "Day" : "Days"})
                </span>
              </div>
              <div className="w-full border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="col-span-3">Date</div>
                  <div className="col-span-3">Day</div>
                  <div className="col-span-3">Leave Type</div>
                  <div className="col-span-3 text-center">Status</div>
                </div>

                {leaveDays.map((day: ILeaveDay, idx: number) => {
                  const isHoliday =
                    day.leave_type === "Holiday" || day.editable === false;
                  const isDeclined = day.approval_status === "declined";
                  const isApproved =
                    day.approval_status === "approved" ||
                    (!day.approval_status && data?.status === "approved");

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 px-4 py-3 items-center border-t border-gray-200 ${
                        isDeclined ? "bg-red-50/30" : "bg-white"
                      }`}
                    >
                      {/* Date */}
                      <div className="col-span-3 text-sm font-medium text-gray-800">
                        {dayjs(day.date).format("DD/MM/YYYY")}
                      </div>

                      {/* Day */}
                      <div className="col-span-3 text-sm text-gray-600">
                        {day.day}
                      </div>

                      {/* Leave Type */}
                      <div className="col-span-3 text-sm text-gray-800">
                        {isHoliday
                          ? "Holiday"
                          : getLeaveTypeTitle(
                              day.leave_type as "CL" | "EL" | "SL" | "un-paid",
                            )}
                      </div>

                      {/* Status */}
                      <div className="col-span-3 flex justify-center">
                        {isHoliday ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                            Holiday
                          </span>
                        ) : isDeclined ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red font-semibold">
                            Declined
                          </span>
                        ) : isApproved ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green font-semibold">
                            Approved
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[#7F41DF29] text-[#7F41DF] font-semibold">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {data?.decline_reason && (
            <>
              <LinearGradient />
              <div className="flex flex-col gap-y-0.5">
                <span className="text-black-80 text-sm font-semibold">
                  Decline Reason / Note
                </span>
                <p className="text-base text-gray-800">
                  {data?.decline_reason}
                </p>
              </div>
            </>
          )}
        </CustomBox>
      )}
    </Dialog>
  );
};

export default LeaveDetailsDialog;
