/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  getIstTodayDateString,
  formatIstDate,
  formatIstDateTime,
  toIstDayjs,
} from "../../../utils/utils";
import { baseUrl } from "../../../api/endpoints";
import {
  useGetTaskOvertimesQuery,
  useCreateTaskOvertimeMutation,
  useGetTaskTimeSummaryQuery,
} from "../taskApi";

const AVATAR_COLORS = [
  "#b45309",
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#e11d48",
  "#0284c7",
  "#4f46e5",
];

const getAvatarBg = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name: string): string => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getImageUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export interface IOvertimeEntry {
  id: string;
  date: string;
  formattedDate: string;
  hours: number;
  minutes: number;
  totalMinutes: number;
  note: string;
  createdAt?: string;
  user?: {
    username?: string;
    photo?: string | null;
  } | null;
}

interface TaskOvertimeSectionProps {
  taskId?: string | number;
  selectedTask?: any;
  currentStatus?: string;
  entries?: IOvertimeEntry[];
  onChange?: (entries: IOvertimeEntry[]) => void;
}

const formatDuration = (mins: number) => {
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const getCalendarTime = (createdAt?: string) => {
  if (!createdAt) return "0m";
  const start = toIstDayjs(createdAt);
  if (!start || !start.isValid()) return "0m";
  const now = toIstDayjs(new Date());
  if (!now) return "0m";

  const diffMins = Math.max(0, now.diff(start, "minute"));
  const days = Math.floor(diffMins / (24 * 60));
  const hours = Math.floor((diffMins % (24 * 60)) / 60);
  const mins = diffMins % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
};

const getExpectedFinish = (remainingMinutes: number) => {
  if (remainingMinutes <= 0) return "Completed";
  const now = toIstDayjs(new Date());
  if (!now) return "";
  const finishTime = now.add(remainingMinutes, "minute");
  return formatIstDateTime(finishTime);
};

export const TaskOvertimeSection: React.FC<TaskOvertimeSectionProps> = ({
  taskId,
  selectedTask,
  currentStatus,
  entries: propEntries,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [overtimeDate, setOvertimeDate] = useState(() => getIstTodayDateString());
  const [overtimeHours, setOvertimeHours] = useState("1");
  const [overtimeMinutes, setOvertimeMinutes] = useState("0");
  const [overtimeNote, setOvertimeNote] = useState("");

  // Check if task is completed (either saved status or selected in form)
  const isCompleted =
    (currentStatus || selectedTask?.status || "").toLowerCase() === "completed";

  // Local entries used for CreateTaskModal (before task ID exists)
  const [localEntries, setLocalEntries] = useState<IOvertimeEntry[]>(
    propEntries || []
  );

  // 1. Fetch overtimes from GET /api/task-overtimes?taskItem={taskId}
  const { data: overtimesData, isLoading: isLoadingOvertimes } =
    useGetTaskOvertimesQuery(taskId as number | string, {
      skip: !taskId,
    });

  // 1b. Fetch time summary from GET /api/task-items/{taskId}/time-summary
  const { data: timeSummaryData } =
    useGetTaskTimeSummaryQuery(taskId as number | string, {
      skip: !taskId,
      pollingInterval: 4000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  // 2. Mutation for POST /api/task-overtimes
  const [createTaskOvertime, { isLoading: isPostingOvertime }] =
    useCreateTaskOvertimeMutation();

  // Combine backend overtimes from GET query and selectedTask.taskOvertimes
  const activeBackendEntries = useMemo<IOvertimeEntry[]>(() => {
    if (!taskId) return [];

    const raw =
      overtimesData && Array.isArray(overtimesData) && overtimesData.length > 0
        ? overtimesData
        : selectedTask?.taskOvertimes &&
          Array.isArray(selectedTask.taskOvertimes) &&
          selectedTask.taskOvertimes.length > 0
        ? selectedTask.taskOvertimes
        : overtimesData && Array.isArray(overtimesData)
        ? overtimesData
        : [];

    return raw.map((ot: any) => {
      const totalMins = Number(ot.timeInMinutes) || 0;
      const dateSource = ot.date || ot.createdAt;
      return {
        id: String(ot.id),
        date: dateSource,
        formattedDate: formatIstDate(dateSource, "medium") || dateSource,
        hours: Math.floor(totalMins / 60),
        minutes: totalMins % 60,
        totalMinutes: totalMins,
        note: ot.workInfo || ot.note || "",
        user: ot.user,
        createdAt: ot.createdAt,
      };
    });
  }, [taskId, overtimesData, selectedTask?.taskOvertimes]);

  // Active entries to display: API data if taskId exists, otherwise local state
  const activeEntries = taskId ? activeBackendEntries : propEntries || localEntries;

  // Tracked time from API and manual overtimes
  const trackedSeconds = Number(timeSummaryData?.totalTimeSpent) || 0;
  const trackedMinutes = Math.round(trackedSeconds / 60);

  const totalOvertimeMinutes = useMemo(() => {
    return activeEntries.reduce(
      (sum, item) => sum + (Number(item.totalMinutes) || 0),
      0
    );
  }, [activeEntries]);

  // Inspect task history for completion details
  const completionHistory = useMemo(() => {
    if (!selectedTask?.taskHistory || !Array.isArray(selectedTask.taskHistory)) {
      return null;
    }
    const reversed = [...selectedTask.taskHistory].reverse();
    return (
      reversed.find(
        (h: any) => (h.newStatus || "").toLowerCase() === "completed"
      ) || null
    );
  }, [selectedTask?.taskHistory]);

  const inProgressHistory = useMemo(() => {
    if (!selectedTask?.taskHistory || !Array.isArray(selectedTask.taskHistory)) {
      return null;
    }
    return (
      selectedTask.taskHistory.find(
        (h: any) => (h.newStatus || "").toLowerCase() === "in-progress"
      ) || null
    );
  }, [selectedTask?.taskHistory]);

  // Calculate duration between in-progress and completed from history
  const completionDurationMinutes = useMemo(() => {
    if (completionHistory?.createdAt && inProgressHistory?.createdAt) {
      const cTime = toIstDayjs(completionHistory.createdAt);
      const pTime = toIstDayjs(inProgressHistory.createdAt);
      if (cTime && pTime && cTime.isValid() && pTime.isValid()) {
        const diff = cTime.diff(pTime, "minute");
        if (diff > 0) return diff;
      }
    }
    return 0;
  }, [completionHistory, inProgressHistory]);

  const estimatedMinutes = Number(selectedTask?.estimatedMinutes) || 0;

  // Base worked minutes (actual tracked timer + manual overtimes)
  const baseWorkedMinutes = useMemo(() => {
    if (trackedSeconds > 0) {
      return trackedMinutes;
    }
    return totalOvertimeMinutes;
  }, [trackedSeconds, trackedMinutes, totalOvertimeMinutes]);

  // Total worked minutes: when completed, if no timer was running,
  // show the real time taken (history diff or estimatedMinutes) so it reflects 100% completion
  const workedMinutes: number = useMemo(() => {
    if (isCompleted && baseWorkedMinutes <= 0) {
      if (completionDurationMinutes > 0) {
        return completionDurationMinutes;
      }
      if (estimatedMinutes > 0) {
        return estimatedMinutes;
      }
      return 60; // 1h fallback if no estimate
    }
    return baseWorkedMinutes;
  }, [
    isCompleted,
    baseWorkedMinutes,
    completionDurationMinutes,
    estimatedMinutes,
  ]);

  const remainingMinutes: number = estimatedMinutes - workedMinutes;

  // Progress Bar percentage: Always 100% when completed!
  const progressPercent = useMemo(() => {
    if (isCompleted) return 100;
    if (estimatedMinutes <= 0) return workedMinutes > 0 ? 100 : 0;
    return Math.min(100, Math.round((workedMinutes / estimatedMinutes) * 100));
  }, [isCompleted, workedMinutes, estimatedMinutes]);

  const workingDays = useMemo(() => {
    if (estimatedMinutes <= 0) return "0";
    return (estimatedMinutes / 480).toFixed(1);
  }, [estimatedMinutes]);

  const calendarTime = useMemo(() => {
    return getCalendarTime(selectedTask?.createdAt);
  }, [selectedTask?.createdAt]);

  const expectedFinish = useMemo(() => {
    return getExpectedFinish(Math.max(0, remainingMinutes));
  }, [remainingMinutes]);

  // Current assignee helpers
  const currentAssigneeName = useMemo(() => {
    return (
      selectedTask?.assigned_to?.username ||
      selectedTask?.assigned_to?.name ||
      selectedTask?.Task_assigned_to ||
      ""
    ).trim();
  }, [selectedTask]);

  const currentAssigneeId = selectedTask?.assigned_to?.id;

  // The employee who completed the task
  const completerName = useMemo(() => {
    return (
      completionHistory?.changedBy ||
      currentAssigneeName ||
      "Assignee"
    ).trim();
  }, [completionHistory, currentAssigneeName]);

  // Combine employee breakdown from time-summary API and current task assignee
  const displayBreakdown = useMemo(() => {
    const rawList: any[] = Array.isArray(timeSummaryData?.employeeBreakdown)
      ? timeSummaryData.employeeBreakdown
      : [];
    const list = [...rawList];

    // If current assignee is not in list, add them so both are visible
    if (currentAssigneeName) {
      const alreadyPresent = list.some((emp) => {
        if (currentAssigneeId && emp.employeeId === currentAssigneeId) {
          return true;
        }
        const empName = (emp.employeeName || "").trim().toLowerCase();
        const curName = currentAssigneeName.toLowerCase();
        return empName === curName;
      });

      if (!alreadyPresent) {
        list.push({
          employeeId: currentAssigneeId || 0,
          employeeName: currentAssigneeName,
          photo: selectedTask?.assigned_to?.photo || null,
          totalTimeSpent: 0,
        });
      }
    }

    return list;
  }, [
    timeSummaryData?.employeeBreakdown,
    currentAssigneeId,
    currentAssigneeName,
    selectedTask?.assigned_to?.photo,
  ]);

  // Identify any previous workers who logged time but are NOT the current assignee
  const previousWorkers = useMemo(() => {
    return displayBreakdown.filter((emp) => {
      const isCurrent =
        (currentAssigneeId && emp.employeeId === currentAssigneeId) ||
        (currentAssigneeName &&
          emp.employeeName.toLowerCase() === currentAssigneeName.toLowerCase());
      return !isCurrent && emp.totalTimeSpent > 0;
    });
  }, [displayBreakdown, currentAssigneeId, currentAssigneeName]);

  const handleLogTime = async () => {
    const hoursNum = Number(overtimeHours) || 0;
    const minutesNum = Number(overtimeMinutes) || 0;
    const totalMinutes = hoursNum * 60 + minutesNum;

    if (totalMinutes <= 0) {
      toast.error("Please enter a valid overtime duration (greater than 0)");
      return;
    }

    if (!overtimeDate) {
      toast.error("Please select a date worked");
      return;
    }

    // 1. If taskId is available (EditTaskModal), call POST /api/task-overtimes
    if (taskId) {
      try {
        const payload = {
          date: overtimeDate,
          timeInMinutes: String(totalMinutes),
          workInfo: overtimeNote.trim(),
          task_item: Number(taskId),
        };

        await createTaskOvertime(payload).unwrap();

        toast.success("Overtime logged successfully!");
        setOvertimeNote("");
        setOvertimeHours("1");
        setOvertimeMinutes("0");
        setIsOpen(false);
      } catch (err: any) {
        toast.error(
          err?.data?.message ||
            err?.data?.error?.message ||
            err?.message ||
            "Failed to log overtime"
        );
      }
      return;
    }

    // 2. If taskId is not yet available (CreateTaskModal before creation), store in local list
    const newEntry: IOvertimeEntry = {
      id: `ot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: overtimeDate,
      formattedDate: formatIstDate(overtimeDate, "medium") || overtimeDate,
      hours: hoursNum,
      minutes: minutesNum,
      totalMinutes,
      note: overtimeNote.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...localEntries];
    setLocalEntries(updated);

    if (onChange) {
      onChange(updated);
    }

    toast.success("Overtime added (will be saved when task is created)");
    setOvertimeNote("");
    setOvertimeHours("1");
    setOvertimeMinutes("0");
    setIsOpen(false);
  };

  const handleRemoveLocalEntry = (entryId: string) => {
    const updated = localEntries.filter((item) => item.id !== entryId);
    setLocalEntries(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="space-y-3">
      {/* Estimation & Worked Time Progress Card (from User Screenshot) */}
      {selectedTask && (
        <div className="bg-[#fafafa] border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
          {/* Progress Bar (Full when completed!) */}
          <div className="w-full bg-slate-200/90 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? "bg-emerald-500"
                  : remainingMinutes < 0
                  ? "bg-rose-500"
                  : "bg-[#ff7300]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* First Line: Worked X of Y estimated (Z working days) · W left / Completed */}
          <div className="text-xs text-slate-600 leading-relaxed flex items-center justify-between flex-wrap gap-1">
            <div>
              Worked{" "}
              <span className="font-bold text-slate-800">
                {formatDuration(workedMinutes)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800">
                {formatDuration(estimatedMinutes)}
              </span>{" "}
              estimated{" "}
              {estimatedMinutes > 0 && (
                <span className="text-slate-500">
                  ({workingDays} working {workingDays === "1.0" ? "day" : "days"})
                </span>
              )}
            </div>

            <div>
              {isCompleted ? (
                <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-lg inline-flex items-center gap-1 text-[11px]">
                  <span>Completed</span>
                  <span className="text-[10px]">✓</span>
                </span>
              ) : (
                <span
                  className={
                    remainingMinutes < 0
                      ? "font-bold text-rose-600"
                      : "text-slate-600"
                  }
                >
                  {estimatedMinutes <= 0
                    ? ""
                    : remainingMinutes < 0
                    ? `+${formatDuration(Math.abs(remainingMinutes))} over estimate`
                    : `${formatDuration(remainingMinutes)} left`}
                </span>
              )}
            </div>
          </div>

          {/* Second Line: Calendar time X · expected finish Y / Finished */}
          <div className="text-xs text-slate-500 leading-relaxed">
            Calendar time{" "}
            <span className="font-medium text-slate-700">
              {calendarTime}
            </span>
            {" · "}
            {isCompleted ? (
              <span>
                Finished{" "}
                <span className="font-bold text-slate-800">
                  {completionHistory?.createdAt
                    ? formatIstDateTime(completionHistory.createdAt)
                    : "Completed ✓"}
                </span>
              </span>
            ) : (
              <span>
                expected finish{" "}
                <span className="font-bold text-slate-800">
                  {expectedFinish || "N/A"}
                </span>
              </span>
            )}
          </div>

          {/* Member Time Breakdown (from /api/task-items/{id}/time-summary) */}
          {displayBreakdown.length > 0 && (
            <div className="border-t border-slate-200/80 pt-2.5 mt-2 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span>Member Time Breakdown</span>
                  <span className="px-1.5 py-0.2 bg-slate-200/80 text-slate-700 rounded-full text-[10px] font-bold">
                    {displayBreakdown.length}
                  </span>
                </span>
                <span
                  className={`text-[10px] ${
                    isCompleted
                      ? "text-emerald-700 font-bold"
                      : "text-slate-500 font-semibold"
                  }`}
                >
                  {formatDuration(workedMinutes)} total
                </span>
              </div>

              {/* Status & Reassignment Banner */}
              {isCompleted ? (
                <div className="flex items-start gap-2 px-3 py-2 bg-emerald-50/90 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-950 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1" />
                  <span className="leading-snug">
                    <strong>Task Completed:</strong> Finished by{" "}
                    <strong className="text-emerald-900">
                      {completerName || currentAssigneeName}
                    </strong>
                    {workedMinutes > 0
                      ? ` (${formatDuration(workedMinutes)})`
                      : ""}
                    {previousWorkers.length > 0 && (
                      <span>
                        {" "}
                        · Previously worked by{" "}
                        {previousWorkers
                          .map(
                            (w) =>
                              `${w.employeeName} (${formatDuration(
                                Math.round((w.totalTimeSpent || 0) / 60)
                              )})`
                          )
                          .join(", ")}
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                previousWorkers.length > 0 &&
                currentAssigneeName && (
                  <div className="flex items-start gap-2 px-3 py-2 bg-amber-50/90 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                    <span className="leading-snug">
                      <strong className="text-amber-950">
                        Reassigned task:
                      </strong>{" "}
                      {previousWorkers
                        .map(
                          (w) =>
                            `${w.employeeName} (${formatDuration(
                              Math.round((w.totalTimeSpent || 0) / 60)
                            )})`
                        )
                        .join(", ")}{" "}
                      worked on this task · currently assigned to{" "}
                      <strong className="text-slate-900">
                        {currentAssigneeName}
                      </strong>
                    </span>
                  </div>
                )
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5 scrollbar-hide">
                {displayBreakdown.map((emp: any) => {
                  const empTrackedSecs = Number(emp.totalTimeSpent) || 0;
                  let empMins = Math.round(empTrackedSecs / 60);

                  const empPhoto = getImageUrl(emp.photo);
                  const isCurrent =
                    (currentAssigneeId && emp.employeeId === currentAssigneeId) ||
                    (currentAssigneeName &&
                      emp.employeeName.toLowerCase() ===
                        currentAssigneeName.toLowerCase());

                  const isCompleter =
                    isCompleted &&
                    ((completerName &&
                      emp.employeeName
                        .toLowerCase()
                        .includes(completerName.toLowerCase())) ||
                      (!completerName && isCurrent));

                  // When completed, ensure the employee who completed the task has the completion time!
                  if (isCompleted && isCompleter && empMins === 0) {
                    empMins = workedMinutes;
                  }

                  const hasWorked = empMins > 0;

                  return (
                    <div
                      key={emp.employeeId || emp.employeeName}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200/70 rounded-xl text-xs shadow-2xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {empPhoto ? (
                          <img
                            src={empPhoto}
                            alt={emp.employeeName}
                            className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: getAvatarBg(emp.employeeName),
                            }}
                          >
                            {getInitials(emp.employeeName)}
                          </div>
                        )}
                        <div className="min-w-0 flex flex-col">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="font-semibold text-slate-800 text-[11px] truncate max-w-[95px] sm:max-w-[110px]"
                              title={emp.employeeName}
                            >
                              {emp.employeeName}
                            </span>
                            {isCompleter ? (
                              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[8.5px] font-bold shrink-0">
                                ✓ Completed by
                              </span>
                            ) : isCurrent ? (
                              <span className="px-1 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[8.5px] font-bold shrink-0">
                                Current
                              </span>
                            ) : hasWorked ? (
                              <span className="px-1 py-0.2 bg-slate-100 text-slate-600 border border-slate-200/80 rounded-full text-[8.5px] font-semibold shrink-0">
                                Previous
                              </span>
                            ) : null}
                          </div>
                          {trackedSeconds > 0 && emp.totalTimeSpent > 0 ? (
                            <span className="text-[9px] text-slate-400">
                              {Math.round(
                                (emp.totalTimeSpent / trackedSeconds) * 100
                              )}
                              % of total
                            </span>
                          ) : isCompleted && isCompleter ? (
                            <span className="text-[9px] text-emerald-600 font-medium">
                              Completed task
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ml-1.5 ${
                          empMins > 0
                            ? isCompleter
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                              : "bg-orange-50 text-[#ff7300] border border-orange-200/70"
                            : "bg-slate-50 text-slate-400 border border-slate-200/50"
                        }`}
                      >
                        {formatDuration(empMins)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overtime Header Row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-800">
          Overtime
        </label>
        {!isOpen && (
          <button
            type="button"
            onClick={() => {
              setOvertimeDate(getIstTodayDateString());
              setIsOpen(true);
            }}
            className="text-xs font-semibold text-[#ff7300] hover:text-orange-600 transition-colors cursor-pointer flex items-center gap-1 select-none"
          >
            + Log overtime
          </button>
        )}
      </div>

      {/* Loading State for Edit Modal */}
      {taskId && isLoadingOvertimes && activeEntries.length === 0 && (
        <div className="py-2 text-center text-xs text-slate-400 animate-pulse">
          Loading overtimes...
        </div>
      )}

      {/* Overtime Entries List */}
      {activeEntries.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
          {activeEntries.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3.5 py-2.5 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-700 shadow-2xs animate-in fade-in duration-100"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* User avatar if returned by backend */}
                {item.user?.photo ? (
                  <img
                    src={item.user.photo}
                    alt={item.user?.username || "User"}
                    className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : item.user?.username ? (
                  <div className="w-5 h-5 rounded-full bg-orange-100 text-[#ff7300] font-bold text-[10px] flex items-center justify-center shrink-0 border border-orange-200">
                    {item.user.username.charAt(0).toUpperCase()}
                  </div>
                ) : null}

                {/* Duration Badge */}
                <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-200/80 text-[#ff7300] font-bold rounded-xl text-[11px] shrink-0">
                  {item.hours > 0 ? `${item.hours}h ` : ""}
                  {item.minutes > 0
                    ? `${item.minutes}m`
                    : item.hours === 0
                    ? "0m"
                    : ""}
                </span>

                {/* Date */}
                <span className="text-slate-700 font-semibold shrink-0">
                  {item.formattedDate || item.date}
                </span>

                {/* Description */}
                {item.note && (
                  <span className="text-slate-500 truncate max-w-xs sm:max-w-md">
                    · {item.note}
                  </span>
                )}
              </div>

              {/* Local Remove Button (only for CreateTaskModal before submission) */}
              {!taskId && (
                <button
                  type="button"
                  onClick={() => handleRemoveLocalEntry(item.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg cursor-pointer ml-2 shrink-0"
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expanded Overtime Card */}
      {isOpen && (
        <div className="bg-[#fafafa] border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs animate-in fade-in zoom-in-98 duration-150 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1.5">
              Date worked
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Date Input */}
              <div className="relative flex-1 sm:flex-[1.5] min-w-0 flex items-center">
                <input
                  type="date"
                  value={overtimeDate}
                  onChange={(e) => setOvertimeDate(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-slate-800 outline-none focus:border-primary transition-all shadow-2xs cursor-pointer"
                />
              </div>

              {/* Hours Input */}
              <div className="relative flex-1 min-w-0 flex items-center">
                <input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="1"
                  value={overtimeHours}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "");
                    setOvertimeHours(clean.slice(0, 2));
                  }}
                  className="w-full text-xs px-4 py-2.5 pr-10 bg-white border border-slate-200/90 rounded-2xl text-slate-800 outline-none focus:border-primary transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3.5 text-xs text-slate-400 pointer-events-none select-none">
                  hrs
                </span>
              </div>

              {/* Minutes Input */}
              <div className="relative flex-1 min-w-0 flex items-center">
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={overtimeMinutes}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "");
                    if (!clean) {
                      setOvertimeMinutes("");
                    } else if (Number(clean) > 59) {
                      setOvertimeMinutes("59");
                    } else {
                      setOvertimeMinutes(clean.slice(0, 2));
                    }
                  }}
                  className="w-full text-xs px-4 py-2.5 pr-11 bg-white border border-slate-200/90 rounded-2xl text-slate-800 outline-none focus:border-primary transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3.5 text-xs text-slate-400 pointer-events-none select-none">
                  mins
                </span>
              </div>
            </div>
          </div>

          {/* What did you work on? (optional) */}
          <div>
            <input
              type="text"
              placeholder="What did you work on? (optional)"
              value={overtimeNote}
              onChange={(e) => setOvertimeNote(e.target.value)}
              className="w-full text-xs px-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all shadow-2xs"
            />
          </div>

          {/* Buttons row + Helper text */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isPostingOvertime}
                onClick={handleLogTime}
                className="bg-[#ff7300] hover:bg-[#ea580c] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs hover:shadow-orange-500/20 cursor-pointer flex items-center gap-1.5"
              >
                {isPostingOvertime ? "Logging..." : "Log time"}
              </button>
              <button
                type="button"
                disabled={isPostingOvertime}
                onClick={() => {
                  setIsOpen(false);
                  setOvertimeNote("");
                  setOvertimeHours("1");
                  setOvertimeMinutes("0");
                }}
                className="text-slate-600 hover:text-slate-800 text-xs font-semibold px-3 py-2 cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline-block select-none text-right">
              Time worked outside 10:00–18:00 or on days off
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskOvertimeSection;
