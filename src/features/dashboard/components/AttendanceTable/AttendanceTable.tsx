/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useLazyGetAllAttendanceQuery } from "../../dashboardApi";
import type { IUserAttendance } from "../../types";
import { convertTo12HourFormat, getWeekDates } from "../../../../utils/utils";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import EmptyScreenView from "../../../../shared/components/EmptyScreenView/EmptyScreenView";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../../state/store";
import { selectLeaveRequests } from "../../screens/dashboardHrSlice";

import dayjs from "dayjs";

const AttendanceTable = () => {
  const [getAllAttendance, { isFetching: isLoading, error }] =
    useLazyGetAllAttendanceQuery();

  const [attendanceData, setAttendanceData] = useState<IUserAttendance[]>([]);
  const [page, setPage] = useState(1);

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

      const filteredData = res.data.filter((item: any) =>
        isTodayOrYesterday(item.Date)
      );

      if (isFirst) {
        setAttendanceData(filteredData);
        setPage(1);
      } else {
        setAttendanceData((prev) => [...prev, ...filteredData]);
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

  const isTodayOrYesterday = (date?: string) => {
    if (!date) return false;

    const recordDate = dayjs(date).startOf("day");
    const today = dayjs().startOf("day");
    const yesterday = dayjs().subtract(1, "day").startOf("day");

    return recordDate.isSame(today) || recordDate.isSame(yesterday);
  };

  const leaveRequestsFromStore = useAppSelector(selectLeaveRequests);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      field: "empCode",
      headerName: "Emp Code",
      width: 90,
      renderCell: ({ row }: any) => row.user?.user_detial?.empCode,
    },
    {
      field: "employee",
      headerName: "Employee",
      width: 200,
      renderCell: (params: any) => params?.row?.user?.user_detial?.name,
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
      renderCell: ({ row }: any) => convertTo12HourFormat(row.in),
    },
    {
      field: "checkOut",
      headerName: "Check Out",
      width: 140,
      renderCell: ({ row }: any) => convertTo12HourFormat(row.out),
    },
  ];

  /* ================= UI ================= */
  return (
    <div className="w-full h-100 bg-white rounded-xl flex flex-col">
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
    </div>
  );
};

export default AttendanceTable;
