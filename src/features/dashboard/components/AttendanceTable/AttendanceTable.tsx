/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import {
  useLazyGetAllAttendanceQuery,
  useUpdateAttendanceMutation,
} from "../../dashboardApi";
import type { IUserAttendance } from "../../types";
import EmployeeTableRow from "../../../employee/components/employeeTableRow/EmployeeTableRow";
import { convertTo12HourFormat, getWeekDates } from "../../../../utils/utils";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import EmptyScreenView from "../../../../shared/components/EmptyScreenView/EmptyScreenView";
import { toast } from "react-toastify";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";
import { useAppSelector } from "../../../../state/store";
import { selectLeaveRequests } from "../../screens/dashboardHrSlice";

import dayjs from "dayjs";

const AttendanceTable = () => {
  const [getAllAttendance, { isFetching: isLoading, error }] =
    useLazyGetAllAttendanceQuery();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const { setIsLoading } = useLoadingWrapper();

  const [attendanceData, setAttendanceData] = useState<IUserAttendance[]>([]);
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [selectedAttendance] = useState<IUserAttendance | null>(null);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [updateError, setUpdateError] = useState("");

  /* ================= FETCH ================= */
  const fetchAttendance = async (isFirst?: boolean, pageNo?: number) => {
    try {
      const pageNumber = isFirst ? 1 : (pageNo ?? 1) + 1;
      const dates = getWeekDates();

      const res = await getAllAttendance({
        page: pageNumber,
        pageSize: 20,
        startDate: dates.startDate,
        endDate: dates.endDate,
      }).unwrap();

      if (isFirst) {
        setAttendanceData(res.data);
        setPage(1);
      } else {
        setAttendanceData((prev) => [...prev, ...res.data]);
        setPage(pageNumber);
      }
    } catch {
      toast.error("Failed to load attendance");
    }
  };

  useEffect(() => {
    fetchAttendance(true);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load attendance data");
    }
  }, [error]);

  const leaveRequestsFromStore = useAppSelector(selectLeaveRequests);

  /* ================= TIME HELPERS ================= */
  const formatTimeForInput = (time: string) =>
    time ? time.split(".")[0].split(":").slice(0, 2).join(":") : "";

  const formatTimeForAPI = (time: string) =>
    time.match(/^\d{2}:\d{2}$/) ? `${time}:00.000` : time;

  useEffect(() => {
    if (selectedAttendance) {
      setEditCheckIn(formatTimeForInput(selectedAttendance.in || ""));
      setEditCheckOut(formatTimeForInput(selectedAttendance.out || ""));
      setUpdateError("");
    }
  }, [selectedAttendance]);

  /* ================= UPDATE ================= */
  const handleUpdateAttendance = async () => {
    if (!selectedAttendance) {
      toast.error("Please select an attendance record");
      return;
    }

    if (!editCheckIn || !editCheckOut) {
      setUpdateError("Both check-in and check-out are required");
      return;
    }

    const { id } = selectedAttendance;

    setOpen(false);
    setIsLoading(true);

    try {
      await updateAttendance({
        data: {
          id,
          in: formatTimeForAPI(editCheckIn),
          out: formatTimeForAPI(editCheckOut),
        },
      }).unwrap();

      toast.success("Attendance updated successfully");
      await fetchAttendance(true);
    } catch {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      field: "empCode",
      headerName: "Emp Code",
      width: 90,
      renderCell: ({ row }: any) => (
        <span className="text-sm">{row.user?.user_detial?.empCode}</span>
      ),
    },
    {
      field: "employee",
      headerName: "Employee",
      width: 200,
      renderCell: (params: any) => (
        <EmployeeTableRow
          name={params?.row?.user?.user_detial?.name}
          showImage={false}
          showEmail={false}
        />
      ),
    },

    {
      field: "date",
      headerName: "Date",
      width: 140,
      renderCell: (params: any) => (
        <span>
          {params.row.Date ? dayjs(params.row.Date).format("DD/MM/YYYY") : "-"}
        </span>
      ),
    },

    {
      field: "checkIn",
      headerName: "Check In",
      width: 140,
      renderCell: ({ row }: any) => (
        <span>{convertTo12HourFormat(row.in) ?? "Missing"}</span>
      ),
    },
    {
      field: "checkOut",
      headerName: "Check Out",
      width: 70,
      renderCell: ({ row }: any) => (
        <span>{convertTo12HourFormat(row.out) ?? "Missing"}</span>
      ),
    },
  ];

  /* ================= UI ================= */
  return (
    <div className="mt-6 w-full h-[70vh] bg-white rounded-xl flex flex-col">
      {/* ===== Sticky Header ===== */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 flex justify-between rounded-2xl ">
        <h3 className="text-[24px] font-semibold text-black">
          Attendance Logs
        </h3>

        {leaveRequestsFromStore?.length > 0 && (
          <a
            className="px-4 py-2  text-primary rounded-lg text-base font-bold cursor-pointer"
            href="/attendance"
          >
            View All
          </a>
        )}
      </div>

      {/* ===== Scrollable Table Area ===== */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!isLoading && attendanceData.length === 0 ? (
          <EmptyScreenView
            isDataEmpty
            emptyViewTitle="No attendance data found"
            emptyViewSubTitle="Please check back later"
          />
        ) : (
          <CustomDataTable
            columns={columns}
            rows={attendanceData}
            isLoading={isLoading}
            withPagination
            page={page}
            onPressPageChange={(_, p) => fetchAttendance(false, p)}
          />
        )}
      </div>

      {/* ===== Modal remains unchanged ===== */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-90 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-3">Update Attendance</h4>

            {updateError && (
              <p className="text-red-500 text-sm mb-2">{updateError}</p>
            )}

            <div className="space-y-3">
              <input
                type="time"
                value={editCheckIn}
                onChange={(e) => setEditCheckIn(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="time"
                value={editCheckOut}
                onChange={(e) => setEditCheckOut(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-lg"
                onClick={handleUpdateAttendance}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
