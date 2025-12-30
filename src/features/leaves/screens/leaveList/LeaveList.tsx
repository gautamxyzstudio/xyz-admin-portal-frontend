/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout/index.jsx";
import DashboardNavbar from "../../../../examples/Navbars/DashboardNavbar/index.jsx";
import { Card, Grid, Menu, MenuItem } from "@mui/material";
import MDBox from "../../../../components/MDBox/MDBox";
import MDButton from "../../../../components/MDButton/MDButton";
import MDTypography from "../../../../components/MDTypography";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../../shared/components/dataTable/DataTable.js";
import { useDeleteLeaveMutation, useGetUserLeavesQuery } from "../../leavesApi";
import { useSelector } from "react-redux";
import { userInState } from "../../../auth/authSlice";
import MenuIcon from "@mui/icons-material/Menu";
import { toast } from "react-toastify";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import {
  convertTo12HourFormat,
  formatDateToReadable,
  getLeaveTypeTitle,
} from "../../../../utils/utils";
import EmptyScreenView from "../../../../shared/components/EmptyScreenView/EmptyScreenView";
import { useEffect } from "react";
import type { GridColDef } from "@mui/x-data-grid";

const LeaveList = () => {
  const navigate = useNavigate();
  const { setIsLoading } = useLoadingWrapper();
  const user = useSelector(userInState);
  const [deleteLeave] = useDeleteLeaveMutation();

  // Only make the query if user exists and has an id
  const {
    data: leaves,
    isLoading,
    error,
    refetch,
  } = useGetUserLeavesQuery(user?.id?.toString() ?? "", {
    skip: !user?.id,
  });

  // Handle query errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to load leaves. Please try again.");
    }
  }, [error]);

  const handleDeleteLeave = async (id: string) => {
    if (!id) {
      toast.error("Invalid leave ID");
      return;
    }

    try {
      setIsLoading(true);
      const response = await deleteLeave(id).unwrap();
      if (response) {
        toast.success("Leave deleted successfully");
        // Refetch the leaves data to update the list
        refetch();
      }
    } catch (error: any) {
      console.error("Error deleting leave:", error);

      // Provide more specific error messages based on the error
      let errorMessage = "Failed to delete leave";
      if (error?.status === 404) {
        errorMessage = "Leave not found";
      } else if (error?.status === 403) {
        errorMessage = "You are not authorized to delete this leave";
      } else if (error?.status === 400) {
        errorMessage =
          "Cannot delete leave. It may have already been processed";
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if user is not available yet
  if (!user?.id) {
    return (
      <>
        <DashboardNavbar />
        <MDBox pt={3} pb={3}>
          <Grid container spacing={6}></Grid>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="warning"
              borderRadius="lg"
              coloredShadow="dark"
            >
              <MDTypography variant="h6" color="white">
                Leaves
              </MDTypography>
            </MDBox>
            <div className="h-[70vh] mt-4 w-full flex items-center justify-center">
              <MDTypography variant="h6" color="text">
                Loading user information...
              </MDTypography>
            </div>
          </Card>
        </MDBox>
      </>
    );
  }

  // Show error state if there's a query error
  if (error) {
    return (
      <>
        <DashboardNavbar />
        <MDBox pt={3} pb={3}>
          <Grid container spacing={6}></Grid>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="warning"
              borderRadius="lg"
              coloredShadow="dark"
            >
              <MDTypography variant="h6" color="white">
                Leaves
              </MDTypography>
            </MDBox>
            <div className="h-[70vh] mt-4 w-full flex items-center justify-center">
              <MDBox textAlign="center">
                <MDTypography variant="h6" color="error" mb={2}>
                  Failed to load leaves
                </MDTypography>
                <MDButton
                  variant="contained"
                  color="primary"
                  onClick={() => refetch()}
                >
                  Try Again
                </MDButton>
              </MDBox>
            </div>
          </Card>
        </MDBox>
      </>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      width: 160,
      renderCell: (params) => {
        return (
          <MDTypography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.createdAt
              ? formatDateToReadable(params.row.createdAt)
              : "N/A"}
          </MDTypography>
        );
      },
    },
    {
      field: "title",
      headerName: "Title",
      width: 160,
      renderCell: (params) => {
        return (
          <MDTypography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.title || "N/A"}
          </MDTypography>
        );
      },
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      width: 160,
      renderCell: (params) => {
        return (
          <MDTypography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.leave_duration
              ? getLeaveTypeTitle(params.row.leave_duration)
              : "N/A"}
          </MDTypography>
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      width: 250,
      renderCell: (params) => {
        return (
          <MDTypography
            display="block"
            variant="caption"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.description || "N/A"}
          </MDTypography>
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
          <MDTypography
            display="block"
            variant="h6"
            sx={{
              textTransform: "capitalize",
            }}
            fontWeight="medium"
            color={color}
          >
            {params?.row?.status || "N/A"}
          </MDTypography>
        );
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 160,
      renderCell: (params) => {
        return (
          <MDTypography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.start_date
              ? formatDateToReadable(params.row.start_date)
              : "N/A"}
          </MDTypography>
        );
      },
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 160,
      renderCell: (params) => {
        return (
          <MDTypography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.end_date
              ? formatDateToReadable(params.row.end_date)
              : "N/A"}
          </MDTypography>
        );
      },
    },
    {
      field: "startTime",
      headerName: "Start Time",
      width: 160,
      renderCell: (params) => {
        return (
          <MDTypography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {params?.row?.start_time
              ? convertTo12HourFormat(params.row.start_time)
              : "N/A"}
          </MDTypography>
        );
      },
    },
    {
      field: "is_first_half",
      headerName: "Half",
      width: 160,
      renderCell: (params) => {
        return (
          <MDTypography
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
          </MDTypography>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 80,
      renderCell: (params) => {
        return (
          <div className="flex  w-full h-full justify-center items-center">
            <Menu
              disabled={params?.row?.status === "pending" ? false : true}
              className={`w-full h-full flex justify-center items-center ${
                params?.row?.status !== "pending" ? "opacity-10" : ""
              }`}
            >
              <MenuItem
                className="z-50!"
                onClick={() =>
                  navigate(`/leaves/update`, {
                    state: { leave: params.row },
                  })
                }
              >
                Edit
              </MenuItem>
              <MenuItem
                className="z-50!"
                onClick={() => handleDeleteLeave(params.row.id)}
              >
                Delete
              </MenuItem>
            </Menu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}></Grid>
        <Card>
          <MDBox
            mx={2}
            mt={-3}
            py={3}
            px={2}
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
            variant="gradient"
            bgColor="warning"
            borderRadius="lg"
            coloredShadow="dark"
          >
            <MDTypography variant="h6" color="white">
              Leaves
            </MDTypography>
            <MDButton
              variant="contained"
              color="orange"
              onClick={() => navigate("/leaves/create")}
            >
              Request Leave
            </MDButton>
          </MDBox>

          <div className="h-[70vh] mt-4 w-full">
            {!isLoading && (!leaves?.data || leaves.data.length === 0) ? (
              <EmptyScreenView
                isDataEmpty={true}
                emptyViewTitle="No Leave Found"
                emptyViewSubTitle="Please request a leave"
              />
            ) : (
              <DataTable
                columns={columns}
                rows={leaves?.data || []}
                isDataEmpty={!leaves?.data || leaves.data.length === 0}
                emptyViewTitle="No Leave Found"
                emptyViewSubTitle="Please request a leave"
                isLoading={isLoading}
                withPagination={false}
                tableHeightPercent={100}
              />
            )}
          </div>
        </Card>
      </MDBox>
    </>
  );
};

export default LeaveList;
