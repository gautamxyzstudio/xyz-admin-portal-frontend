/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from "react";

import MDTypography from "../../../../components/MDTypography";
import type { ILeave } from "../../leaves.types";
import DataTable from "../../../../shared/components/datatable/DataTable";
import type { GridColDef } from "@mui/x-data-grid";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout/index.jsx";
import EmployeeTableRow from "../../../employee/components/employeeTableRow/EmployeeTableRow";
import {
  convertTo12HourFormat,
  formatDateToReadable,
  getLeaveTypeTitle,
  getImageUrl,
} from "../../../../utils/utils";
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
  TextField,
  Alert,
  InputAdornment,
  Icon,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import { useApiOperations } from "../../../../hooks/useApiOperations";
import { useFilterState } from "../../../../hooks/useFilterState";
import {
  useLazyGetAllLeavesQuery,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
} from "../../leavesApi";
import MDButton from "../../../../components/MDButton/MDButton";
import { useGetEmployeeLeaveBalanceQuery } from "../../../employee/employeeApis";

// Custom hook for leaves data management
const useLeavesData = () => {
  const [getAllLeaves, { isFetching }] = useLazyGetAllLeavesQuery();
  const [leavesData, setLeavesData] = useState<ILeave[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fetchError, setFetchError] = useState<string>("");
  const { setIsLoading } = useLoadingWrapper();

  const fetchLeaves = useCallback(
    async (
      params: {
        page: number;
        startDate: string;
        endDate: string;
        search: string;
        leaveType?: string;
      },
      showLoading: boolean = true
    ) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        setFetchError(""); // Clear previous errors
        const response = await getAllLeaves({
          page: params.page,
          pageSize: 10,
          startDate: params.startDate,
          endDate: params.endDate,
          search: params.search,
          ...(params.leaveType && { leaveType: params.leaveType }),
        }).unwrap();

        setLeavesData(response.data || []);
        setTotalPages(response.pagination?.pageCount || 0);
        setPage(response.pagination?.page || params.page);

        return response;
      } catch (error: any) {
        setLeavesData([]);
        const errorMessage =
          error?.data?.message ||
          error?.error ||
          "Failed to fetch leaves. Please try again.";
        setFetchError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [getAllLeaves, setIsLoading]
  );

  const clearFetchError = useCallback(() => {
    setFetchError("");
  }, []);

  return {
    leavesData,
    page,
    totalPages,
    isFetching,
    fetchError,
    fetchLeaves,
    clearFetchError,
  };
};

// Custom hook for modal state management
const useModalState = () => {
  const [open, setOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);

  const openModal = useCallback((leave: ILeave) => {
    setSelectedLeave(leave);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setSelectedLeave(null);
  }, []);

  return {
    open,
    selectedLeave,
    openModal,
    closeModal,
  };
};

// Custom hook for leave type filter
const useLeaveTypeFilter = () => {
  const [leaveType, setLeaveType] = useState<string>("");

  const leaveTypeOptions = [
    { value: "", label: "All Leave Types" },
    { value: "short_leave", label: "Short Leave" },
    { value: "half_day", label: "Half Day" },
    { value: "full_day", label: "Full Day" },
  ];

  const handleLeaveTypeChange = useCallback((e: any) => {
    setLeaveType(e.target.value);
  }, []);

  return {
    leaveType,
    setLeaveType,
    leaveTypeOptions,
    handleLeaveTypeChange,
  };
};

const AllLeaves = () => {
  const [approveLeave] = useApproveLeaveMutation();
  const [rejectLeave] = useRejectLeaveMutation();
  const { setIsLoading } = useLoadingWrapper();
  const { executeWithLoading } = useApiOperations();

  const {
    leavesData,
    page,
    totalPages,
    isFetching,
    fetchError,
    fetchLeaves,
    clearFetchError,
  } = useLeavesData();

  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    dateError,
    setDateError,
    minDate,
    maxDate,
    clearFilters,
    clearDateError,
  } = useFilterState();

  const { open, selectedLeave, openModal, closeModal } = useModalState();

  const { leaveType, setLeaveType, leaveTypeOptions, handleLeaveTypeChange } =
    useLeaveTypeFilter();

  // Add state for latest leave balance
  const [latestLeaveBalance, setLatestLeaveBalance] = useState<{
    leave_balance: number;
    unpaid_leave_balance: number;
  } | null>(null);

  // Fetch latest leave balance for selected user
  const { data: leaveBalanceData, refetch: refetchLeaveBalance } =
    useGetEmployeeLeaveBalanceQuery(
      { id: selectedLeave?.user?.data?.id?.toString() || "" },
      { skip: !selectedLeave?.user?.data?.id }
    );

  useEffect(() => {
    if (leaveBalanceData) {
      setLatestLeaveBalance(leaveBalanceData);
    }
  }, [leaveBalanceData]);

  // Update openModal to refetch leave balance
  const openModalWithBalance = useCallback(
    (leave: ILeave) => {
      openModal(leave);
      if (leave?.user?.data?.id) {
        setTimeout(() => {
          refetchLeaveBalance();
        }, 100);
      }
    },
    [openModal, refetchLeaveBalance]
  );

  // Enhanced validation for leaves
  const validateLeavesFilter = useCallback(() => {
    // If dates are provided, validate them
    if (startDate || endDate) {
      if (!startDate || !endDate) {
        setDateError("Please select both start and end dates");
        return false;
      }

      if (startDate < minDate) {
        setDateError(
          `Start date cannot be before January 1st, ${new Date().getFullYear()}`
        );
        return false;
      }

      if (endDate > maxDate) {
        setDateError("End date cannot be after today");
        return false;
      }

      if (startDate > endDate) {
        setDateError("Start date cannot be after end date");
        return false;
      }
    }

    // If no dates and no leave type, require at least one filter
    if (!startDate && !endDate && !leaveType && !searchQuery.trim()) {
      setDateError("Please select at least one filter option");
      return false;
    }

    setDateError("");
    return true;
  }, [
    startDate,
    endDate,
    leaveType,
    searchQuery,
    minDate,
    maxDate,
    setDateError,
  ]);

  // Load current data on mount
  useEffect(() => {
    fetchLeaves(
      {
        page: 1,
        startDate: "",
        endDate: "",
        search: searchQuery,
        leaveType,
      },
      false
    ).catch(() => {
      // Error is already handled in fetchLeaves
    }); // Don't show loading on initial load
  }, []);

  // Event handlers
  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStartDate(e.target.value);
      clearDateError();
    },
    [setStartDate, clearDateError]
  );

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEndDate = e.target.value;
      setEndDate(newEndDate);

      // Clear any existing date error first
      clearDateError();

      // If start date is already set, validate it against the new end date
      if (startDate && newEndDate && newEndDate < startDate) {
        setDateError("End date cannot be before start date");
      }
    },
    [setEndDate, clearDateError, startDate, setDateError]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        handleFilter();
      }
    },
    [searchQuery]
  );

  const handleFilter = useCallback(async () => {
    if (!validateLeavesFilter()) {
      return;
    }

    await fetchLeaves(
      {
        page: 1,
        startDate,
        endDate,
        search: searchQuery,
        leaveType,
      },
      true
    ).catch(() => {
      // Error is already handled in fetchLeaves
    }); // Show loading for filter operations
  }, [
    validateLeavesFilter,
    fetchLeaves,
    startDate,
    endDate,
    searchQuery,
    leaveType,
  ]);

  const handleClearFilter = useCallback(async () => {
    clearFilters();
    setLeaveType("");
    setDateError("");
    clearFetchError(); // Clear any existing fetch errors

    await fetchLeaves(
      {
        page: 1,
        startDate: "",
        endDate: "",
        search: "",
      },
      true
    ).catch(() => {
      // Error is already handled in fetchLeaves
    }); // Show loading for clear filter
  }, [clearFilters, setLeaveType, setDateError, clearFetchError, fetchLeaves]);

  const handleSearch = useCallback(async () => {
    await fetchLeaves(
      {
        page: 1,
        startDate,
        endDate,
        search: searchQuery,
        leaveType,
      },
      true
    ).catch(() => {
      // Error is already handled in fetchLeaves
    }); // Show loading for search
  }, [fetchLeaves, startDate, endDate, searchQuery, leaveType]);

  const handlePageChange = useCallback(
    async (newPage: number) => {
      await fetchLeaves(
        {
          page: newPage,
          startDate,
          endDate,
          search: searchQuery,
          leaveType,
        },
        true
      ).catch(() => {
        // Error is already handled in fetchLeaves
      }); // Show loading for pagination
    },
    [fetchLeaves, startDate, endDate, searchQuery, leaveType]
  );

  const handleApprove = useCallback(
    async (data: ILeave) => {
      closeModal();

      await executeWithLoading(
        async () => {
          try {
            await approveLeave({ id: data.id ?? 0 }).unwrap();

            // Refresh the data after approval
            await fetchLeaves(
              {
                page,
                startDate,
                endDate,
                search: searchQuery,
                leaveType,
              },
              false
            ); // Don't show loading for refresh after update
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.error ||
              "Failed to approve leave. Please try again.";
            toast.error(errorMessage);
            throw error; // Re-throw to let executeWithLoading handle it
          }
        },
        setIsLoading,
        "Leave approved successfully"
      );
    },
    [
      closeModal,
      executeWithLoading,
      approveLeave,
      fetchLeaves,
      page,
      startDate,
      endDate,
      searchQuery,
      leaveType,
      setIsLoading,
    ]
  );

  const handleReject = useCallback(
    async (data: ILeave) => {
      closeModal();

      await executeWithLoading(
        async () => {
          try {
            await rejectLeave({ id: data.id ?? 0 }).unwrap();

            // Refresh the data after rejection
            await fetchLeaves(
              {
                page,
                startDate,
                endDate,
                search: searchQuery,
                leaveType,
              },
              false
            ); // Don't show loading for refresh after update
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.error ||
              "Failed to reject leave. Please try again.";
            toast.error(errorMessage);
            throw error; // Re-throw to let executeWithLoading handle it
          }
        },
        setIsLoading,
        "Leave rejected successfully"
      );
    },
    [
      closeModal,
      executeWithLoading,
      rejectLeave,
      fetchLeaves,
      page,
      startDate,
      endDate,
      searchQuery,
      leaveType,
      setIsLoading,
    ]
  );

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      width: 170,
      renderCell: (params) => {
        return (
          <MDTypography
            display="block"
            variant="h6"
            color="text"
            fontWeight="medium"
          >
            {formatDateToReadable(params?.row?.createdAt)}
          </MDTypography>
        );
      },
    },
    {
      field: "user",
      headerName: "User",
      width: 250,
      renderCell: (params) => {
        const photo = getImageUrl(
          params.row.user?.user_detial?.Photo?.url ?? ""
        );

        return (
          <EmployeeTableRow
            image={photo}
            name={params.row.user?.username}
            email={params.row.user?.email}
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
          <MDTypography
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
            {getLeaveTypeTitle(params?.row?.leave_duration)}
          </MDTypography>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        return (
          <Chip
            label={params?.row?.status?.toUpperCase()}
            color={
              params?.row?.status === "approved"
                ? "success"
                : params?.row?.status === "declined"
                ? "error"
                : "warning"
            }
            size="small"
          />
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
            {formatDateToReadable(params?.row?.start_date)}
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
            {formatDateToReadable(params?.row?.end_date)}
          </MDTypography>
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
            <MDButton
              variant="text"
              color="orange"
              onClick={() => openModalWithBalance(params?.row as ILeave)}
            >
              View Details
            </MDButton>
          </div>
        );
      },
    },
  ];

  console.log(
    leavesData.map((leaves) => leaves),
    "Data"
  );

  // Check if data has been loaded but is empty
  const hasLoadedEmptyData =
    !isFetching && leavesData && leavesData.length === 0;

  return (
    <>
      <div className="h-[66vh]">
        <>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            All Leaves
            {hasLoadedEmptyData && (
              <Chip
                label="No leaves found"
                color="info"
                size="small"
                sx={{ ml: 2, fontSize: "0.75rem" }}
              />
            )}
          </Typography>

          {/* Date Filter Section */}
          <Box
            sx={{ mb: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Search & Filter
            </Typography>

            {(dateError || fetchError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dateError || fetchError}
              </Alert>
            )}

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <TextField
                label="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search by employee name, email, or leave title..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon>search</Icon>
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: minDate,
                  max: maxDate,
                }}
                sx={{ minWidth: 200 }}
                error={!!dateError}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: startDate || minDate,
                  max: maxDate,
                }}
                sx={{ minWidth: 200 }}
                error={!!dateError}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={leaveType}
                  sx={{
                    height: "40px",
                  }}
                  size="medium"
                  label="Leave Type"
                  onChange={handleLeaveTypeChange}
                >
                  {leaveTypeOptions.map((option) => (
                    <MuiMenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MuiMenuItem>
                  ))}
                </Select>
              </FormControl>
              <MDButton
                variant="contained"
                color="orange"
                onClick={handleFilter}
                disabled={
                  !startDate && !endDate && !leaveType && !searchQuery.trim()
                }
              >
                Apply Filter
              </MDButton>
              <MDButton
                variant="contained"
                color="info"
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
              >
                Search
              </MDButton>
              <MDButton
                variant="outlined"
                color="warning"
                onClick={handleClearFilter}
              >
                Clear All
              </MDButton>
            </Stack>
          </Box>

          <DataTable
            columns={columns}
            rows={leavesData}
            isLoading={isFetching}
            emptyViewTitle={
              fetchError
                ? "Error loading data"
                : hasLoadedEmptyData
                ? "No leaves found"
                : "Loading..."
            }
            emptyViewSubTitle={
              fetchError
                ? "Please try refreshing the page or contact support"
                : hasLoadedEmptyData
                ? "There are currently no leaves to display"
                : "Please wait while we fetch the data"
            }
            withPagination={leavesData && leavesData.length > 0}
            totalCount={100}
            page={page}
            isDataEmpty={leavesData.length === 0}
            onPressPageChange={(event, page) => {
              handlePageChange(page);
            }}
          />

          {/* Retry button for fetch errors */}
          {fetchError && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <MDButton
                variant="contained"
                color="primary"
                onClick={() => {
                  clearFetchError();
                  fetchLeaves(
                    {
                      page: 1,
                      startDate,
                      endDate,
                      search: searchQuery,
                      leaveType,
                    },
                    true
                  ).catch(() => {
                    // Error is already handled in fetchLeaves
                  });
                }}
                disabled={isFetching}
              >
                Retry
              </MDButton>
            </Box>
          )}
          <div className="flex justify-center mt-4 items-center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, page) => {
                handlePageChange(page);
              }}
            />
          </div>

          <Modal
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            open={open}
            onClose={closeModal}
          >
            <Paper
              elevation={3}
              sx={{
                width: 500,
                maxHeight: "60vh",
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
                  <Grid item>
                    <Avatar
                      src={getImageUrl(
                        selectedLeave?.user?.user_detial?.Photo?.url ?? ""
                      )}
                      alt={selectedLeave?.user?.username}
                      sx={{ width: 60, height: 60 }}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" gutterBottom>
                      {selectedLeave?.user?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedLeave?.user?.user_type}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
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
                  <Grid item xs={6}>
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
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Title
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave?.title}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave?.description}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
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

                <Grid item xs={6}>
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

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDateToReadable(selectedLeave?.start_date)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDateToReadable(selectedLeave?.end_date)}
                  </Typography>
                </Grid>

                {selectedLeave?.start_time && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Time
                    </Typography>
                    <Typography variant="body1">
                      {convertTo12HourFormat(selectedLeave.start_time)}
                    </Typography>
                  </Grid>
                )}

                {selectedLeave?.leave_duration === "half_day" && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Half Day
                    </Typography>
                    <Typography variant="body1">
                      {selectedLeave?.is_first_half
                        ? "First Half"
                        : "Second Half"}
                    </Typography>
                  </Grid>
                )}

                {selectedLeave?.decline_reason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Decline Reason
                    </Typography>
                    <Typography variant="body1" color="error">
                      {selectedLeave.decline_reason}
                    </Typography>
                  </Grid>
                )}

                {selectedLeave?.status === "pending" && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="flex-end"
                    >
                      <MDButton
                        variant="contained"
                        color="orange"
                        onClick={() => handleReject(selectedLeave)}
                      >
                        Reject
                      </MDButton>
                      <MDButton
                        variant="outlined"
                        color="orange"
                        onClick={() => handleApprove(selectedLeave)}
                      >
                        Approve
                      </MDButton>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Modal>
        </>
      </div>
    </>
  );
};

export default AllLeaves;
