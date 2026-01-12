/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetLeaveRequestsQuery } from "../../../leaves/leavesApi";
import {
  selectLeaveRequests,
  setLeaveRequests,
} from "../../screens/dashboardHrSlice";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import EmployeeTableRow from "../../../employee/components/employeeTableRow/EmployeeTableRow";
import { formatDateToReadable } from "../../../../utils/utils";
import dayjs from "dayjs";
import { getLeaveCategoryTitle } from "../../../leaves/utils";

const LeaveRequest = () => {
  const dispatch = useDispatch();

  /* ===================== API ===================== */
  const { data: leaveRequests, isLoading } = useGetLeaveRequestsQuery(
    undefined,
    {
      refetchOnFocus: true,
    }
  );
  const leaveRequestsFromStore = useSelector(selectLeaveRequests);

  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    if (leaveRequests?.data) {
      dispatch(setLeaveRequests(leaveRequests.data));
    }
  }, [leaveRequests?.data]);

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
          {getLeaveCategoryTitle(row.leave_category)}
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
    </div>
  );
};

export default LeaveRequest;
