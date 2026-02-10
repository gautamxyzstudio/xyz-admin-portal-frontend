/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import { useGetLeaveRequestsQuery } from "../../leavesApi";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLeaveRequests,
  setLeaveRequests,
} from "../../../dashboard/screens/dashboardHrSlice";
import type { GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { getLeaveCategoryTitle } from "../../utils";
import type { ILeaveRequest } from "../../leaves.types";
import LeaveRequestDialog from "../../components/leaveRequestsDialog/LeaveRequestDialog";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { useNavigate } from "react-router";

const LeaveRequestsHr = ({
  onLeaveActionSuccess,
}: {
  onLeaveActionSuccess: () => void;
}) => {
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [leaveReqData, setLeaveReqData] = useState<ILeaveRequest | null>();
  const navigate = useNavigate()
  /* ===================== API ===================== */
  const {
    data: leaveRequests,
    isLoading,
    refetch,
    isFetching,
  } = useGetLeaveRequestsQuery(undefined, {
    refetchOnFocus: true,
  });
  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    if (leaveRequests?.data) {
      dispatch(setLeaveRequests(leaveRequests.data));
    }
    refetch();
  }, [leaveRequests?.data, refetch]);

  const leaveRequestsFromStore = useSelector(selectLeaveRequests);

  const refetchLeaveList = () => {
    refetch();
    onLeaveActionSuccess();
  };

  /* ===================== TABLE COLUMNS ===================== */
  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Applied Date",
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
      width: 80,
      renderCell: (params) => {
        return (
          <span
            className="bg-primary-20 text-xs text-primary px-3 py-1.25 rounded-full"
            onClick={() => {
              setOpenModal(true);
              setLeaveReqData(params.row);
            }}
          >
            Open
          </span>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <CustomBox customClasses="w-full h-full flex flex-col gap-y-5 px-5 py-6">
        <div className="w-full flex flex-row items-center justify-between">
          <div className=" flex flex-row items-center-safe gap-x-2.5">
            <span className="text-2xl font-semibold">Leaves Request</span>{" "}
            <span className="text-sm px-3 py-2 bg-background rounded-full">
              {leaveRequestsFromStore.length === 0
                ? "No Leave Requests"
                : ` ${String(leaveRequestsFromStore.length).padStart(
                    2,
                    "0",
                  )} New Requests`}
            </span>
          </div>
          <CustomButton
            label="Leave Balances"
            onClick={() => navigate('/all-leaves/leave-balance')}
            buttonStyle="primary"
          />
        </div>
        <div className="w-full h-60">
          <CustomDataTable
            rows={leaveRequestsFromStore || []}
            columns={columns}
            isLoading={isLoading || isFetching}
            isDataEmpty={!leaveRequestsFromStore?.length}
            emptyViewTitle="No leave requests found"
            emptyViewSubTitle="There are no pending leave requests"
            withPagination={false}
          />
        </div>
      </CustomBox>

      {leaveReqData && (
        <LeaveRequestDialog
          open={openModal}
          leave={leaveReqData}
          onClose={() => setOpenModal(false)}
          onSuccess={refetchLeaveList}
        />
      )}
    </React.Fragment>
  );
};

export default LeaveRequestsHr;
