/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useLazyGetAllAttendanceQuery } from "../../dashboardApi";
import type { IUserAttendance } from "../../types";
import { convertTo12HourFormat, getWeekDates } from "../../../../utils/utils";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import ThemedTable, { PersonCell, Pill, WorkingNow } from "../../../../components/ThemedTable";

import dayjs from "dayjs";

const AttendanceTable = () => {
  const [getAllAttendance, { isFetching: isLoading, error }] =
    useLazyGetAllAttendanceQuery();

  const [attendanceData, setAttendanceData] = useState<IUserAttendance[]>([]);
  const [, setPage] = useState(1);

  const isTodayOrYesterday = (date?: string) => {
    if (!date) return false;

    const recordDate = dayjs(date).startOf("day");
    const today = dayjs().startOf("day");
    const yesterday = dayjs().subtract(1, "day").startOf("day");

    return recordDate.isSame(today) || recordDate.isSame(yesterday);
  };

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

      const filteredData = res.data
        .filter((item: any) => isTodayOrYesterday(item.Date))
        .map((item: any) => ({
          ...item,
          user: {
            ...item.user,
            email: item.user?.email || "",
            user_detial: {
              ...item.user?.user_detial,
              empCode: item.user?.user_detial?.empCode || "",
            },
          },
        }));

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


  const todayStr = dayjs().format("YYYY-MM-DD");

  const hoursOf = (row: any) => {
    let secs = Number(row.attendance_seconds) || 0;
    const toMin = (t?: string | null) => {
      if (!t) return null;
      const [h, m] = t.split(":").map(Number);
      return Number.isFinite(h) ? h * 60 + (m || 0) : null;
    };
    const inM = toMin(row.in);
    const outM = toMin(row.out);
    if (!secs && inM != null && outM != null) secs = Math.max(0, (outM - inM) * 60);
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  // today first, then by check-in time
  const rows = [...attendanceData].sort(
    (a: any, b: any) =>
      String(b.Date).localeCompare(String(a.Date)) || String(a.in || "").localeCompare(String(b.in || "")),
  );

  /* ================= UI ================= */
  return (
    <div className="w-full bg-white rounded-2xl flex flex-col p-5 gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-black-80">Attendance Logs</h3>
          <p className="text-xs text-black-50 mt-0.5">Check-ins for today and yesterday</p>
        </div>
        <Link
          to="/attendance"
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-primary hover:bg-primary-20 transition-colors"
        >
          View All
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ThemedTable<any>
        className="max-h-[420px]"
        rows={rows}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No attendance data found"
        emptySubtitle="Check-ins from today and yesterday will show here."
        columns={[
          {
            key: "employee",
            header: "Employee",
            width: "minmax(200px,2fr)",
            render: (r) => (
              <PersonCell
                name={r.user?.user_detial?.name}
                sub={r.user?.user_detial?.empCode}
                photo={r.user?.user_detial?.Photo?.[0]?.url}
              />
            ),
          },
          {
            key: "date",
            header: "Date",
            width: "1.1fr",
            render: (r) => {
              const d = dayjs(r.Date);
              const isToday = d.format("YYYY-MM-DD") === todayStr;
              return (
                <div className="flex items-center gap-2">
                  <Pill tone={isToday ? "orange" : "gray"}>{isToday ? "Today" : "Yesterday"}</Pill>
                  <span className="text-xs text-black-50">{d.format("DD/MM/YYYY")}</span>
                </div>
              );
            },
          },
          {
            key: "in",
            header: "Check in",
            width: "0.8fr",
            render: (r) => (r.in ? convertTo12HourFormat(r.in) : <span className="text-black-50">—</span>),
          },
          {
            key: "out",
            header: "Check out",
            width: "1fr",
            render: (r) =>
              r.out ? (
                convertTo12HourFormat(r.out)
              ) : r.in && dayjs(r.Date).format("YYYY-MM-DD") === todayStr ? (
                <WorkingNow />
              ) : (
                <span className="text-xs text-orange-500">Not checked out</span>
              ),
          },
          {
            key: "hours",
            header: "Hours",
            width: "0.7fr",
            align: "right",
            render: (r) => {
              const h = hoursOf(r);
              return h ? <span className="font-semibold">{h}</span> : <span className="text-black-50">—</span>;
            },
          },
        ]}
      />
    </div>
  );
};

export default AttendanceTable;
