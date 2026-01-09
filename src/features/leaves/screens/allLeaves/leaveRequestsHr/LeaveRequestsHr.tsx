/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import CustomBox from "../../../../../components/CustomBox/CustomBox";
import CustomDataTable from "../../../../../shared/components/customDataTable/CustomDataTable";
import { useGetLeaveRequestsQuery } from "../../../leavesApi";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLeaveRequests,
  setLeaveRequests,
} from "../../../../dashboard/screens/dashboardHrSlice";
import type { GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { getLeaveCategoryTitle } from "../../../utils";

const LeaveRequestsHr = () => {
  const dispatch = useDispatch();

  /* ===================== API ===================== */
  const { data: leaveRequests, isLoading } = useGetLeaveRequestsQuery(
    undefined,
    {
      refetchOnFocus: true,
    }
  );
  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    if (leaveRequests?.data) {
      dispatch(setLeaveRequests(leaveRequests.data));
    }
  }, [leaveRequests?.data]);

  const leaveRequestsFromStore = useSelector(selectLeaveRequests);

  /* ===================== TABLE COLUMNS ===================== */
  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      width: 100,
      renderCell: (params) => dayjs(params.row.createdAt).format("DD/MM/YYYY"),
    },
    {
      field: "user",
      headerName: "Employee Name",
      width: 160,
      renderCell: (params) => params.row.user?.data?.attributes?.username,
    },

    {
      field: "title",
      headerName: "Title",
      width: 200,
      renderCell: (params) => (
        <p className="text-sm line-clamp-2">{params.row.title}</p>
      ),
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      width: 130,
      renderCell: (params) => getLeaveCategoryTitle(params.row.leave_category),
    },
    {
      field: "action",
      headerName: "Action",
      width: 70,
      renderCell: (params) => getLeaveCategoryTitle(params.row.leave_category),
    },
  ];

  return (
    <CustomBox customClasses="w-full h-150 flex flex-col gap-y-5 px-5 pt-6">
      <div className="w-full flex flex-row items-center-safe gap-x-2.5">
        <span className="text-2xl font-semibold">Leaves Request</span>{" "}
        <span className="text-sm px-3 py-2 bg-background rounded-full">
          {String(leaveRequestsFromStore.length).padStart(2, "0")} New Requests
        </span>
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
    </CustomBox>
  );
};

export default LeaveRequestsHr;
