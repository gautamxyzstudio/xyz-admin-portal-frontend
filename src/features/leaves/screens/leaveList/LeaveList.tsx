import {
  useGetLeavesDetialsQuery,
  useGetUserLeavesQuery,
} from "../../leavesApi";
import { useSelector } from "react-redux";
import { userInState } from "../../../auth/authSlice";
import { toast } from "react-toastify";
import {
  getLeaveStatusColor,
  getLeaveTypeTitle,
} from "../../../../utils/utils";
import EmptyScreenView from "../../../../shared/components/EmptyScreenView/EmptyScreenView";
import React, { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import CustomBox from "../../../../components/CustomBox/CustomBox.js";
import StatCard from "../../../../shared/components/StatCard/StatCard.tsx";
import { Icons } from "../../../../assets/myAssets/exporter.ts";
import { useGeLeaveBalanceQuery } from "../../../employee/employeeApis.ts";
import type { ILeaveBalance } from "../../../employee/types.ts";
import StatCardSkeleton from "../../../../shared/components/StatCard/StatCardSkeleton.tsx";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable.tsx";
import CustomButton from "../../../../components/CustomButton/CustomButton.tsx";
import { TbPlus } from "react-icons/tb";
// import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { Dialog } from "@mui/material";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient.tsx";
import { convertTo12HourFormat } from "../../../../utils/timeUtils.ts";
import CreateLeaveDialog from "../createLeaveDialog/CreateLeaveDialog.tsx";

const LeaveList = () => {
  // const navigate = useNavigate();
  const user = useSelector(userInState);
  const { data: leaveBalance } = useGeLeaveBalanceQuery<ILeaveBalance>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openApplyLeaveModal, setOpenApplyLeaveModal] =
    useState<boolean>(false);
  const [leaveId, setLeaveId] = useState<string | null>("");

  // Only make the query if user exists and has an id
  const { data: leaves, isLoading, error, refetch } = useGetUserLeavesQuery();
  const { data, isFetching } = useGetLeavesDetialsQuery(Number(leaveId));

  // Handle query errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to load leaves. Please try again.");
    }
  }, [error]);

  // Show loading state if user is not available yet
  if (!user?.id) {
    return (
      <CustomBox customClasses="p-6 w-full h-full flex flex-col space-y-4">
        <h2 className="text-2xl font-semibold text-black">Leaves</h2>
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-xl text-center text-black-50">
            Loading user information...
          </p>
        </div>
      </CustomBox>
    );
  }

  // Show error state if there's a query error
  if (error) {
    return (
      <div className="w-full h-full flex flex-col gap-y-5">
        <div className="w-full flex flex-row flex-nowrap items-start gap-x-5">
          {isLoading
            ? [1, 2, 3, 4].map((_, idx) => <StatCardSkeleton key={idx} />)
            : leaveBalance && (
                <React.Fragment>
                  <StatCard
                    title="Earn Leaves"
                    value={leaveBalance?.el_balance.toLocaleString()}
                    iconSrc={Icons.EARN}
                    iconBgColor="bg-[#49B6791A]"
                  />
                  <StatCard
                    title="Casual Leave"
                    value={leaveBalance?.cl_balance.toLocaleString()}
                    iconSrc={Icons.CASUAL_LEAVE}
                    iconBgColor="bg-[#2F4CBA1A]"
                  />
                  <StatCard
                    title="Sick Leave"
                    value={leaveBalance?.sl_balance.toLocaleString()}
                    iconSrc={Icons.SICK_LEAVE}
                    iconBgColor="bg-[#6CADDD1A]"
                  />
                  <StatCard
                    title="Unpaid Leave"
                    value={leaveBalance?.unpaid_balance.toLocaleString()}
                    iconSrc={Icons.UNPAID_LEAVE}
                    iconBgColor="bg-[#FF00001A]"
                  />
                </React.Fragment>
              )}
        </div>
        <CustomBox customClasses="p-5 w-full h-full flex flex-col space-y-4">
          <h2 className="text-2xl font-semibold text-black">Leaves</h2>
          <div className="h-full w-full flex flex-col space-y-4 items-center justify-center">
            <p className="text-xl text-center text-red">
              Failed to load leaves
            </p>
            <CustomButton
              onClick={() => refetch()}
              label="Try Again"
              buttonStyle="primary"
            />
          </div>
        </CustomBox>
      </div>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      width: 160,
      renderCell: (params) => params?.row?.title || "N/A",
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      width: 120,
      renderCell: (params) =>
        params?.row?.leave_category
          ? getLeaveTypeTitle(params.row.leave_category)
          : "N/A",
    },

    {
      field: "date",
      headerName: "Applied Date",
      width: 120,
      renderCell: (params) =>
        params?.row?.createdAt
          ? dayjs(params.row.createdAt).format("DD/MM/YYYY")
          : "N/A",
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 120,
      renderCell: (params) =>
        params?.row?.start_date
          ? dayjs(params.row.start_date).format("DD/MM/YYYY")
          : "N/A",
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 120,
      renderCell: (params) =>
        params?.row?.end_date
          ? dayjs(params.row.end_date).format("DD/MM/YYYY")
          : "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => {
        return (
          <span
            className={`${getLeaveStatusColor(
              params.row.status
            )} py-1.25 px-3.75 rounded-3xl text-xs`}
          >
            {params.row.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-y-5">
      <div className="w-full flex flex-row flex-nowrap items-start gap-x-5">
        {isLoading
          ? [1, 2, 3, 4].map((_, idx) => <StatCardSkeleton key={idx} />)
          : leaveBalance && (
              <React.Fragment>
                <StatCard
                  title="Earn Leaves"
                  value={leaveBalance?.el_balance.toLocaleString()}
                  iconSrc={Icons.EARN}
                  iconBgColor="bg-[#49B6791A]"
                />
                <StatCard
                  title="Casual Leave"
                  value={leaveBalance?.cl_balance.toLocaleString()}
                  iconSrc={Icons.CASUAL_LEAVE}
                  iconBgColor="bg-[#2F4CBA1A]"
                />
                <StatCard
                  title="Sick Leave"
                  value={leaveBalance?.sl_balance.toLocaleString()}
                  iconSrc={Icons.SICK_LEAVE}
                  iconBgColor="bg-[#6CADDD1A]"
                />
                <StatCard
                  title="Unpaid Leave"
                  value={leaveBalance?.unpaid_balance.toLocaleString()}
                  iconSrc={Icons.UNPAID_LEAVE}
                  iconBgColor="bg-[#FF00001A]"
                />
              </React.Fragment>
            )}
      </div>
      <CustomBox customClasses="w-full p-5 h-full flex flex-col space-y-5">
        <div className="w-full flex flex-nowrap justify-between items-center">
          <span className="text-2xl font-semibold">Leaves</span>
          <CustomButton
            label="Apply Leave"
            buttonStyle="primary"
            icon={<TbPlus size={24} />}
            onClick={() => setOpenApplyLeaveModal(true)}
          />
        </div>

        <div className=" w-full h-full">
          {!isLoading && (!leaves?.data || leaves.data.length === 0) ? (
            <EmptyScreenView
              isDataEmpty={true}
              emptyViewTitle="No Leave Found"
              emptyViewSubTitle="Please request a leave"
            />
          ) : (
            <CustomDataTable
              columns={columns}
              rows={leaves?.data || []}
              isDataEmpty={!leaves?.data || leaves.data.length === 0}
              emptyViewTitle="No Leave Found"
              emptyViewSubTitle="Please request a leave"
              isLoading={isLoading}
              withPagination={false}
              onRowClick={(item) => {
                setLeaveId(item.id.toString());
                setOpenModal(true);
              }}
            />
          )}
        </div>
      </CustomBox>
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
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
              <span className="text-black-50 text-sm font-medium">Title</span>
              <p className="text-base">{data?.title}</p>
            </div>
            <div className="flex flex-col gap-y-0.5">
              <span className="text-black-50 text-sm font-medium">
                Description
              </span>
              <p className="text-base">{data?.description}</p>
            </div>
            <LinearGradient />
            <div className="w-full flex flex-row flex-wrap items-start gap-y-3">
              <div className="w-[60%] flex flex-col gap-y-0.5">
                <span className="text-black-50 text-sm font-medium">
                  Leave Type
                </span>
                <p className="text-base capitalize">{data?.leave_type}</p>
              </div>
              <div className="w-[40%] flex flex-col gap-y-0.5">
                <span className="text-black-50 text-sm font-medium">
                  Leave Duration
                </span>
                <p className="text-base capitalize">
                  {getLeaveTypeTitle(data?.leave_category ?? "")}
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
                <span className="text-black-50 text-sm font-medium">
                  Start Date & End Date
                </span>
                <p className="text-base">
                  {dayjs(data?.start_date).format("DD MMM, YYYY")} &nbsp; &
                  &nbsp;
                  {dayjs(data?.start_date).format("DD MMM, YYYY")}
                </p>
              </div>
              <div className="flex flex-col gap-y-0.5">
                <span className="text-black-50 text-sm font-medium">
                  Leave Days
                </span>
                <p className="text-base">{data?.days ?? 1}</p>
              </div>
            </div>
          </CustomBox>
        )}
      </Dialog>

      {/* Apply Leave Dialog */}
      <CreateLeaveDialog
        open={openApplyLeaveModal}
        onClose={() => setOpenApplyLeaveModal(false)}
      />
    </div>
  );
};

export default LeaveList;
