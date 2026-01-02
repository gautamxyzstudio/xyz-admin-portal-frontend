import { Card, Grid, Box, Typography, Button } from "@mui/material";
import { useGetUserLeavesQuery } from "../../leavesApi";
import { useSelector } from "react-redux";
import { userInState } from "../../../auth/authSlice";
import { toast } from "react-toastify";
// import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import {
  convertTo12HourFormat,
  formatDateToReadable,
  getLeaveTypeTitle,
} from "../../../../utils/utils";
import EmptyScreenView from "../../../../shared/components/EmptyScreenView/EmptyScreenView";
import React, { useEffect } from "react";
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
import { useNavigate } from "react-router";

const LeaveList = () => {
  const navigate = useNavigate();
  // const { setIsLoading } = useLoadingWrapper();
  const user = useSelector(userInState);
  // const [deleteLeave] = useDeleteLeaveMutation();
  const { data: leaveBalance } = useGeLeaveBalanceQuery<ILeaveBalance>();

  // Only make the query if user exists and has an id
  const { data: leaves, isLoading, error, refetch } = useGetUserLeavesQuery();

  // Handle query errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to load leaves. Please try again.");
    }
  }, [error]);

  // const handleDeleteLeave = async (id: number) => {
  //   if (!id) {
  //     toast.error("Invalid leave ID");
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     const response = await deleteLeave({ id: id }).unwrap();
  //     if (response) {
  //       toast.success("Leave deleted successfully");
  //       // Refetch the leaves data to update the list
  //       refetch();
  //     }
  //   } catch (error: any) {
  //     console.error("Error deleting leave:", error);

  //     // Provide more specific error messages based on the error
  //     let errorMessage = "Failed to delete leave";
  //     if (error?.status === 404) {
  //       errorMessage = "Leave not found";
  //     } else if (error?.status === 403) {
  //       errorMessage = "You are not authorized to delete this leave";
  //     } else if (error?.status === 400) {
  //       errorMessage =
  //         "Cannot delete leave. It may have already been processed";
  //     } else if (error?.data?.message) {
  //       errorMessage = error.data.message;
  //     }

  //     toast.error(errorMessage);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Show loading state if user is not available yet
  if (!user?.id) {
    return (
      <>
        <Box pt={3} pb={3}>
          <Card>
            <CustomBox customClasses="p-6">
              <Typography variant="h6" color="white">
                Leaves
              </Typography>
            </CustomBox>
            <div className="h-full mt-4 w-full flex items-center justify-center">
              <Typography variant="h6" color="text">
                Loading user information...
              </Typography>
            </div>
          </Card>
        </Box>
      </>
    );
  }

  // Show error state if there's a query error
  if (error) {
    return (
      <div className="w-full flex flex-col gap-y-5">
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
        <Box pt={3} pb={3}>
          <Grid container spacing={6}></Grid>
          <Card>
            <CustomBox>
              <Typography variant="h6" color="white">
                Leaves
              </Typography>
            </CustomBox>
            <div className="h-full mt-4 w-full flex items-center justify-center">
              <Box textAlign="center">
                <Typography variant="h6" color="error" mb={2}>
                  Failed to load leaves
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => refetch()}
                >
                  Try Again
                </Button>
              </Box>
            </div>
          </Card>
        </Box>
      </div>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      width: 160,
      renderCell: (params) => {
        return (
          <Typography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.createdAt
              ? formatDateToReadable(params.row.createdAt)
              : "N/A"}
          </Typography>
        );
      },
    },
    {
      field: "title",
      headerName: "Title",
      width: 160,
      renderCell: (params) => {
        return (
          <Typography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.title || "N/A"}
          </Typography>
        );
      },
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      width: 160,
      renderCell: (params) => {
        return (
          <Typography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.leave_duration
              ? getLeaveTypeTitle(params.row.leave_duration)
              : "N/A"}
          </Typography>
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      width: 250,
      renderCell: (params) => {
        return (
          <Typography
            display="block"
            variant="caption"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.description || "N/A"}
          </Typography>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => {
        const color =
          params.row?.status === "pending"
            ? "warning"
            : params?.row?.status === "approved"
            ? "success"
            : "error";
        return (
          <Typography
            display="block"
            variant="h6"
            sx={{
              textTransform: "capitalize",
            }}
            fontWeight="medium"
            color={color}
          >
            {params?.row?.status || "N/A"}
          </Typography>
        );
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 160,
      renderCell: (params) => {
        return (
          <Typography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.start_date
              ? formatDateToReadable(params.row.start_date)
              : "N/A"}
          </Typography>
        );
      },
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 160,
      renderCell: (params) => {
        return (
          <Typography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.end_date
              ? formatDateToReadable(params.row.end_date)
              : "N/A"}
          </Typography>
        );
      },
    },
    {
      field: "startTime",
      headerName: "Start Time",
      width: 160,
      renderCell: (params) => {
        return (
          <Typography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.start_time
              ? convertTo12HourFormat(params.row.start_time)
              : "N/A"}
          </Typography>
        );
      },
    },
    {
      field: "is_first_half",
      headerName: "Half",
      width: 160,
      renderCell: (params) => {
        return (
          <Typography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.leave_duration === "half_day"
              ? params?.row?.is_first_half
                ? "First"
                : "Second"
              : "N/A"}
          </Typography>
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
      <CustomBox customClasses="w-full p-5 h-full">
        <div className="w-full flex flex-nowrap justify-between items-center">
          <span className="text-2xl font-semibold">Leaves</span>
          <CustomButton
            label="Apply Leave"
            buttonStyle="primary"
            icon={<TbPlus size={24} />}
             onClick={() => navigate("/leaves/create")}
          />
        </div>

        <div className="mt-5 w-full h-full">
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
              tableHeight={300}
            />
          )}
        </div>
      </CustomBox>
    </div>
  );
};

export default LeaveList;
