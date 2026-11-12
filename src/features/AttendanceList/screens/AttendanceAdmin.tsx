/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  useLazyGetAllAttendanceQuery,
  useUpdateAttendanceMutation,
} from "../../dashboard/dashboardApi";
import type { IUserAttendance } from "../../dashboard/types";
import { convertTo12HourFormat, secondsToHoursMinutes } from "../../../utils/utils";
import { formatTimeForInput, formatTimeForAPI } from "../../../utils/timeUtils";
import { useApiOperations } from "../../../hooks/useApiOperations";
import { useFilterState } from "../../../hooks/useFilterState";
import { Pagination, Alert, Dialog } from "@mui/material";
import { Pencil, RotateCcw, Search, X } from "lucide-react";
import ThemedTable, { HoursBar, PersonCell, Pill, WorkingNow } from "../../../components/ThemedTable";
import { useLoadingWrapper } from "../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import CustomBox from "../../../components/CustomBox/CustomBox.js";
import dayjs from "dayjs";
import ThemedDateRange from "../../../components/ThemedDateRange";
import { rangePresets } from "../../../components/themedDates";
import { useTrackedTime } from "../../../shared/hooks/useTrackedTime";
import { useDebounce } from "../../../hooks/useDebounce.js";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";

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
      showLoading: boolean = true,
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

        const mappedData = (response.data || []).map((item: any) => ({
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

        setAttendanceData(mappedData);
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
    [getAllAttendance, setIsLoading],
  );

  return {
    attendanceData,
    page,
    totalPages,
    isInitialLoading,
    fetchAttendance,
    getAllAttendance,
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    attendanceData,
    page,
    totalPages,
    isInitialLoading,
    fetchAttendance,
    getAllAttendance,
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

  useEffect(() => {
  const today = dayjs();

  if (!startDate) setStartDate(today);
  if (!endDate) setEndDate(today);
}, []);

  const debouncedSearch = useDebounce(searchQuery, 500);

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
  const loadAttendance = async () => {
    if (startDate && !endDate) return;

    const currentStart = startDate?.format("YYYY-MM-DD") || "";
    const currentEnd = endDate?.format("YYYY-MM-DD") || "";

    // Only on first load, try today's attendance first
    if (isInitialLoad) {
      const response = await getAllAttendance({
        page: 1,
        pageSize: 10,
        startDate: currentStart,
        endDate: currentEnd,
        search: debouncedSearch,
      }).unwrap();

      if ((response.data || []).length === 0) {
        const yesterday = dayjs().subtract(1, "day");

        setStartDate(yesterday);
        setEndDate(yesterday);
        setIsInitialLoad(false);
        return;
      }

      setIsInitialLoad(false);
    }

    fetchAttendance(
      {
        page: 1,
        startDate: currentStart,
        endDate: currentEnd,
        search: debouncedSearch,
      },
      false
    );
  };

  loadAttendance();
}, [debouncedSearch, startDate, endDate]);

  const handleClearFilter = async () => {
    clearFilters();
    await fetchAttendance(
      { page: 1, startDate: "", endDate: "", search: "" },
      true,
    );
  };

  const handleExportCSV = async () => {
    setIsLoading(true);

    try {
      let allRows: any[] = [];

      //  Fetch ALL pages data
      for (let p = 1; p <= totalPages; p++) {
        const res = await getAllAttendance({
          page: p,
          pageSize: 10,
          startDate: startDate?.format("YYYY-MM-DD") || "",
          endDate: endDate?.format("YYYY-MM-DD") || "",
          search: searchQuery || "",
        }).unwrap();

        allRows = [...allRows, ...(res.data || [])];
      }

      if (!allRows.length) return;

      const wsData: any[][] = [];

      if (startDate || endDate) {
        wsData.push([
          `Date: ${startDate?.format("DD-MM-YYYY") || "All"}  To  ${endDate?.format("DD-MM-YYYY") || "All"
          }`,
        ]);
      }

      //  Headers
      wsData.push([
        "Employee Code",
        "Employee Name",
        "Date",
        "Check In",
        "Check Out",
        "Working Hours",
      ]);

      //  All rows
      allRows.forEach((row) => {


        wsData.push([
          row?.user?.user_detial?.empCode || "",
          row?.user?.user_detial?.name || "",
          row?.Date ? dayjs(row.Date).format("DD/MM/YYYY") : "",
          row.in ? convertTo12HourFormat(row.in) : "",
          row.out ? convertTo12HourFormat(row.out) : "",
          row.out
            ? secondsToHoursMinutes(row.working_hours || 0)
            : "In Progress",

        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      //  Column width (always)
      ws["!cols"] = [
        { wch: 18 },
        { wch: 22 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 20 },
      ];

      //  Style date row
      if (startDate || endDate) {
        ws["A1"].s = { font: { bold: true } };
        ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      const start = startDate?.format("YYYYMMDD") || "all";
      const end = endDate?.format("YYYYMMDD") || "all";

      XLSX.writeFile(wb, `attendance_${start}_to_${end}.xlsx`);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAttendance = async () => {
    if (!editCheckIn || !editCheckOut) {
      setUpdateError("Both check-in and check-out times are required.");
      return;
    }

    closeModal();

    await executeWithLoading(async () => {
      if (!selectedAttendance?.id) return;

      // API update call
      await updateAttendance({
        id: selectedAttendance.id,
        data: {
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
        false,
      );
    }, setIsLoading);
  };

  /* ===================== Derived UI values ===================== */
  const fromStr = startDate ? startDate.format("YYYY-MM-DD") : "";
  const toStr = endDate ? endDate.format("YYYY-MM-DD") : "";
  const todayStr = dayjs().format("YYYY-MM-DD");
  const hasFilters = !!(searchQuery || fromStr || toStr);
  const rangeText =
    fromStr && toStr
      ? fromStr === toStr
        ? fromStr === todayStr
          ? "Today"
          : dayjs(fromStr).format("DD MMM YYYY")
        : `${dayjs(fromStr).format("DD MMM")} – ${dayjs(toStr).format("DD MMM YYYY")}`
      : "All dates";

  // hours worked come from the time tracker (task timers), per employee per day
  const trackedItems = useMemo(
    () =>
      (attendanceData as any[]).map((r) => ({
        userId: r.user?.id,
        date: r.Date ? dayjs(r.Date).format("YYYY-MM-DD") : null,
      })),
    [attendanceData],
  );
  const { tracked } = useTrackedTime(trackedItems);
  const workedOf = (r: any) => tracked(r.user?.id, r.Date ? dayjs(r.Date).format("YYYY-MM-DD") : null);
  const longestSeconds = Math.max(1, ...(attendanceData as any[]).map((r) => workedOf(r).seconds));

  const goToPage = (p: number) =>
    fetchAttendance({
      page: p,
      startDate: fromStr,
      endDate: toStr,
      search: debouncedSearch,
    });

  /* ===================== UI ===================== */
  return (
    <>
      <CustomBox customClasses="w-full h-[calc(100vh-150px)] min-h-[520px] p-5 flex flex-col gap-4">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-black-80">Attendance</h2>
            <p className="text-xs text-black-50 mt-0.5">
              Team check-ins · <span className="text-primary font-medium">{rangeText}</span>
              {searchQuery && (
                <>
                  {" "}· matching “<span className="text-black-80">{searchQuery}</span>”
                </>
              )}
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={!attendanceData.length}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <FiDownload size={16} />
            Export
          </button>
        </div>

        {dateError && <Alert severity="error">{dateError}</Alert>}

        {/* toolbar */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
          <label className="att-search group flex items-center gap-2 flex-1 min-w-[220px] h-11 px-3.5 rounded-xl border border-gray-200 bg-[#fafafa] transition-all">
            <Search size={16} className="text-gray-400 group-focus-within:text-primary transition-colors shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by employee name or code…"
              className="w-full bg-transparent outline-none text-sm text-black-80 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="grid place-items-center w-6 h-6 rounded-full text-gray-400 hover:text-primary hover:bg-primary-20 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </label>

          <div className="w-full sm:w-auto shrink-0">
            <ThemedDateRange
              variant="field"
              className="[&_.tdd-field]:min-h-[44px] [&_.tdd-field]:rounded-xl [&_.tdd-field]:min-w-[230px]"
              from={fromStr}
              to={toStr}
              min={minDate.format("YYYY-MM-DD")}
              max={maxDate.format("YYYY-MM-DD")}
              placeholder="All dates"
              presets={(() => {
                const pr = rangePresets(maxDate.format("YYYY-MM-DD"));
                return [pr.today, pr.yesterday, pr.last7, pr.thisMonth, pr.lastMonth];
              })()}
              onChange={(from, to) => {
                setStartDate(from ? dayjs(from) : null);
                setEndDate(to ? dayjs(to) : null);
              }}
            />
          </div>

          {hasFilters && (
            <button
              onClick={handleClearFilter}
              className="att-clear inline-flex items-center gap-1.5 h-11 px-3.5 rounded-xl text-sm font-medium text-black-50 hover:text-primary hover:bg-primary-20 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          )}
        </div>

        {/* table */}
        <ThemedTable<any>
          className="flex-1 min-h-0 rounded-xl"
          rows={attendanceData as any[]}
          rowKey={(r) => r.id}
          loading={isInitialLoading || isLoading}
          minWidth={900}
          emptyTitle="No attendance found"
          emptySubtitle={hasFilters ? "Try another date range or clear the search." : undefined}
          columns={[
            {
              key: "employee",
              header: "Employee",
              width: "minmax(230px,2.2fr)",
              render: (r) => (
                <PersonCell
                  name={r.user?.user_detial?.name}
                  photo={r.user?.user_detial?.Photo?.[0]?.url}
                  sub={
                    <>
                      <span className="font-medium text-black-80/70">{r.user?.user_detial?.empCode}</span>
                      {r.user?.email && <> · {r.user.email}</>}
                    </>
                  }
                />
              ),
            },
            {
              key: "date",
              header: "Date",
              width: "minmax(120px,1fr)",
              render: (r) => {
                const d = dayjs(r.Date);
                const isToday = d.format("YYYY-MM-DD") === todayStr;
                return (
                  <div className="leading-tight">
                    <p className="font-medium">{isToday ? "Today" : d.format("ddd, DD MMM")}</p>
                    <p className="text-[11px] text-black-50">{d.format("DD/MM/YYYY")}</p>
                  </div>
                );
              },
            },
            {
              key: "in",
              header: "Check in",
              width: "0.9fr",
              render: (r) => (r.in ? convertTo12HourFormat(r.in) : <span className="text-black-50">—</span>),
            },
            {
              key: "out",
              header: "Check out",
              width: "minmax(130px,1.1fr)",
              render: (r) =>
                r.out ? (
                  convertTo12HourFormat(r.out)
                ) : r.in && dayjs(r.Date).format("YYYY-MM-DD") === todayStr ? (
                  <WorkingNow />
                ) : (
                  <Pill tone="orange">Not checked out</Pill>
                ),
            },
            {
              key: "hours",
              header: "Hours worked",
              width: "minmax(190px,1.6fr)",
              render: (r) => <HoursBar seconds={workedOf(r).seconds} max={longestSeconds} live={workedOf(r).live} />,
            },
            {
              key: "action",
              header: "",
              width: "56px",
              align: "right",
              render: (r) => (
                <button
                  onClick={() => openModal(r)}
                  title="Edit check-in / check-out"
                  aria-label="Edit attendance"
                  className="grid place-items-center w-8 h-8 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-20 transition-colors cursor-pointer"
                >
                  <Pencil size={15} />
                </button>
              ),
            },
          ]}
        />

        {/* pagination */}
        {attendanceData.length !== 0 && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs text-black-50">
              Page <b className="text-black-80">{page}</b> of {totalPages}
            </span>
            <Pagination
              count={totalPages}
              page={page}
              shape="rounded"
              siblingCount={1}
              onChange={(_, p) => goToPage(p)}
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 500,
                  fontSize: "0.8125rem",
                  borderRadius: "10px",
                  transition: "background-color .15s ease, color .15s ease",
                },
                "& .MuiPaginationItem-root:hover": {
                  backgroundColor: "var(--primary-20)",
                  color: "var(--primary)",
                },
                "& .MuiPaginationItem-root.Mui-selected, & .MuiPaginationItem-root.Mui-selected:hover": {
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                },
              }}
            />
          </div>
        )}
      </CustomBox>

      {/* edit dialog */}
      <Dialog
        open={open}
        onClose={closeModal}
        PaperProps={{ sx: { borderRadius: "20px", width: 400, maxWidth: "calc(100vw - 32px)" } }}
      >
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-black-80">Update attendance</h3>
              <p className="text-xs text-black-50 mt-0.5">
                {selectedAttendance?.Date ? dayjs(selectedAttendance.Date).format("dddd, DD MMM YYYY") : ""}
              </p>
            </div>
            <button
              onClick={closeModal}
              aria-label="Close"
              className="grid place-items-center w-8 h-8 rounded-full text-gray-400 hover:text-primary hover:bg-primary-20 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="rounded-xl bg-[#fafafa] border border-gray-100 p-3">
            <PersonCell
              name={selectedAttendance?.user?.user_detial?.name}
              photo={selectedAttendance?.user?.user_detial?.Photo?.[0]?.url}
              sub={selectedAttendance?.user?.user_detial?.empCode}
            />
          </div>

          {updateError && <Alert severity="error">{updateError}</Alert>}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Check in", value: editCheckIn, set: setEditCheckIn },
              { label: "Check out", value: editCheckOut, set: setEditCheckOut },
            ].map((f) => (
              <label key={f.label} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-black-80">{f.label}</span>
                <input
                  type="time"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="att-time h-11 px-3 rounded-xl border border-gray-200 bg-[#fafafa] text-sm text-black-80 outline-none transition-all"
                />
              </label>
            ))}
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-black-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateAttendance}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AttendanceAdmin;
