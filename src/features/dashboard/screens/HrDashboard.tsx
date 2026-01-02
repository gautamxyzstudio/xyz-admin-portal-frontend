/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  useLazyGetAllAttendanceQuery,
  useUpdateAttendanceMutation,
} from "../dashboardApi";
import type { IUserAttendance } from "../types";
import type { GridColDef } from "@mui/x-data-grid";
import EmployeeTableRow from "../../employee/components/employeeTableRow/EmployeeTableRow";
import {
  convertTo12HourFormat,
  getImageUrl,
  getWeekDates,
} from "../../../utils/utils";
import {
  Box,
  Icon,
  Modal,
  Typography,
  TextField,
  Stack,
  Alert,
  Button,
} from "@mui/material";
import LeaveRequest from "../components/leaveRequests/LeaveRequest";
import { useLoadingWrapper } from "../../../wrappers/loadingWrapper/LoadingWrapper.context";
import { toast } from "react-toastify";
import EmptyScreenView from "../../../shared/components/EmptyScreenView/EmptyScreenView";
import CustomDataTable from "../../../shared/components/customDataTable/CustomDataTable";

const HrDashboard = () => {
  const [getAllAttendance, { isFetching: isLoading, error }] =
    useLazyGetAllAttendanceQuery();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const { setIsLoading } = useLoadingWrapper();
  const [open, setOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<IUserAttendance[]>([]);
  const [page, setPage] = useState(1);
  const [selectedAttendance, setSelectedAttendance] =
    useState<IUserAttendance | null>(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [updateError, setUpdateError] = useState("");

  console.log(attendanceData, "attendance data");

  const getAllAttendanceHandler = async (
    isFirstFetch?: boolean,
    page?: number
  ) => {
    try {
      const pageNumber = isFirstFetch ? 1 : (page ?? 1) + 1;
      const dates = getWeekDates();
      const response = await getAllAttendance({
        page: pageNumber,
        pageSize: 20,
        startDate: dates.startDate,
        endDate: dates.endDate,
      }).unwrap();
      console.log(response.data, "response from api");
      if (isFirstFetch) {
        setAttendanceData(response.data);
        setPage(1);
      } else {
        setAttendanceData((prev) => [...prev, ...response.data]);
        setPage(pageNumber);
      }
    } catch (error) {
      console.log(error, "error from api");
    }
  };

  // Dedicated function to refresh attendance data
  const refreshAttendanceData = async () => {
    try {
      const dates = getWeekDates();
      const response = await getAllAttendance({
        page: 1,
        pageSize: 20,
        startDate: dates.startDate,
        endDate: dates.endDate,
      }).unwrap();
      setAttendanceData(response.data);
      setPage(1);
    } catch (error) {
      console.log(error, "error refreshing attendance data");
      toast.error("Failed to refresh attendance data");
    }
  };

  useEffect(() => {
    getAllAttendanceHandler(true);
  }, []);

  // Handle query errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance data. Please try again.");
    }
  }, [error]);

  const formatTimeForInput = (time: string) => {
    // Convert API time format (HH:mm:ss.SSS) to input format (HH:mm)
    if (!time) return "";

    // Remove milliseconds and seconds if present
    return time.split(".")[0].split(":").slice(0, 2).join(":");
  };

  const formatTimeForAPI = (time: string) => {
    // Ensure time is in HH:mm:ss.SSS format
    if (!time) return "";

    // If time is already in HH:mm:ss format, add .000 for milliseconds
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return `${time}.000`;
    }

    // If time is in HH:mm format, add :00.000 for seconds and milliseconds
    if (time.match(/^\d{2}:\d{2}$/)) {
      return `${time}:00.000`;
    }

    // If already in correct format, return as is
    if (time.match(/^\d{2}:\d{2}:\d{2}\.\d{3}$/)) {
      return time;
    }

    // Default fallback
    return `${time}:00.000`;
  };

  useEffect(() => {
    if (selectedAttendance) {
      setEditCheckIn(formatTimeForInput(selectedAttendance.in || ""));
      setEditCheckOut(formatTimeForInput(selectedAttendance.out || ""));
      setUpdateError("");
    }
  }, [selectedAttendance]);

  const handleUpdateAttendance = async () => {
    if (!editCheckIn || !editCheckOut) {
      setUpdateError("Both check-in and check-out times are required.");
      return;
    }

    // Close modal immediately and show loader
    setOpen(false);
    setSelectedAttendance(null);
    setIsLoading(true);

    try {
      if (typeof selectedAttendance?.id !== "number") {
        throw new Error("Invalid attendance ID");
      }
      await updateAttendance({
        data: {
          id: selectedAttendance.id,
          in: formatTimeForAPI(editCheckIn),
          out: formatTimeForAPI(editCheckOut),
        },
      }).unwrap();

      // Refresh the data
      toast.success("Attendance updated successfully");
      await refreshAttendanceData();
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "empCode",
      width: 80,
      renderCell: (params) => (
        <Typography variant="caption" color="text" fontWeight="medium">
          {params?.row?.user?.user_detial?.empCode}
        </Typography>
      ),
    },
    {
      field: "employee",
      headerName: "Employee",
      width: 200,
      renderCell: (params) => (
        <EmployeeTableRow
          image={getImageUrl(params?.row?.user?.user_detial?.Photo[0]?.url)}
          name={params?.row?.user?.user_detial?.name}
          email={params?.row?.user?.email}
        />
      ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 150,
      renderCell: (params) => (
        <Typography variant="caption" color="text" fontWeight="medium">
          {params?.row?.Date}
        </Typography>
      ),
    },
    {
      field: "checkIn",
      headerName: "Check In",
      width: 150,
      renderCell: (params) => (
        <Typography variant="caption" color="text" fontWeight="medium">
          {convertTo12HourFormat(params?.row?.in) ?? "In Time Missing"}
        </Typography>
      ),
    },
    {
      field: "checkOut",
      headerName: "Check Out",
      width: 150,
      renderCell: (params) => (
        <Typography variant="caption" color="text" fontWeight="medium">
          {convertTo12HourFormat(params?.row?.out) ?? "Out Time Missing"}
        </Typography>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.8,
      width: 100,
      renderCell: (params) => (
        <div className="flex flex-row gap-x-3">
          <Button
            variant="text"
         
            onClick={() => {
              setSelectedAttendance(params.row);
              setOpen(true);
            }}
          >
            <Icon>update</Icon>&nbsp;Update
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[70vh]">
      <>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Attendance Logs
        </Typography>
        {!isLoading && (!attendanceData || attendanceData.length === 0) ? (
          <EmptyScreenView
            isDataEmpty={true}
            emptyViewTitle="No attendance data found"
            emptyViewSubTitle="Please check back later"
          />
        ) : error ? (
          <div className="h-[70vh] w-full flex items-center justify-center">
            <div className="text-center">
              <Typography variant="h6" color="error" mb={2}>
                Failed to load attendance data
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => getAllAttendanceHandler(true)}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <CustomDataTable
            columns={columns}
            rows={attendanceData}
            isDataEmpty={!attendanceData || attendanceData.length === 0}
            emptyViewTitle="No attendance data found"
            emptyViewSubTitle="Please check back later"
            isLoading={isLoading}
            withPagination={true}
            totalCount={100}
            page={page}
            onPressPageChange={(_event, page) =>
              getAllAttendanceHandler(false, page)
            }
          />
        )}
        <Modal
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedAttendance(null);
          }}
        >
          <Box
            sx={{
              width: 350,
              backgroundColor: "#fff",
              borderRadius: 2,
              padding: 3,
            }}
          >
            <Typography variant="h6" mb={2}>
              Update Attendance
            </Typography>
            {updateError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {updateError}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                label="Check In"
                type="time"
                value={editCheckIn}
                onChange={(e) => setEditCheckIn(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Check Out"
                type="time"
                value={editCheckOut}
                onChange={(e) => setEditCheckOut(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleUpdateAttendance}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setOpen(false);
                    setSelectedAttendance(null);
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>
      </>
      <LeaveRequest />
    </div>
  );
};

export default HrDashboard;
