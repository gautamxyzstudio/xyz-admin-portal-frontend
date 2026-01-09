/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  useApproveLeaveMutation,
  useGetLeaveRequestsQuery,
  useRejectLeaveMutation,
} from "../../../leaves/leavesApi";
import { useGetEmployeeLeaveBalanceQuery } from "../../../employee/employeeApis";

import {
  approveLeaveRequest,
  rejectLeaveRequest,
  selectLeaveRequests,
  setLeaveRequests,
} from "../../screens/dashboardHrSlice";

import type { ILeave } from "../../../leaves/leaves.types";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import EmployeeTableRow from "../../../employee/components/employeeTableRow/EmployeeTableRow";

import {
  convertTo12HourFormat,
  formatDateToReadable,
  getLeaveTypeTitle,
} from "../../../../utils/utils";

import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import dayjs from "dayjs";

const LeaveRequest = () => {
  const dispatch = useDispatch();
  const { setIsLoading } = useLoadingWrapper();

  const [open, setOpen] = useState(false);
  const [selectedLeave] = useState<ILeave | null>(null);
  const [latestLeaveBalance, setLatestLeaveBalance] = useState<{
    leave_balance: number;
    unpaid_leave_balance: number;
  } | null>(null);

  /* ===================== API ===================== */
  const { data: leaveRequests, isLoading } = useGetLeaveRequestsQuery(
    undefined,
    {
      refetchOnFocus: true,
    }
  );

  const [approveLeave] = useApproveLeaveMutation();
  const [rejectLeave] = useRejectLeaveMutation();

  const leaveRequestsFromStore = useSelector(selectLeaveRequests);

  const { data: leaveBalanceData } = useGetEmployeeLeaveBalanceQuery(
    {
      id: selectedLeave?.user?.data?.id?.toString() || "",
    },
    { skip: !selectedLeave }
  );

  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    if (leaveRequests?.data) {
      dispatch(setLeaveRequests(leaveRequests.data));
    }
  }, [leaveRequests?.data]);

  useEffect(() => {
    if (leaveBalanceData) {
      setLatestLeaveBalance(leaveBalanceData);
    }
  }, [leaveBalanceData]);

  /* ===================== ACTIONS ===================== */
  const handleApprove = async (leave: ILeave) => {
    try {
      setIsLoading(true);
      await approveLeave({ id: leave.id ?? 0 }).unwrap();
      dispatch(approveLeaveRequest({ id: leave.id }));
      toast.success("Leave approved successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to approve leave");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (leave: ILeave) => {
    try {
      setIsLoading(true);
      await rejectLeave({ id: leave.id ?? 0 }).unwrap();
      dispatch(rejectLeaveRequest({ id: leave.id }));
      toast.success("Leave rejected successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to reject leave");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== TABLE COLUMNS ===================== */
  const columns = [
    {
      field: "date",
      headerName: "Date",
      width: 150,
      renderCell: ({ row }: any) => (
        <p className="text-sm font-medium">
          {formatDateToReadable(row.createdAt)}
        </p>
      ),
    },
    {
      field: "user",
      headerName: "User",
      width: 160,
      renderCell: ({ row }: any) => {
        return (
          <EmployeeTableRow
            name={row.user?.data?.attributes?.username}
            showImage={false}
            showEmail={false}
          />
        );
      },
    },

    {
      field: "title",
      headerName: "Title",
      width: 200,
      renderCell: ({ row }: any) => (
        <p className="text-sm line-clamp-2">{row.title}</p>
      ),
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      width: 160,
      renderCell: ({ row }: any) => (
        <span className="text-sm font-medium">
          {getLeaveTypeTitle(row.leave_duration)}
        </span>
      ),
    },
    {
      field: "StartDate",
      headerName: "StartDate",
      width: 150,
      renderCell: (params: any) => (
        <span>
          {params.row.start_date
            ? dayjs(params.row.start_date).format("DD/MM/YYYY")
            : ""}
        </span>
      ),
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 110,
      renderCell: (params: any) => (
        <span>
          {params.row.end_date
            ? dayjs(params.row.end_date).format("DD/MM/YYYY")
            : ""}
        </span>
      ),
    },
  ];

  /* ===================== UI ===================== */
  return (
    <div className="mt-6 w-full h-100 bg-white rounded-xl p-4 flex flex-col">
      {/* // <div className="w-full h-full mt-8   p-3 bg-white rounded-2xl  "> */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[24px] font-semibold text-black">Leave Requests</h3>

        {leaveRequestsFromStore?.length > 0 && (
          <a
            className="px-4 py-2  text-primary rounded-lg text-base font-bold cursor-pointer"
            href="/all-leaves"
          >
            View All
          </a>
        )}
      </div>

      <CustomDataTable
        rows={leaveRequestsFromStore || []}
        columns={columns}
        isLoading={isLoading}
        isDataEmpty={!leaveRequestsFromStore?.length}
        emptyViewTitle="No leave requests found"
        emptyViewSubTitle="There are no pending leave requests"
        withPagination={false}
      />

      {/* ===================== MODAL ===================== */}
      {open && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-130 max-h-[80vh] overflow-y-auto rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Leave Details</h3>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* User */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${
                  selectedLeave.user?.data?.attributes?.user_detial?.data
                    ?.attributes?.Photo?.data?.[0]?.attributes?.url ?? ""
                }`}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">
                  {selectedLeave.user?.data?.attributes?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedLeave.user?.data?.attributes?.user_type}
                </p>
              </div>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Detail
                label="Leave Balance"
                value={`${latestLeaveBalance?.leave_balance ?? 0} days`}
              />
              <Detail
                label="Unpaid Leave"
                value={`${latestLeaveBalance?.unpaid_leave_balance ?? 0} days`}
                danger
              />
            </div>

            {/* Details */}
            <div className="mt-6 space-y-3">
              <Detail label="Title" value={selectedLeave.title} />
              <Detail label="Description" value={selectedLeave.description} />
              <Detail
                label="Leave Type"
                value={getLeaveTypeTitle(selectedLeave.leave_duration)}
              />
              <Detail label="Status" value={selectedLeave.status} />
              <Detail
                label="Start Date"
                value={formatDateToReadable(selectedLeave.start_date)}
              />
              <Detail
                label="End Date"
                value={formatDateToReadable(selectedLeave.end_date)}
              />

              {selectedLeave.start_time && (
                <Detail
                  label="Start Time"
                  value={convertTo12HourFormat(selectedLeave.start_time)}
                />
              )}
            </div>

            {selectedLeave.status === "pending" && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 border rounded-lg text-sm"
                  onClick={() => handleReject(selectedLeave)}
                >
                  Reject
                </button>
                <button
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
                  onClick={() => handleApprove(selectedLeave)}
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ===================== SMALL HELPER ===================== */
const Detail = ({
  label,
  value,
  danger,
}: {
  label: string;
  value?: string;
  danger?: boolean;
}) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-sm font-medium ${danger ? "text-red-500" : ""}`}>
      {value || "-"}
    </p>
  </div>
);

export default LeaveRequest;
