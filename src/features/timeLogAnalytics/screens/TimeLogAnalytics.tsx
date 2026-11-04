/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Clock, ChevronDown, Briefcase } from "lucide-react";
import { useLazyGetTimeLogsQuery } from "../timeLogApi";
import { secondsToHoursMinutes } from "../../../utils/utils";
import dayjs, { Dayjs } from "dayjs";
import PickerInput from "../../../shared/components/pickerInput/PickerInput";
import type { SxProps, Theme } from "@mui/material";
import { ImSearch } from "react-icons/im";
import ActivityIndicator from "../../../shared/components/activityIndicator/ActivityIndicator";
import CustomButton from "../../../components/CustomButton/CustomButton";
import { FiDownload } from "react-icons/fi";

/* -------------------- TYPES -------------------- */
interface WorkLog {
  id: number | string;
  employeeId?: number;
  employeeName: string;
  email: string;
  avatar?: string;
  totalTime: string;
  currentTask: string;
  workDate: string;
  rawSeconds: number;
  tasks: any[];
}

const TASK_COLORS = [
  "bg-indigo-500 hover:bg-indigo-600",
  "bg-emerald-500 hover:bg-emerald-600",
  "bg-blue-500 hover:bg-blue-600",
  "bg-amber-500 hover:bg-amber-600",
  "bg-purple-500 hover:bg-purple-600",
  "bg-rose-500 hover:bg-rose-600",
  "bg-teal-500 hover:bg-teal-600",
  "bg-orange-500 hover:bg-orange-600",
];

const TASK_TEXT_COLORS = [
  "text-indigo-600 bg-indigo-50 border-indigo-100",
  "text-emerald-600 bg-emerald-50 border-emerald-100",
  "text-blue-600 bg-blue-50 border-blue-100",
  "text-amber-600 bg-amber-50 border-amber-100",
  "text-purple-600 bg-purple-50 border-purple-100",
  "text-rose-600 bg-rose-50 border-rose-100",
  "text-teal-600 bg-teal-50 border-teal-100",
  "text-orange-600 bg-orange-50 border-orange-100",
];

const TimeLogAnalytics: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  // Tooltip popup states
  const [hoveredLog, setHoveredLog] = useState<WorkLog | null>(null);
  const [hoveredTask, setHoveredTask] = useState<any | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  const [expandedRow, setExpandedRow] = useState<string | number | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [getTimeLogs] = useLazyGetTimeLogsQuery();

  const fetchWorkLogs = async () => {
    setLoading(true);
    try {
      const response: any = await getTimeLogs({
        startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
        endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
        search: searchTerm,
      }).unwrap();

      const employeesData = response?.employees;
      const legacyWorkLogs = response?.work_logs;

      let formatted: WorkLog[] = [];

      if (Array.isArray(employeesData)) {
        const defaultDate = startDate
          ? startDate.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD");

        employeesData.forEach((emp: any) => {
          const empName = emp.employee_username || "Unknown";
          const empAvatar =
            emp.photo_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}&background=E0E7FF&color=4F46E5`;
          const empEmail =
            emp.email ||
            `${empName.toLowerCase().replace(/\s+/g, "")}@xyz.com`;
          const logs = emp.work_logs || [];

          if (logs.length === 0) {
            formatted.push({
              id: `emp-${emp.employee_id}-${defaultDate}`,
              employeeId: emp.employee_id,
              employeeName: empName,
              email: empEmail,
              avatar: empAvatar,
              totalTime: "0 mins",
              rawSeconds: 0,
              currentTask: "No tasks logged",
              workDate: defaultDate,
              tasks: [],
            });
          } else {
            // Group by date
            const dateMap: Record<string, any[]> = {};
            logs.forEach((log: any) => {
              const d = log.date || defaultDate;
              if (!dateMap[d]) dateMap[d] = [];
              dateMap[d].push({
                id: log.work_log_id,
                work_log_id: log.work_log_id,
                task_title: log.work_log_title || "Untitled Task",
                work_log_title: log.work_log_title || "Untitled Task",
                project_name: log.project_name || "General",
                project: { title: log.project_name || "General" },
                total_time_taken: Number(log.total_time_taken) || 0,
                time_spent: Number(log.total_time_taken) || 0,
                date: d,
              });
            });

            Object.entries(dateMap).forEach(([dateStr, taskList]) => {
              const dayTotalSeconds = taskList.reduce(
                (acc, t) => acc + (t.total_time_taken || 0),
                0,
              );
              formatted.push({
                id: `emp-${emp.employee_id}-${dateStr}`,
                employeeId: emp.employee_id,
                employeeName: empName,
                email: empEmail,
                avatar: empAvatar,
                totalTime:
                  dayTotalSeconds > 0
                    ? secondsToHoursMinutes(dayTotalSeconds)
                    : "0 mins",
                rawSeconds: dayTotalSeconds,
                currentTask: taskList[0]?.work_log_title || "No tasks logged",
                workDate: dateStr,
                tasks: taskList,
              });
            });
          }
        });
      } else if (Array.isArray(legacyWorkLogs)) {
        formatted = legacyWorkLogs.map((log: any) => ({
          id: log.id,
          employeeName: log.user?.username ?? "N/A",
          email: log.user?.email ?? "N/A",
          avatar:
            log.user?.user_detial?.Photo?.[0]?.url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(log.user?.username ?? "N/A")}&background=E0E7FF&color=4F46E5`,
          totalTime: log.total_time_taken
            ? secondsToHoursMinutes(log.total_time_taken)
            : "0 mins",
          rawSeconds: log.total_time_taken || 0,
          currentTask:
            log.tasks?.find((t: any) => t.is_running)?.task_title ??
            log.tasks?.[0]?.task_title ??
            "No active task",
          workDate: log.work_date,
          tasks: (log.tasks ?? []).map((t: any) => ({
            ...t,
            work_log_title: t.task_title,
            project_name: t.project?.title || "General",
            total_time_taken: t.time_spent || 0,
          })),
        }));
      }

      setWorkLogs(formatted);
    } catch (err: any) {
      console.error("Error fetching work logs:", err);
      setWorkLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkLogs();
  }, [startDate, endDate]);

  const groupedLogs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = workLogs.filter((log) => {
      if (!term) return true;
      const matchEmp = log.employeeName.toLowerCase().includes(term);
      const matchTask = log.tasks.some(
        (t: any) =>
          (t.work_log_title || t.task_title || "").toLowerCase().includes(term) ||
          (t.project_name || t.project?.title || "").toLowerCase().includes(term),
      );
      return matchEmp || matchTask;
    });

    const groups: Record<string, WorkLog[]> = {};
    filtered.forEach((log) => {
      if (!groups[log.workDate]) {
        groups[log.workDate] = [];
      }
      groups[log.workDate].push(log);
    });

    // Sort dates descending
    return Object.entries(groups).sort((a, b) =>
      dayjs(b[0]).diff(dayjs(a[0])),
    );
  }, [searchTerm, workLogs]);

  const toggleRow = (id: string | number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const exportToCSV = () => {
    if (!workLogs.length) return;

    const term = searchTerm.toLowerCase().trim();
    const rows: any[] = [];

    workLogs
      .filter((log) => {
        if (!term) return true;
        const matchEmp = log.employeeName.toLowerCase().includes(term);
        const matchTask = log.tasks.some(
          (t: any) =>
            (t.work_log_title || t.task_title || "").toLowerCase().includes(term) ||
            (t.project_name || t.project?.title || "").toLowerCase().includes(term),
        );
        return matchEmp || matchTask;
      })
      .forEach((log) => {
        if (log.tasks && log.tasks.length > 0) {
          log.tasks.forEach((task: any) => {
            rows.push({
              Employee: log.employeeName,
              Email: log.email,
              Date: dayjs(log.workDate).format("DD-MM-YYYY"),
              Task: task.work_log_title || task.task_title || "N/A",
              Project: task.project_name || task.project?.title || "N/A",
              TimeSpent: secondsToHoursMinutes(
                task.total_time_taken ?? task.time_spent ?? 0,
              ),
            });
          });
        } else {
          rows.push({
            Employee: log.employeeName,
            Email: log.email,
            Date: dayjs(log.workDate).format("DD-MM-YYYY"),
            Task: "No Task",
            Project: "-",
            TimeSpent: log.totalTime,
          });
        }
      });

    if (rows.length === 0) return;

    const formatCell = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = Object.keys(rows[0]).map(formatCell).join(",");
    const csvLines = rows.map((row) =>
      Object.values(row).map(formatCell).join(","),
    );

    const csvContent = "\uFEFF" + [headers, ...csvLines].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.setAttribute(
      "download",
      `time_logs_${dayjs().format("YYYY-MM-DD")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 bg-[#F8F9FB] min-h-screen relative">
      <div className="max-w-[1300px] mx-auto bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
        {/* Top Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-800">Timelines</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
              {workLogs.length} {workLogs.length === 1 ? "Employee" : "Employees"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 🔍 Search */}
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <input
                type="text"
                placeholder="Search employee or task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-3 py-2 text-sm rounded-full border border-gray-200 
                     focus:outline-none focus:ring-2 focus:ring-indigo-100
                     placeholder:text-gray-400 bg-white"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary">
                <ImSearch size={16} />
              </span>
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-2">
              <PickerInput
                label="Start"
                value={startDate}
                setValue={setStartDate}
                disableFuture
                sx={pickerStyles}
              />
              <PickerInput
                label="End"
                value={endDate}
                setValue={setEndDate}
                disableFuture
                sx={pickerStyles}
              />
            </div>

            {/* Export CSV */}
            <CustomButton
              label="Export CSV"
              onClick={exportToCSV}
              customStyles="p-2! text-xs font-semibold whitespace-nowrap"
              buttonStyle="primary"
              icon={<FiDownload size={16} />}
            />
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[680px] border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-400 text-[11px] uppercase tracking-wider">
                <th className="pb-2 text-left pl-4 font-semibold w-[32%] sm:w-[28%]">
                  Employee
                </th>
                <th className="pb-2 text-left font-semibold w-[20%] sm:w-[16%]">
                  Total Time
                </th>
                <th className="pb-2 text-left font-semibold px-4 w-[48%] sm:w-[56%]">
                  Daily Activity Map
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-gray-400">
                    <div className="flex justify-center items-center min-h-[260px] p-6 bg-white rounded-xl w-full">
                      <ActivityIndicator size={60} />
                    </div>
                  </td>
                </tr>
              ) : groupedLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center">
                    <div className="max-w-sm mx-auto text-center space-y-2">
                      <Clock size={36} className="mx-auto text-slate-300 mb-2" />
                      <h4 className="text-sm font-bold text-slate-700">
                        No time logs found
                      </h4>
                      <p className="text-xs text-slate-400">
                        No work logs recorded for the selected date range.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                groupedLogs.map(([date, logs]) => (
                  <React.Fragment key={date}>
                    {/* Date Section Header */}
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="py-2.5 pl-4 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {dayjs(date).format("dddd")}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {dayjs(date).format("DD MMM YYYY")}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({logs.length} {logs.length === 1 ? "member" : "members"})
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Employee Rows */}
                    {logs.map((log) => (
                      <React.Fragment key={log.id}>
                        <tr
                          onClick={() => toggleRow(log.id)}
                          className="bg-white group cursor-pointer transition-all shadow-xs hover:shadow-md border border-slate-100 rounded-xl"
                        >
                          {/* Employee Info */}
                          <td className="py-3 pl-4 flex items-center gap-2.5 rounded-l-xl">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(log.id);
                              }}
                              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                                expandedRow === log.id
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {expandedRow === log.id ? (
                                <ChevronDown size={15} />
                              ) : (
                                <ChevronRight size={15} />
                              )}
                            </div>
                            <img
                              className="w-9 h-9 rounded-full object-cover shadow-xs border border-slate-100 shrink-0"
                              src={
                                log.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(log.employeeName)}&background=E0E7FF&color=4F46E5`
                              }
                              alt={log.employeeName}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(log.employeeName)}&background=E0E7FF&color=4F46E5`;
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-slate-700 block truncate">
                                {log.employeeName}
                              </span>
                            </div>
                          </td>

                          {/* Total Time */}
                          <td className="text-xs font-bold text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock
                                size={13}
                                className={
                                  log.rawSeconds > 0
                                    ? "text-indigo-500"
                                    : "text-gray-300"
                                }
                              />
                              <span
                                className={
                                  log.rawSeconds > 0
                                    ? "text-slate-700 font-extrabold"
                                    : "text-slate-400 font-medium"
                                }
                              >
                                {log.totalTime}
                              </span>
                            </div>
                          </td>

                          {/* Daily Activity Map */}
                          <td className="px-4 rounded-r-xl">
                            {log.tasks.length > 0 && log.rawSeconds > 0 ? (
                              <div className="flex gap-1 h-6 w-full bg-slate-100/70 p-0.5 rounded-lg overflow-hidden">
                                {log.tasks.map((t: any, i: number) => {
                                  const taskSeconds =
                                    t.total_time_taken || t.time_spent || 0;
                                  const widthPercent = Math.max(
                                    (taskSeconds / (log.rawSeconds || 1)) * 100,
                                    2,
                                  );
                                  const colorClass =
                                    TASK_COLORS[i % TASK_COLORS.length];

                                  return (
                                    <div
                                      key={i}
                                      onMouseEnter={(e) => {
                                        const rect =
                                          e.currentTarget.getBoundingClientRect();
                                        setPopupPos({
                                          x: rect.left + rect.width / 2,
                                          y: rect.top - 10,
                                        });
                                        setHoveredLog(log);
                                        setHoveredTask(t);
                                      }}
                                      onMouseLeave={() => {
                                        setHoveredLog(null);
                                        setHoveredTask(null);
                                      }}
                                      style={{ width: `${widthPercent}%` }}
                                      className={`h-full rounded-sm transition-all duration-150 cursor-pointer ${colorClass}`}
                                    />
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-6 w-full bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[10px] font-medium text-slate-400">
                                0 mins / No tasks logged
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* Expanded Task Breakdown */}
                        {expandedRow === log.id && (
                          <tr className="bg-slate-50/70">
                            <td colSpan={3} className="p-3 sm:p-5 pt-0">
                              <div className="ml-2 sm:ml-4 border-l-2 border-dashed border-indigo-200 pl-4 sm:pl-6 pb-2 space-y-3">
                                <div className="flex items-center justify-between pt-3 pb-1 border-b border-slate-200/60">
                                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Briefcase
                                      size={13}
                                      className="text-indigo-500"
                                    />
                                    Project & Task Breakdown
                                  </p>
                                  <span className="text-[11px] font-bold text-slate-400">
                                    {log.tasks.length}{" "}
                                    {log.tasks.length === 1 ? "Task" : "Tasks"}
                                  </span>
                                </div>

                                {log.tasks.length > 0 ? (
                                  log.tasks.map((task: any, idx: number) => {
                                    const taskSeconds =
                                      task.total_time_taken ||
                                      task.time_spent ||
                                      0;
                                    const percentage =
                                      log.rawSeconds > 0
                                        ? Math.round(
                                            (taskSeconds / log.rawSeconds) *
                                              100,
                                          )
                                        : 0;
                                    const colorClass =
                                      TASK_COLORS[idx % TASK_COLORS.length];
                                    const textBadgeClass =
                                      TASK_TEXT_COLORS[
                                        idx % TASK_TEXT_COLORS.length
                                      ];

                                    return (
                                      <div
                                        key={task.id || idx}
                                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs hover:border-indigo-100 transition-colors"
                                      >
                                        {/* Left: Task Info */}
                                        <div className="flex items-start sm:items-center gap-3 md:w-[45%] min-w-0">
                                          <div
                                            className={`p-2 rounded-lg shrink-0 ${textBadgeClass}`}
                                          >
                                            <Briefcase size={15} />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p
                                              className="text-xs font-bold text-slate-800 truncate"
                                              title={
                                                task.work_log_title ||
                                                task.task_title
                                              }
                                            >
                                              {task.work_log_title ||
                                                task.task_title ||
                                                "Untitled Task"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
                                                {task.project_name ||
                                                  task.project?.title ||
                                                  "General"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Right: Progress bar & Time */}
                                        <div className="md:w-[50%] flex items-center gap-3">
                                          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                              className={`h-full rounded-full transition-all duration-500 ${
                                                colorClass.split(" ")[0]
                                              }`}
                                              style={{
                                                width: `${Math.max(percentage, 2)}%`,
                                              }}
                                            />
                                          </div>
                                          <span className="text-[11px] font-semibold text-slate-400 min-w-[36px] text-right">
                                            {percentage}%
                                          </span>
                                          <div className="flex items-center gap-1 min-w-[70px] justify-end">
                                            <Clock
                                              size={12}
                                              className="text-gray-400"
                                            />
                                            <span className="text-xs font-extrabold text-slate-700">
                                              {secondsToHoursMinutes(
                                                taskSeconds,
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-xs text-gray-400 italic py-2">
                                    No task logs found for this date.
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- FLOATING POPUP -------------------- */}
      {hoveredLog && (
        <div
          className="fixed z-9999 w-72 p-3.5 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 pointer-events-none transition-all duration-150"
          style={{
            left: `${popupPos.x}px`,
            top: `${popupPos.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-2.5">
            <img
              src={
                hoveredLog.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(hoveredLog.employeeName)}&background=E0E7FF&color=4F46E5`
              }
              className="w-9 h-9 rounded-full object-cover shadow-xs border border-slate-100 shrink-0"
              alt={hoveredLog.employeeName}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">
                {hoveredLog.employeeName}
              </h4>
              <p className="text-[10px] text-gray-400 truncate">
                {dayjs(hoveredLog.workDate).format("DD MMM YYYY")}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Clock size={12} className="text-gray-400" />
              <span>Total: {hoveredLog.totalTime}</span>
            </div>
            {hoveredTask && hoveredLog.rawSeconds > 0 && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {Math.round(
                  ((hoveredTask.total_time_taken ||
                    hoveredTask.time_spent ||
                    0) /
                    hoveredLog.rawSeconds) *
                    100,
                )}% of day
              </span>
            )}
          </div>

          {hoveredTask ? (
            <div className="bg-[#EEF2FF] border border-[#E0E7FF] p-2.5 rounded-xl">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white/80 px-1.5 py-0.5 rounded">
                  {hoveredTask.project_name ||
                    hoveredTask.project?.title ||
                    "General"}
                </span>
                <span className="text-[11px] font-extrabold text-indigo-600">
                  {secondsToHoursMinutes(
                    hoveredTask.total_time_taken ||
                      hoveredTask.time_spent ||
                      0,
                  )}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-800 line-clamp-2">
                {hoveredTask.work_log_title || hoveredTask.task_title}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-center">
              <p className="text-xs text-slate-500 font-medium">
                {hoveredLog.currentTask}
              </p>
            </div>
          )}

          {/* Tooltip pointer */}
          <div className="absolute -z-10 -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100 shadow-sm" />
        </div>
      )}
    </div>
  );
};

export default TimeLogAnalytics;

const pickerStyles: SxProps<Theme> = {
  "& .MuiPickersInputBase-sectionsContainer": {
    width: "fit-content",
    padding: "8px 0",
  },
  "& .MuiPickersOutlinedInput-root": {
    borderRadius: "40px",
  },
  "& .MuiInputAdornment-root": {
    margin: 0,
  },
  "& .MuiPickersInputBase-sectionContent": {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "13px",
  },
  "& .MuiInputLabel-root": {
    transform: "translate(14px, 10px) scale(1)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    transform: " translate(14px, -9px) scale(0.75)",
  },
  "& .MuiInputLabel-root.MuiFormLabel-filled": {
    transform: " translate(14px, -9px) scale(0.75)",
  },
};
