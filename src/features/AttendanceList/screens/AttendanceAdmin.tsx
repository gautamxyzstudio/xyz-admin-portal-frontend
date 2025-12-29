/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../../examples/LayoutContainers/DashboardLayout/index.jsx';
import MDTypography from '../../../components/MDTypography';
import {
  useLazyGetAllAttendanceQuery,
  useUpdateAttendanceMutation,
} from '../../dashboard/dashboardApi';
import type { IUserAttendance } from '../../dashboard/types';
import DataTable from '../../../shared/components/datatable/DataTable';
import type { GridColDef } from '@mui/x-data-grid';
import EmployeeTableRow from '../../employee/components/employeeTableRow/EmployeeTableRow';
import { getImageUrl } from '../../../utils/utils';
import {
  formatTimeForInput,
  formatTimeForAPI,
  convertTo12HourFormat,
} from '../../../utils/timeUtils';
import { useApiOperations } from '../../../hooks/useApiOperations';
import { useFilterState } from '../../../hooks/useFilterState';
import {
  Box,
  Icon,
  Modal,
  Pagination,
  Typography,
  TextField,
  Stack,
  Alert,
  InputAdornment,
} from '@mui/material';
import MDButton from '../../../components/MDButton/MDButton';
import { useLoadingWrapper } from '../../../wrappers/loadingWrapper/LoadingWrapper.context.js';

// Custom hook for attendance data management
const useAttendanceData = () => {
  const [getAllAttendance] = useLazyGetAllAttendanceQuery();
  const [attendanceData, setAttendanceData] = useState<IUserAttendance[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { setIsLoading } = useLoadingWrapper();

  const fetchAttendance = useCallback(
    async (
      params: {
        page: number;
        startDate: string;
        endDate: string;
        search: string;
      },
      showLoading: boolean = true
    ) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await getAllAttendance({
          page: params.page,
          pageSize: 10,
          startDate: params.startDate,
          endDate: params.endDate,
          search: params.search,
        }).unwrap();

        setAttendanceData(response.data || []);
        setTotalPages(response.meta.pagination.pageCount);
        setPage(params.page);
        return response;
      } catch (error) {
        setAttendanceData([]);
        throw error;
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
        setIsInitialLoading(false);
      }
    },
    [getAllAttendance, setIsLoading]
  );

  return {
    attendanceData,
    page,
    totalPages,
    isInitialLoading,
    fetchAttendance,
  };
};

// Custom hook for modal state management
const useModalState = () => {
  const [open, setOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<IUserAttendance | null>(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [updateError, setUpdateError] = useState('');

  const openModal = useCallback((attendance: IUserAttendance) => {
    setSelectedAttendance(attendance);
    setEditCheckIn(formatTimeForInput(attendance.in || ''));
    setEditCheckOut(formatTimeForInput(attendance.out || ''));
    setUpdateError('');
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setSelectedAttendance(null);
    setEditCheckIn('');
    setEditCheckOut('');
    setUpdateError('');
  }, []);

  return {
    open,
    selectedAttendance,
    editCheckIn,
    setEditCheckIn,
    editCheckOut,
    setEditCheckOut,
    updateError,
    setUpdateError,
    openModal,
    closeModal,
  };
};

const AttendanceAdmin = () => {
  const [updateAttendance] = useUpdateAttendanceMutation();
  const { isLoading, setIsLoading } = useLoadingWrapper();
  const { executeWithLoading } = useApiOperations();

  const {
    attendanceData,
    page,
    totalPages,
    isInitialLoading,
    fetchAttendance,
  } = useAttendanceData();

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
    validateDates,
    clearFilters,
    clearDateError,
  } = useFilterState();

  const {
    open,
    selectedAttendance,
    editCheckIn,
    setEditCheckIn,
    editCheckOut,
    setEditCheckOut,
    updateError,
    setUpdateError,
    openModal,
    closeModal,
  } = useModalState();

  // Load current week on mount
  useEffect(() => {
    fetchAttendance(
      {
        page: 1,
        startDate: '',
        endDate: '',
        search: searchQuery,
      },
      true
    ); // Show loading on initial load
  }, []);

  // Event handlers
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Clear any existing date error first
    clearDateError();

    // If end date is already set, validate it against the new start date
    if (endDate && newStartDate && endDate < newStartDate) {
      setDateError('End date cannot be before start date');
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // Real-time validation for end date
    if (startDate && newEndDate && newEndDate < startDate) {
      setDateError('End date cannot be before start date');
    } else {
      clearDateError();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch();
    }
  };

  const handleFilter = async () => {
    if (!validateDates()) return;

    await fetchAttendance(
      {
        page: 1,
        startDate,
        endDate,
        search: searchQuery,
      },
      true
    ); // Show loading for filter operations
  };

  const handleClearFilter = async () => {
    clearFilters();
    await fetchAttendance(
      {
        page: 1,
        startDate: '',
        endDate: '',
        search: '',
      },
      true
    ); // Show loading for clear filter
  };

  const handleSearch = async () => {
    await fetchAttendance(
      {
        page: 1,
        startDate,
        endDate,
        search: searchQuery,
      },
      true
    ); // Show loading for search
  };

  const handlePageChange = async (newPage: number) => {
    await fetchAttendance(
      {
        page: newPage,
        startDate,
        endDate,
        search: searchQuery,
      },
      true
    ); // Show loading for pagination
  };

  const handleUpdateAttendance = async () => {
    if (!editCheckIn || !editCheckOut) {
      setUpdateError('Both check-in and check-out times are required.');
      return;
    }

    closeModal();

    await executeWithLoading(
      async () => {
        if (!selectedAttendance?.id) {
          setUpdateError('Attendance ID is missing.');
          return;
        }
        await updateAttendance({
          data: {
            id: selectedAttendance?.id,
            in: formatTimeForAPI(editCheckIn),
            out: formatTimeForAPI(editCheckOut),
          },
        }).unwrap();

        // Refresh the data
        await fetchAttendance(
          {
            page,
            startDate,
            endDate,
            search: searchQuery,
          },
          false
        ); // Don't show loading for refresh after update
      },
      setIsLoading,
      'Attendance updated successfully'
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'empCode',
      width: 80,
      renderCell: (params) => (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {params?.row?.user?.user_detial?.empCode}
        </MDTypography>
      ),
    },
    {
      field: 'employee',
      headerName: 'Employee',
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
      field: 'date',
      headerName: 'Date',
      width: 150,
      renderCell: (params) => (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {params?.row?.Date}
        </MDTypography>
      ),
    },
    {
      field: 'checkIn',
      headerName: 'Check In',
      width: 150,
      renderCell: (params) => (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {convertTo12HourFormat(params?.row?.in) ?? 'In Time Missing'}
        </MDTypography>
      ),
    },
    {
      field: 'checkOut',
      headerName: 'Check Out',
      width: 150,
      renderCell: (params) => (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {convertTo12HourFormat(params?.row?.out) ?? 'Out Time Missing'}
        </MDTypography>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 0.8,
      width: 100,
      renderCell: (params) => (
        <div className="flex flex-row gap-x-3">
          <MDButton
            variant="text"
            color="orange"
            onClick={() => openModal(params.row)}
          >
            <Icon>update</Icon>&nbsp;Update
          </MDButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="h-[66vh]">
        <>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Attendance Logs
          </Typography>

          {/* Date Filter Section */}
          <Box
            sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Search & Filter
            </Typography>

            {dateError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dateError}
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
                placeholder="Search by employee code, name, or email..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon>search</Icon>
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
                disabled={isInitialLoading || isLoading}
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
                disabled={isInitialLoading || isLoading}
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
                disabled={isInitialLoading || isLoading}
              />
              <MDButton
                variant="contained"
                color="orange"
                onClick={handleFilter}
                disabled={
                  !startDate ||
                  !endDate ||
                  isInitialLoading ||
                  isLoading ||
                  !!dateError
                }
              >
                Apply Filter
              </MDButton>
              <MDButton
                variant="contained"
                color="info"
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isInitialLoading || isLoading}
              >
                Search
              </MDButton>
              <MDButton
                variant="outlined"
                color="warning"
                onClick={handleClearFilter}
                disabled={isInitialLoading || isLoading}
              >
                Clear All
              </MDButton>
            </Stack>
          </Box>

          <DataTable
            columns={columns}
            rows={attendanceData}
            isDataEmpty={attendanceData.length === 0}
            emptyViewTitle="No attendance data found"
            emptyViewSubTitle="Please check back later"
            isLoading={isInitialLoading || isLoading}
            withPagination={true}
            totalCount={100}
            page={page}
            onPressPageChange={(_event, page) => {
              handlePageChange(page);
            }}
          />
          <div className="flex mt-4 justify-center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_event, page) => {
                handlePageChange(page);
              }}
              disabled={isInitialLoading || isLoading}
            />
          </div>
          <Modal
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            open={open}
            onClose={closeModal}
          >
            <Box
              sx={{
                width: 350,
                backgroundColor: '#fff',
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
                  disabled={isLoading}
                />
                <TextField
                  label="Check Out"
                  type="time"
                  value={editCheckOut}
                  onChange={(e) => setEditCheckOut(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isLoading}
                />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <MDButton
                    variant="contained"
                    color="orange"
                    onClick={handleUpdateAttendance}
                    disabled={isLoading}
                  >
                    Update
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="secondary"
                    onClick={closeModal}
                    disabled={isLoading}
                  >
                    Cancel
                  </MDButton>
                </Stack>
              </Stack>
            </Box>
          </Modal>
        </>
      </div>
    </>
  );
};

export default AttendanceAdmin;
