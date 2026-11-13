/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import {
  formatIstDateTime,
  toIstDayjs,
} from "../../../utils/utils";
import { baseUrl } from "../../../api/endpoints";
import { useGetTaskTimeSummaryQuery } from "../taskApi";

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
}) => {
  // Check if task is completed (either saved status or selected in form)
  const isCompleted =
    (currentStatus || selectedTask?.status || "").toLowerCase() === "completed";


  // 1b. Fetch time summary from GET /api/task-items/{taskId}/time-summary
  const { data: timeSummaryData, isError: timeSummaryFailed, error: timeSummaryError } =
    useGetTaskTimeSummaryQuery(taskId as number | string, {
      skip: !taskId,
      pollingInterval: 4000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });



  // Tracked time from API and backend overtimes
  const trackedSeconds = Number(timeSummaryData?.totalTimeSpent) || 0;
  const trackedMinutes = Math.round(trackedSeconds / 60);


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


  // Calculate duration between in-progress and completed from history

  const estimatedMinutes = Number(selectedTask?.estimatedMinutes) || 0;

  // Base worked minutes: timer time only (manually logged overtime is shown separately)
  const baseWorkedMinutes = trackedMinutes;

  // Total worked minutes: when completed, if no timer was running,
  // show the real time taken (history diff or estimatedMinutes) so it reflects 100% completion
  // actual timer running time only (never estimated or invented)
  const workedMinutes: number = baseWorkedMinutes;

  const remainingMinutes: number = estimatedMinutes - workedMinutes;

  // Progress Bar percentage: Always 100% when completed!
  const progressPercent = useMemo(() => {
    if (isCompleted) return 100;
    if (estimatedMinutes <= 0) return workedMinutes > 0 ? 100 : 0;
    return Math.min(100, Math.round((workedMinutes / estimatedMinutes) * 100));
  }, [isCompleted, workedMinutes, estimatedMinutes]);

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


  return (
    <div className="space-y-3">
      {/* Estimation & Worked Time Progress Card */}
      {selectedTask && (
        <div className="bg-[#fafafa] border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
          {timeSummaryFailed && (
            <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200/80 rounded-lg px-2.5 py-1.5">
              Couldn't load tracked time for this task — the numbers below may be incomplete.
              {(() => {
                // the portal's API layer turns errors into { message, statusCode }
                const e = timeSummaryError as
                  | { statusCode?: number; message?: string; status?: number | string; error?: string }
                  | undefined;
                const code = e?.statusCode ?? e?.status;
                const msg = e?.message || e?.error;
                return (
                  <span className="block text-rose-500/90 mt-0.5">
                    {code === 0 ? "Network error (request didn't reach the server)" : code ? `Error ${String(code)}` : "Error"}
                    {msg ? `: ${msg}` : ""}
                  </span>
                );
              })()}
            </p>
          )}

          {(timeSummaryData?.running?.length ?? 0) > 0 && (
            <StillWorking running={timeSummaryData!.running} formatDuration={formatDuration} />
          )}

          {(timeSummaryData?.longSessions?.length ?? 0) > 0 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 leading-relaxed">
              <b>Check the timer:</b>{" "}
              {timeSummaryData!.longSessions.map((ls, i) => (
                <span key={i}>
                  {i > 0 && "; "}
                  one session ran <b>{formatDuration(Math.round(ls.seconds / 60))}</b> (
                  {formatIstDateTime(ls.start)} → {formatIstDateTime(ls.end)})
                </span>
              ))}
              . It was probably left running — this is included in Time spent.
            </div>
          )}

          {/* ---- headline numbers ---- */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white border border-slate-200/70 px-3 py-2">
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Time spent</p>
              <p className={`text-lg font-bold leading-tight ${timeSummaryData?.isRunning ? "text-emerald-600" : "text-slate-800"}`}>
                {formatDuration(workedMinutes)}
              </p>
              <p className="text-[10.5px] text-slate-500">
                {timeSummaryData?.isRunning ? (
                  <span className="text-emerald-600 font-medium">● timer running</span>
                ) : (
                  "from the timer"
                )}
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200/70 px-3 py-2">
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Estimate</p>
              <p className="text-lg font-bold leading-tight text-slate-800">
                {estimatedMinutes > 0 ? formatDuration(estimatedMinutes) : "—"}
              </p>
              <p className="text-[10.5px] text-slate-500">{estimatedMinutes > 0 ? "planned for this task" : "no estimate set"}</p>
            </div>
            <div
              className={`rounded-xl border px-3 py-2 ${
                isCompleted
                  ? "bg-emerald-50 border-emerald-200/80"
                  : estimatedMinutes > 0 && remainingMinutes < 0
                    ? "bg-rose-50 border-rose-200/80"
                    : "bg-white border-slate-200/70"
              }`}
            >
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">
                {isCompleted ? "Status" : estimatedMinutes > 0 && remainingMinutes < 0 ? "Over by" : "Remaining"}
              </p>
              <p
                className={`text-lg font-bold leading-tight ${
                  isCompleted
                    ? "text-emerald-700"
                    : estimatedMinutes > 0 && remainingMinutes < 0
                      ? "text-rose-600"
                      : "text-primary"
                }`}
              >
                {isCompleted
                  ? "Done ✓"
                  : estimatedMinutes <= 0
                    ? "—"
                    : formatDuration(Math.abs(remainingMinutes))}
              </p>
              <p className="text-[10.5px] text-slate-500">
                {isCompleted
                  ? completionHistory?.createdAt
                    ? `finished ${formatIstDateTime(completionHistory.createdAt)}`
                    : "completed"
                  : estimatedMinutes > 0
                    ? `${Math.round((workedMinutes / estimatedMinutes) * 100)}% of estimate used`
                    : ""}
              </p>
            </div>
          </div>

          {/* ---- progress against the estimate ---- */}
          {estimatedMinutes > 0 && (
            <div>
              <div className="w-full bg-slate-200/90 rounded-full h-2 overflow-hidden">
                <div
                  className={`att-bar h-full rounded-full ${
                    isCompleted ? "bg-emerald-500" : remainingMinutes < 0 ? "bg-rose-500" : "bg-primary"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] text-slate-500 mt-1">
                <span>0</span>
                <span>estimate {formatDuration(estimatedMinutes)}</span>
              </div>
            </div>
          )}

          {/* ---- plain-language summary ---- */}
          <p className="text-xs text-slate-600 leading-relaxed">
            {(timeSummaryData?.days?.length ?? 0) > 0 ? (
              <>
                Worked on <b className="text-slate-800">{timeSummaryData!.days.length}</b>{" "}
                {timeSummaryData!.days.length === 1 ? "day" : "days"}
                {timeSummaryData!.days.length > 0 && (
                  <>
                    {" "}since{" "}
                    <b className="text-slate-800">
                      {new Date(`${timeSummaryData!.days[timeSummaryData!.days.length - 1].date}T00:00:00Z`).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", timeZone: "UTC" },
                      )}
                    </b>
                  </>
                )}
                {!isCompleted && estimatedMinutes > 0 && remainingMinutes > 0 && expectedFinish && (
                  <>
                    {" "}· at this pace it should be done by <b className="text-slate-800">{expectedFinish}</b>
                  </>
                )}
                .
              </>
            ) : workedMinutes > 0 ? (
              <>This time was recorded without start/stop times, so it can't be split by day.</>
            ) : (
              <>No time tracked yet — start the timer on this task to record time.</>
            )}
          </p>

          {/* Time by day (timer sessions per IST day) */}
          {(timeSummaryData?.days?.length ?? 0) > 0 && (
            <TimeByDay
              days={timeSummaryData!.days}
              isRunning={!!timeSummaryData?.isRunning}
              people={displayBreakdown}
              formatDuration={formatDuration}
            />
          )}

          {/* Member Time Breakdown (from /api/task-items/{id}/time-summary) */}
          {displayBreakdown.length > 0 && (
            <div className="border-t border-slate-200/80 pt-2.5 mt-2 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span>Member Time Breakdown</span>
                  {displayBreakdown.length > 1 && (
                    <span className="px-1.5 py-0.2 bg-slate-200/80 text-slate-700 rounded-full text-[10px] font-bold">
                      {displayBreakdown.length}
                    </span>
                  )}
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
                          {displayBreakdown.length > 1 &&
                          trackedSeconds > 0 &&
                          emp.totalTimeSpent > 0 ? (
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

    </div>
  );
};

export default TaskOvertimeSection;

/* ---------- Time by day ---------- */

const todayIstStr = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
const shiftIstDay = (d: string, n: number) => {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};

function TimeByDay({
  days,
  isRunning,
  people,
  formatDuration,
}: {
  days: { date: string; totalSeconds: number; employees: { employeeId: number; seconds: number }[] }[];
  isRunning: boolean;
  people: any[];
  formatDuration: (minutes: number) => string;
}) {
  const [showAll, setShowAll] = React.useState(false);
  const today = todayIstStr();
  const yesterday = shiftIstDay(today, -1);
  const max = Math.max(1, ...days.map((d) => d.totalSeconds));
  const shown = showAll ? days : days.slice(0, 5);
  const nameOf = (id: number) =>
    people.find((p: any) => Number(p.employeeId) === Number(id))?.employeeName || "Member";
  const label = (d: string) => {
    const date = new Date(`${d}T00:00:00Z`);
    const nice = date.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" });
    return d === today ? `Today · ${nice}` : d === yesterday ? `Yesterday · ${nice}` : nice;
  };

  return (
    <div className="border-t border-slate-200/80 pt-2.5 mt-2 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
        <span className="flex items-center gap-1.5">
          Time by day
          <span className="px-1.5 bg-slate-200/80 text-slate-700 rounded-full text-[10px] font-bold">{days.length}</span>
        </span>
        <span className="text-[10px] text-slate-500 font-semibold">
          {formatDuration(Math.round(days.reduce((s, d) => s + d.totalSeconds, 0) / 60))} tracked
        </span>
      </div>
      <ul className="space-y-1.5">
        {shown.map((d, i) => {
          const live = isRunning && d.date === today;
          return (
            <li
              key={d.date}
              className="tl-row px-2.5 py-2 bg-white border border-slate-200/70 rounded-xl"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-3 text-xs">
                <span className={`w-36 shrink-0 font-semibold ${d.date === today ? "text-primary" : "text-slate-700"}`}>
                  {label(d.date)}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`att-bar h-full rounded-full ${live ? "bg-emerald-500" : "bg-primary"}`}
                    style={{ width: `${Math.max(3, (d.totalSeconds / max) * 100)}%` }}
                  />
                </div>
                <span className={`w-16 text-right shrink-0 font-bold ${live ? "text-emerald-600" : "text-slate-800"}`}>
                  {formatDuration(Math.max(1, Math.round(d.totalSeconds / 60)))}
                </span>
              </div>
              {d.employees.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5 pl-[9.75rem]">
                  {d.employees.map((e) => (
                    <span key={e.employeeId} className="px-1.5 py-0.5 rounded-md bg-slate-50 text-[10px] text-slate-600">
                      {nameOf(e.employeeId)} · <b className="text-slate-800">{formatDuration(Math.max(1, Math.round(e.seconds / 60)))}</b>
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {days.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
        >
          {showAll ? "Show less" : `Show all ${days.length} days`}
        </button>
      )}
    </div>
  );
}

/* ---------- "Still working on this" banner ---------- */

function StillWorking({
  running,
  formatDuration,
}: {
  running: { employeeId: number; employeeName: string | null; since: string | null }[];
  formatDuration: (minutes: number) => string;
}) {
  // tick every 30s so the running time stays current
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const clock = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
      <span className="relative flex w-2.5 h-2.5 mt-1 shrink-0">
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
        <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
      </span>
      <div className="text-xs text-emerald-900 leading-relaxed">
        <p className="font-semibold">Still working on this</p>
        {running.map((r) => {
          const since = r.since ? Date.parse(r.since) : NaN;
          const mins = isNaN(since) ? 0 : Math.max(0, Math.round((now - since) / 60000));
          return (
            <p key={r.employeeId}>
              <b>{r.employeeName || "Someone"}</b>
              {r.since ? (
                <>
                  {" "}started the timer at <b>{clock(r.since)}</b> · running <b>{formatDuration(mins)}</b>
                </>
              ) : (
                " has the timer running"
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}
