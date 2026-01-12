import { Dialog } from "@mui/material";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import dayjs from "dayjs";
import { convertTo12HourFormat } from "../../../../utils/timeUtils";
import { getLeaveCategoryTitle, getLeaveTypeTitle } from "../../utils";
import { getLeaveStatusColor } from "../../../../utils/utils";
import { useGetLeavesDetialsQuery } from "../../leavesApi";
import type { ILeaveDay } from "../../leaves.types";

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

  const hasDifferentLeaveTypes = leaveDays.some(
    (day: ILeaveDay) => day.leave_type !== leaveDays[0]?.leave_type
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
        },
      }}
    >
      {isFetching ? (
        <CustomBox customClasses="p-5 w-[550px] h-full flex flex-col gap-y-3">
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
        <CustomBox customClasses="p-5 w-[550px] h-full flex flex-col gap-y-3">
          <div className="w-full flex flex-row items-center-safe justify-between">
            <h6 className="font-semibold text-xl">Leave Details</h6>
            <span
              className={`${getLeaveStatusColor(
                data?.status ?? "pending"
              )} text-xs py-1.5 px-3 rounded-full`}
            >
              {data?.status}
            </span>
          </div>
          <LinearGradient />
          <div className="flex flex-col gap-y-0.5">
            <span className="text-black-80 text-sm font-semibold">Title</span>
            <p className="text-base">{data?.title}</p>
          </div>
          <div className="flex flex-col gap-y-0.5">
            <span className="text-black-80 text-sm font-semibold">
              Description
            </span>
            <p className="text-base">{data?.description}</p>
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
                  data?.leave_type as "CL" | "EL" | "SL" | "un-paid"
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
                  {data.half_day_type ? "First Half" : "Second Half"}
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
            <div className="flex flex-col gap-y-0.5">
              <span className="text-black-80 text-sm font-semibold">
                Leave Days
              </span>
              <p className="text-base">{data?.days ?? 1}</p>
            </div>
          </div>
          {hasDifferentLeaveTypes &&
            leaveDays?.length > 1 &&
            data?.status === "approved" && (
              <>
                <LinearGradient />
                <span className="text-black-80 text-sm font-semibold">
                  Leaves Breakdown
                </span>
                <div className="w-full border border-gray-200 rounded-xl overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-3 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
                    <div>Date</div>
                    <div>Day</div>
                    <div>Leave Type</div>
                  </div>

                  {leaveDays.map((day: ILeaveDay, idx: number) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 px-4 py-3 items-center border-t border-gray-200"
                    >
                      {/* Date */}
                      <div className="text-sm text-gray-800">
                        {dayjs(day.date).format("DD/MM/YYYY")}
                      </div>

                      {/* Day */}
                      <div className="text-sm text-gray-800">{day.day}</div>

                      {/* Leave Type */}
                      <div className="text-sm text-gray-800">
                        {getLeaveTypeTitle(
                          day.leave_type as "CL" | "EL" | "SL" | "un-paid"
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          {data?.decline_reason && (
            <>
              <LinearGradient />
              <div className="flex flex-col gap-y-0.5">
                <span className="text-black-80 text-sm font-semibold">
                  Decline Reason
                </span>
                <p className="text-base">{data?.decline_reason}</p>
              </div>
            </>
          )}
        </CustomBox>
      )}
    </Dialog>
  );
};

export default LeaveDetailsDialog;
