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

/* -------------------- TYPES -------------------- */
interface WorkLog {
  id: number | string;
  employeeName: string;
  email: string;
  avatar?: string;
  totalTime: string;
  currentTask: string;
  workDate: string;
  rawSeconds: number;
  tasks: any[];
}

const START_HOUR = 9;
const END_HOUR = 22;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

const TimeLogAnalytics: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  // Popup states
  const [hoveredLog, setHoveredLog] = useState<WorkLog | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  const [expandedRow, setExpandedRow] = useState<string | number | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [getTimeLogs] = useLazyGetTimeLogsQuery();

  const fetchWorkLogs = async () => {
    setLoading(true);
    try {
      const response = await getTimeLogs({
        startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
        endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
        search: searchTerm,
      }).unwrap();

      const data = response?.work_logs ?? [];
      const formatted: WorkLog[] = data.map((log: any) => ({
        id: log.id,
        employeeName: log.user?.username ?? "N/A",
        email: log.user?.email ?? "N/A",
        avatar: log.user?.user_detial?.Photo[0]?.url,
        totalTime: log.total_time_taken
          ? secondsToHoursMinutes(log.total_time_taken)
          : "0 mins",
        rawSeconds: log.total_time_taken || 0,
        currentTask:
          log.tasks?.find((t: any) => t.is_running)?.task_title ??
          log.tasks?.[0]?.task_title ??
          "No active task",
        workDate: log.work_date,
        tasks: log.tasks ?? [],
      }));
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

  const filteredData = useMemo(() => {
    return workLogs.filter((log) =>
      log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, workLogs]);

  const toggleRow = (id: string | number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="flex-1 p-6 bg-[#F8F9FB] min-h-screen relative">
      <div className="max-w-325 mx-auto bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Timelines</h3>

          {/* 🔍 Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by employee"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 pl-9 pr-3 py-2 text-sm rounded-full border border-gray-200 
                   focus:outline-none focus:ring-2 focus:ring-indigo-100
                   placeholder:text-gray-400"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              <ImSearch size={20} className="text-primary" />{" "}
            </span>
          </div>
          <div className="flex gap-4">
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
        </div>

        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-400 text-[11px] uppercase tracking-wider">
              <th className="pb-2 text-left pl-4 font-semibold">Employee</th>
              <th className="pb-2 text-left font-semibold">Total Time</th>
              <th className="pb-2 text-left font-semibold px-4">
                Daily Activity Map
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-gray-400">
                  Loading details...
                </td>
              </tr>
            ) : (
              filteredData.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="bg-white group cursor-pointer hover:bg-slate-50 transition-all border border-gray-100 shadow-sm overflow-hidden rounded-xl">
                    <td className="py-4 pl-4 flex items-center gap-3 rounded-l-xl">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(log.id);
                        }}
                        className={`p-1 rounded-md transition-colors ${expandedRow === log.id ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400 group-hover:text-gray-600"}`}
                      >
                        {expandedRow === log.id ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>
                      <img
                        className="w-10 h-10 rounded-lg shadow-sm"
                        src={log.avatar}
                        alt=""
                      />
                      <span className="text-xs font-bold text-slate-700">
                        {log.employeeName}
                      </span>
                    </td>
                    <td className="text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-gray-400" />
                        {log.totalTime}
                      </div>
                    </td>
                    <td className="px-4 rounded-r-xl">
                      <div
                        className="flex gap-1 h-6"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPopupPos({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10,
                          });
                          setHoveredLog(log);
                        }}
                        onMouseLeave={() => setHoveredLog(null)}
                      >
                        {log.tasks.map((t: any, i: number) => (
                          <div
                            key={i}
                            className={`flex-1 rounded ${t.is_running === false && t.status === "completed" ? "bg-emerald-400" : t.is_running === true && t.status === "in-progress" ? "bg-blue-400" : "bg-orange-300"}`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>

                  {expandedRow === log.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={5} className="p-4 pt-0">
                        <div className="ml-2 border-l-2 border-dashed border-gray-200 pl-6 pb-4 space-y-2">
                          <div className="flex flex-row justify-between items-center mb-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[25%]">
                              Project & Task Breakdown
                            </p>{" "}
                            <div className="flex justify-between text-xs text-gray-500 gap-x-2 w-[70%]">
                              {Array.from({
                                length: END_HOUR - START_HOUR + 1,
                              }).map((_, i) => (
                                <div key={i}>{START_HOUR + i}:00</div>
                              ))}
                            </div>
                          </div>
                          {log.tasks.length > 0 ? (
                            log.tasks.map((task: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-white p-3  rounded-xl border border-gray-100 shadow-sm"
                              >
                                <div className="flex items-center gap-3 w-[25%]">
                                  <div
                                    className={`p-2 rounded-lg ${task.is_running === false && task.status === "completed" ? "bg-emerald-400/50 text-emerald-600" : task.is_running === true && task.status === "in-progress" ? "bg-blue-600/50 text-blue-600" : "bg-orange-300 text-orange-600"}`}
                                  >
                                    <Briefcase size={14} />
                                  </div>
                                  <div>
                                    <p className="text-[12px] font-bold text-slate-700">
                                      {task.task_title || "Untitled Project"}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                      {task.is_running === true &&
                                      task.status === "in-progress"
                                        ? "Currently Working"
                                        : task.is_running === false &&
                                            task.status === "completed"
                                          ? "Completed Session"
                                          : "Not Started"}
                                    </p>
                                  </div>
                                </div>
                                <div className="w-[70%]">
                                  <div className="flex items-center justify-end gap-1.5 mb-1">
                                    <Clock
                                      size={10}
                                      className="text-gray-400"
                                    />
                                    <p className="text-xs font-black text-slate-800">
                                      {secondsToHoursMinutes(
                                        task.time_spent || 0,
                                      )}
                                    </p>
                                  </div>
                                  {/* <div className="h-1 w-[10%] bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${task.is_running === false && task.status === "completed" ? "bg-emerald-400" : task.is_running === true && task.status === "in-progress" ? "bg-blue-400" : "bg-blue-300"}`}
                                      style={{ width: "100%" }}
                                    />
                                  </div> */}
                                  <div className="relative h-6 rounded w-full">
                                    {task.work_sessions.map(
                                      (s: any, si: any) => {
                                        const end =
                                          s.end || dayjs().toISOString();
                                        function leftPercent(start: any) {
                                          const startTime = dayjs(start);
                                          const timelineStart = startTime
                                            .startOf("day")
                                            .hour(START_HOUR)
                                            .minute(0)
                                            .second(0);
                                          let minutesFromStart = startTime.diff(
                                            timelineStart,
                                            "minute",
                                          );
                                          if (minutesFromStart < 0)
                                            minutesFromStart = 0;
                                          if (minutesFromStart > TOTAL_MINUTES)
                                            minutesFromStart = TOTAL_MINUTES;
                                          return (
                                            (minutesFromStart / TOTAL_MINUTES) *
                                            100
                                          );
                                        }

                                        function widthPercent(
                                          start: any,
                                          end: any,
                                        ): number {
                                          const startTime = dayjs(start);
                                          const endTime = dayjs(end);
                                          const timelineStart = startTime
                                            .startOf("day")
                                            .hour(START_HOUR)
                                            .minute(0)
                                            .second(0);
                                          // clamp start/end to timeline bounds
                                          let startMinutes = startTime.diff(
                                            timelineStart,
                                            "minute",
                                          );
                                          let endMinutes = endTime.diff(
                                            timelineStart,
                                            "minute",
                                          );
                                          if (startMinutes < 0)
                                            startMinutes = 0;
                                          if (startMinutes > TOTAL_MINUTES)
                                            startMinutes = TOTAL_MINUTES;
                                          if (endMinutes < 0) endMinutes = 0;
                                          if (endMinutes > TOTAL_MINUTES)
                                            endMinutes = TOTAL_MINUTES;
                                          const durationMinutes = Math.max(
                                            endMinutes - startMinutes,
                                            0,
                                          );
                                          return (
                                            (durationMinutes / TOTAL_MINUTES) *
                                            100
                                          );
                                        }

                                        return (
                                          <div
                                            key={si}
                                            className={`absolute top-1 h-4 rounded ${
                                              s.end
                                                ? "bg-blue-500"
                                                : "bg-emerald-500"
                                            }`}
                                            style={{
                                              left: `${leftPercent(s.start)}%`,
                                              width: `${Math.max(
                                                widthPercent(s.start, end),
                                                1,
                                              )}%`,
                                            }}
                                          />
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 italic">
                              No task logs found for this date.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* -------------------- FLOATING POPUP -------------------- */}
      {hoveredLog && (
        <div
          className="fixed z-9999 w-64 p-4 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 pointer-events-none transition-all duration-200"
          style={{
            left: `${popupPos.x}px`,
            top: `${popupPos.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src={
                hoveredLog.avatar ||
                `https://ui-avatars.com/api/?name=${hoveredLog.employeeName}`
              }
              className="w-10 h-10 "
              alt=""
            />

            <div>
              <h4 className="text-[13px] font-bold text-slate-800 leading-tight">
                {hoveredLog.employeeName}
              </h4>
              <p className="text-[11px] text-gray-400">{hoveredLog.email}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <Clock size={14} className="text-gray-400" />{" "}
              {hoveredLog.totalTime}
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${hoveredLog.tasks.some((t) => t.is_running) ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}
            >
              {hoveredLog.tasks.some((t) => t.is_running)
                ? "• In Progress"
                : "• Paused"}
            </span>
          </div>
          <div className="bg-[#EEF2FF] border border-[#E0E7FF] p-2.5 rounded-xl flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#4F46E5] truncate max-w-35">
              {hoveredLog.currentTask}
            </span>
            <span className="text-[10px] font-bold text-[#818CF8]">
              {hoveredLog.totalTime}
            </span>
          </div>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100 shadow-sm" />
        </div>
      )}
    </div>
  );
};

export default TimeLogAnalytics;

const pickerStyles: SxProps<Theme> = {
  "& .MuiPickersInputBase-sectionsContainer": {
    width: "fit-content",
    padding: "12px 0",
  },
  "& .MuiPickersOutlinedInput-root": {
    borderRadius: "40px",
  },
  "& .MuiInputAdornment-root": {
    margin: 0,
  },
  "& .MuiPickersInputBase-sectionContent": {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "14px",
  },
  "& .MuiInputLabel-root": {
    transform: "translate(14px, 12px) scale(1)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    transform: " translate(14px, -9px) scale(0.75)",
  },
  "& .MuiInputLabel-root.MuiFormLabel-filled": {
    transform: " translate(14px, -9px) scale(0.75)",
  },
};
