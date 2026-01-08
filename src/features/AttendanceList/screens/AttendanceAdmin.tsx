/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from "react";
import {
  useLazyGetAllAttendanceQuery,
  useUpdateAttendanceMutation,
} from "../../dashboard/dashboardApi";
import type { IUserAttendance } from "../../dashboard/types";
import type { GridColDef } from "@mui/x-data-grid";
import EmployeeTableRow from "../../employee/components/employeeTableRow/EmployeeTableRow";
import { getImageUrl } from "../../../utils/utils";
import {
  formatTimeForInput,
  formatTimeForAPI,
  convertTo12HourFormat,
} from "../../../utils/timeUtils";
import { useApiOperations } from "../../../hooks/useApiOperations";
import { useFilterState } from "../../../hooks/useFilterState";
import { Pagination, TextField, Alert, Button, Dialog } from "@mui/material";
import { useLoadingWrapper } from "../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import CustomDataTable from "../../../shared/components/customDataTable/CustomDataTable.js";
import CustomBox from "../../../components/CustomBox/CustomBox.js";
import { Icons } from "../../../assets/myAssets/exporter.js";
import LinearGradient from "../../../components/LinearGradient/LinearGradient.js";
import CustomButton from "../../../components/CustomButton/CustomButton.js";
import dayjs from "dayjs";
import PickerInput from "../../../shared/components/pickerInput/PickerInput.js";
import { CgClose } from "react-icons/cg";

/* ===================== Attendance Data Hook ===================== */
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
      if (showLoading) setIsLoading(true);

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
      } catch (error) {
        setAttendanceData([]);
        throw error;
      } finally {
        if (showLoading) setIsLoading(false);
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

/* ===================== Modal Hook ===================== */
const useModalState = () => {
  const [open, setOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<IUserAttendance | null>(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [updateError, setUpdateError] = useState("");

  const openModal = useCallback((attendance: IUserAttendance) => {
    setSelectedAttendance(attendance);
    setEditCheckIn(formatTimeForInput(attendance.in || ""));
    setEditCheckOut(formatTimeForInput(attendance.out || ""));
    setUpdateError("");
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setSelectedAttendance(null);
    setEditCheckIn("");
    setEditCheckOut("");
    setUpdateError("");
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

/* ===================== Main Component ===================== */
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
    minDate,
    maxDate,
    clearFilters,
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

  useEffect(() => {
    fetchAttendance({ page: 1, startDate: "", endDate: "", search: "" }, true);
  }, []);

  const handleSearch = async () => {
    await fetchAttendance(
      {
        page: 1,
        startDate: startDate?.format("YYYY-MM-DD") || "",
        endDate: endDate?.format("YYYY-MM-DD") || "",
        search: searchQuery,
      },
      true
    ); // Show loading for search
  };

  /* ===================== Handlers ===================== */
  // const handleFilter = async () => {
  //   if (!validateDates()) return;
  //   await fetchAttendance(
  //     { page: 1, startDate, endDate, search: searchQuery },
  //     true
  //   );
  // };

  const handleClearFilter = async () => {
    clearFilters();
    await fetchAttendance(
      { page: 1, startDate: "", endDate: "", search: "" },
      true
    );
  };

  const handleUpdateAttendance = async () => {
    if (!editCheckIn || !editCheckOut) {
      setUpdateError("Both check-in and check-out times are required.");
      return;
    }

    closeModal();

    await executeWithLoading(async () => {
      if (!selectedAttendance?.id) return;

      await updateAttendance({
        data: {
          id: selectedAttendance.id,
          in: formatTimeForAPI(editCheckIn),
          out: formatTimeForAPI(editCheckOut),
        },
      }).unwrap();

      await fetchAttendance(
        {
          page,
          startDate: startDate?.format("YYYY-MM-DD") || "",
          endDate: endDate?.format("YYYY-MM-DD") || "",
          search: searchQuery,
        },
        false
      );
    }, setIsLoading);
  };

  /* ===================== Table Columns ===================== */
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Employee Code",
      width: 130,
      renderCell: (params) => (
        <span className="text-sm font-medium">
          {params?.row?.user?.user_detial?.empCode}
        </span>
      ),
    },
    {
      field: "employee",
      headerName: "Employee",
      width: 290,
      renderCell: ({ row }) => (
        <EmployeeTableRow
          image={getImageUrl(row?.user?.user_detial?.Photo?.[0]?.url)}
          name={row?.user?.user_detial?.name}
          email={row?.user?.email}
        />
      ),
    },

    {
      field: "date",
      headerName: "Date",
      width: 150,
      renderCell: (params) => (
        <span className="text-xs font-medium">
          {params?.row?.Date
            ? dayjs(params.row.Date).format("DD/MM/YYYY")
            : "-"}
        </span>
      ),
    },

    {
      field: "checkIn",
      headerName: "Check In",
      width: 100,
      renderCell: (params) => (
        <span className="text-xs font-medium">
          {convertTo12HourFormat(params?.row?.in) ?? "In Time Missing"}
        </span>
      ),
    },
    {
      field: "checkOut",
      headerName: "Check Out",
      width: 100,
      renderCell: (params) => (
        <span className="text-xs font-medium">
          {convertTo12HourFormat(params?.row?.out) ?? "Out Time Missing"}
        </span>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 70,
      renderCell: (params) => (
        <Button variant="text" onClick={() => openModal(params.row)}>
          {/* <Icon>update</Icon>&nbsp;Update */}
          <img src={Icons.EDIT} alt="" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <CustomBox customClasses="p-3 mb-4 w-full h-fit">
        <h2 className="text-2xl leading-8 font-semibold mb-4">Search</h2>
        {dateError && <Alert severity="error">{dateError}</Alert>}

        {/* <Stack direction="row" spacing={9} flexWrap="wrap"> */}
        <div className="flex  justify-between w-full gap-x-4 items-center">
          <TextField
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by employee"
            className="w-full"
          />
          <PickerInput
            label="Start Date"
            value={startDate}
            setValue={(date) => {
              setStartDate(date);

              // Reset end date if it becomes invalid
              if (endDate && date.isAfter(endDate)) {
                setEndDate(null);
              }
            }}
            shouldDisableDate={(date) =>
              date.isBefore(minDate) || date.isAfter(maxDate)
            }
          />

          <PickerInput
            label="End Date"
            value={endDate}
            setValue={setEndDate}
            shouldDisableDate={(date) =>
              (startDate && date.isBefore(startDate)) || date.isAfter(maxDate)
            }
          />
          <CustomButton
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isInitialLoading || isLoading}
            buttonStyle={!searchQuery.trim() ? "disabled" : "primary"}
            customStyles="h-13 w-30 p-2!"
            icon={
              <img className="w-full h-full" src={Icons.SEARCH_ICON} alt="" />
            }
          />
          <CustomButton
            onClick={handleClearFilter}
            customStyles="h-13 w-30 p-2!"
            disabled={!searchQuery.trim() || isInitialLoading || isLoading}
            buttonStyle={!searchQuery.trim() ? "disabled" : "primaryOutline"}
            icon={<CgClose size={24} />}
          />
        </div>
      </CustomBox>

      <CustomBox customClasses="w-full h-[70vh] p-5 pb-0 flex flex-col ">
        <h3 className="text-2xl font-semibold leading-8">Attendance</h3>
        <div className="w-full h-full">
          <CustomDataTable
            columns={columns}
            rows={attendanceData}
            isDataEmpty={attendanceData.length === 0}
            emptyViewTitle="No Attendance Found"
            emptyViewSubTitle=""
            isLoading={isInitialLoading || isLoading}
            withPagination={false}
          />
        </div>
        {attendanceData.length !== 0 && (
          <div className="w-full h-fit flex justify-center sticky bottom-0 bg-white pb-4 pt-4">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) =>
                fetchAttendance({
                  page: p,
                  startDate: startDate?.format("YYYY-MM-DD") || "",
                  endDate: endDate?.format("YYYY-MM-DD") || "",
                  search: searchQuery,
                })
              }
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 500,
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: "#FF7300",
                  color: "#fff",
                },
              }}
            />
          </div>
        )}
      </CustomBox>
      <Dialog open={open} onClose={closeModal}>
        <CustomBox customClasses="w-95 p-3 flex flex-col gap-3">
          <h3 className="text-lg font-semibold ">Update Attendance</h3>
          <LinearGradient />

          {updateError && <Alert severity="error">{updateError}</Alert>}

          <div className="flex  flex-col gap-4 ">
            <TextField
              className="w-full mb-4"
              label="Employee Name"
              disabled
              value={selectedAttendance?.user?.user_detial?.name || ""}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Check In"
              type="time"
              value={editCheckIn}
              onChange={(e) => setEditCheckIn(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Check Out"
              type="time"
              value={editCheckOut}
              onChange={(e) => setEditCheckOut(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <LinearGradient customClasses="" />

            <div className="flex gap-2 justify-end">
              <CustomButton
                label={"Update"}
                buttonStyle="primary"
                onClick={handleUpdateAttendance}
              />
              <CustomButton
                buttonStyle="secondary"
                label={"Cancel"}
                onClick={closeModal}
              />
            </div>
          </div>
        </CustomBox>
      </Dialog>
    </>
  );
};

export default AttendanceAdmin;
