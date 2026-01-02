/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Modal,
  Typography,
  Divider,
  Chip,
  Grid,
  Paper,
  Stack,
  Avatar,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  useApproveLeaveMutation,
  useGetLeaveRequestsQuery,
  useRejectLeaveMutation,
} from "../../../leaves/leavesApi";
import { useGetEmployeeLeaveBalanceQuery } from "../../../employee/employeeApis";
import type { GridColDef } from "@mui/x-data-grid";
import {
  convertTo12HourFormat,
  formatDateToReadable,
  getLeaveTypeTitle,
} from "../../../../utils/utils";
import type { ILeave } from "../../../leaves/leaves.types";
import EmployeeTableRow from "../../../employee/components/employeeTableRow/EmployeeTableRow";
import { toast } from "react-toastify";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import { useDispatch, useSelector } from "react-redux";
import {
  approveLeaveRequest,
  rejectLeaveRequest,
  selectLeaveRequests,
  setLeaveRequests,
} from "../../screens/dashboardHrSlice";
import { useNavigate } from "react-router-dom";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";

const LeaveRequest = () => {
  const { data: leaveRequests, isLoading } = useGetLeaveRequestsQuery(
    undefined,
    {
      refetchOnFocus: true,
    }
  );

  const [approveLeave] = useApproveLeaveMutation();
  const { setIsLoading } = useLoadingWrapper();
  const [rejectLeave] = useRejectLeaveMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const leaveRequestsFromStore = useSelector(selectLeaveRequests);
  const [selectedLeave, setSelectedLeave] = useState<ILeave | null>(null);
  const [latestLeaveBalance, setLatestLeaveBalance] = useState<{
    leave_balance: number;
    unpaid_leave_balance: number;
  } | null>(null);

  // Check if data has been loaded but is empty
  const hasLoadedEmptyData =
    !isLoading && leaveRequestsFromStore && leaveRequestsFromStore.length === 0;

  useEffect(() => {
    if (leaveRequests?.data) {
      dispatch(setLeaveRequests(leaveRequests.data));
    }
  }, [leaveRequests?.data]);

  // Query for fetching latest leave balance
  const { data: leaveBalanceData, refetch: refetchLeaveBalance } =
    useGetEmployeeLeaveBalanceQuery({
      id: selectedLeave?.user?.data?.id?.toString() || "",
    });

  // Update latest leave balance when data is fetched

  useEffect(() => {
    if (leaveBalanceData) {
      setLatestLeaveBalance(leaveBalanceData);
    }
  }, [leaveBalanceData]);

  const handleApprove = async (data: ILeave) => {
    try {
      setOpen(false);
      setIsLoading(true);
      const response = await approveLeave({ id: data.id ?? 0 }).unwrap();

      if (response) {
        dispatch(approveLeaveRequest({ id: data.id }));
        toast.success("Leave approved successfully");
      }
    } catch (error) {
      toast.error("Failed to approve leave");
      console.log(error);
    } finally {
      setOpen(false);
      setIsLoading(false);
    }
  };

  const handleReject = async (data: ILeave) => {
    try {
      setOpen(false);
      setIsLoading(true);
      const response = await rejectLeave({ id: data.id ?? 0 }).unwrap();
      if (response) {
        dispatch(rejectLeaveRequest({ id: data.id }));
        toast.success("Leave rejected successfully");
      }
    } catch (error) {
      toast.error("Failed to reject leave");
      console.log(error);
    } finally {
      setOpen(false);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      width: 150,
      renderCell: (params) => {
        return (
          <Typography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {formatDateToReadable(params?.row?.createdAt)}
          </Typography>
        );
      },
    },
    {
      field: "user",
      headerName: "User",
      width: 350,
      renderCell: (params) => {
        const photo = `${import.meta.env.VITE_API_BASE_URL}${
          params.row.user?.data?.attributes?.user_detial?.data?.attributes
            ?.Photo?.data[0]?.attributes?.url ?? ""
        }`;

        console.log("==-=-=-=-=-=-=-=PHOTO=-=-=-=-=-=-=-=-=-=-");
        console.log(photo);

        return (
          <EmployeeTableRow
            image={photo}
            name={params.row.user?.data?.attributes?.username}
            email={params.row.user?.data?.attributes?.email}
          />
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
            display="-webkit-box"
            variant="h6"
            color="text"
            fontWeight="medium"
            sx={{
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {params?.row?.title}
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
            {getLeaveTypeTitle(params?.row?.leave_duration)}
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
            {formatDateToReadable(params?.row?.start_date)}
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
            {formatDateToReadable(params?.row?.end_date)}
          </Typography>
        );
      },
    },

    {
      field: "action",
      headerName: "Action",
      width: 120,
      renderCell: (params) => {
        return (
          <div className="flex w-full h-full justify-center items-center">
            <Button
              variant="text"
             
              onClick={() => {
                setSelectedLeave(params?.row as ILeave);
                setOpen(true);
                // Fetch latest leave balance when modal opens
                if (params?.row?.user?.data?.id) {
                  setTimeout(() => {
                    refetchLeaveBalance();
                  }, 100);
                }
              }}
            >
              View Details
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <div className="w-full h-full mt-8">
      <div className="flex justify-between  items-center mb-4">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Leave Requests
        </Typography>
        {leaveRequestsFromStore && leaveRequestsFromStore.length > 0 && (
          <Button
            variant="contained"
           
            onClick={() => navigate("/leaves/create")}
          >
            View All
          </Button>
        )}
      </div>
      <CustomDataTable
        columns={columns as unknown as GridColDef[]}
        rows={leaveRequestsFromStore || []}
        isLoading={isLoading}
        isDataEmpty={
          !leaveRequestsFromStore || leaveRequestsFromStore.length === 0
        }
        emptyViewTitle={
          hasLoadedEmptyData ? "No leave requests found" : "Loading..."
        }
        emptyViewSubTitle={
          hasLoadedEmptyData
            ? "There are currently no pending leave requests to review"
            : "Please wait while we fetch the data"
        }
        withPagination={
          leaveRequestsFromStore && leaveRequestsFromStore.length > 0
        }
        totalCount={leaveRequests?.pagination?.total || 0}
        page={leaveRequests?.pagination?.page || 1}
        onPressPageChange={(_event, page) => {
          console.log(page);
        }}
      />
      <Modal
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        open={open}
        onClose={handleClose}
      >
        <Paper
          elevation={3}
          sx={{
            width: 500,
            maxHeight: "80vh",
            backgroundColor: "white",
            borderRadius: 2,
            padding: 3,
            overflow: "auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Leave Details
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* User Details Section */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid >
                <Avatar
                 
                  src={`${import.meta.env.VITE_API_BASE_URL}${
                    selectedLeave?.user?.data?.attributes?.user_detial?.data
                      ?.attributes?.Photo?.data[0]?.attributes?.url ?? ""
                  }`}
                  alt={selectedLeave?.user?.data?.attributes?.username}
                  sx={{ width: 60, height: 60 }}
                />
              </Grid>
              <Grid container>
                <Typography variant="h6" gutterBottom>
                  {selectedLeave?.user?.data?.attributes?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedLeave?.user?.data?.attributes?.user_type}
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid >
                <Typography variant="subtitle2" color="text.secondary">
                  Leave Balance
                </Typography>
                <Typography variant="h6" color="primary">
                  {latestLeaveBalance?.leave_balance ??
                    (selectedLeave?.user?.data?.attributes?.leave_balance ||
                      0)}{" "}
                  days
                </Typography>
              </Grid>
              <Grid>
                <Typography variant="subtitle2" color="text.secondary">
                  Unpaid Leave Balance
                </Typography>
                <Typography variant="h6" color="error">
                  {latestLeaveBalance?.unpaid_leave_balance ??
                    (selectedLeave?.user?.data?.attributes
                      ?.unpaid_leave_balance ||
                      0)}{" "}
                  days
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h6" gutterBottom>
            Request Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid >
              <Typography variant="subtitle2" color="text.secondary">
                Title
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedLeave?.title}
              </Typography>
            </Grid>

            <Grid >
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedLeave?.description}
              </Typography>
            </Grid>

            <Grid >
              <Typography variant="subtitle2" color="text.secondary">
                Leave Type
              </Typography>
              <Chip
                label={selectedLeave?.leave_duration
                  ?.replace("_", " ")
                  .toUpperCase()}
                color={
                  selectedLeave?.leave_duration === "full_day"
                    ? "primary"
                    : selectedLeave?.leave_duration === "half_day"
                    ? "secondary"
                    : "info"
                }
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Grid>

            <Grid >
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={selectedLeave?.status?.toUpperCase()}
                color={
                  selectedLeave?.status === "approved"
                    ? "success"
                    : selectedLeave?.status === "rejected"
                    ? "error"
                    : "warning"
                }
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Grid>

            <Grid >
              <Typography variant="subtitle2" color="text.secondary">
                Start Date
              </Typography>
              <Typography variant="body1">
                {formatDateToReadable(selectedLeave?.start_date ?? "")}
              </Typography>
            </Grid>

            <Grid >
              <Typography variant="subtitle2" color="text.secondary">
                End Date
              </Typography>
              <Typography variant="body1">
                {formatDateToReadable(selectedLeave?.end_date ?? "")}
              </Typography>
            </Grid>

            {selectedLeave?.start_time && (
              <Grid >
                <Typography variant="subtitle2" color="text.secondary">
                  Start Time
                </Typography>
                <Typography variant="body1">
                  {convertTo12HourFormat(selectedLeave.start_time)}
                </Typography>
              </Grid>
            )}

            {selectedLeave?.leave_duration === "half_day" && (
              <Grid >
                <Typography variant="subtitle2" color="text.secondary">
                  Half Day
                </Typography>
                <Typography variant="body1">
                  {selectedLeave?.is_first_half ? "First Half" : "Second Half"}
                </Typography>
              </Grid>
            )}

            {selectedLeave?.decline_reason && (
              <Grid >
                <Typography variant="subtitle2" color="text.secondary">
                  Decline Reason
                </Typography>
                <Typography variant="body1" color="error">
                  {selectedLeave.decline_reason}
                </Typography>
              </Grid>
            )}

            {selectedLeave?.status === "pending" && (
              <Grid >
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="contained"
                   
                    onClick={() => handleReject(selectedLeave)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outlined"
                   
                    onClick={() => handleApprove(selectedLeave)}
                  >
                    Approve
                  </Button>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Modal>
    </div>
  );
};

export default LeaveRequest;
