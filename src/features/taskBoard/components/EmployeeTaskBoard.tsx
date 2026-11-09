import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useGetTaskBoardEmployeesQuery } from "../taskBoardApi";
import { getImageUrl } from "../../../utils/utils";
import type { IEmployeeTask, ITaskBoardEmployee, TaskStatus } from "../taskBoard.types";

/* ---------------- helpers ---------------- */

const formatDuration = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0 && m === 0) return s > 0 ? "<1m" : "0m";
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const formatDate = (d: string | null) => {
  if (!d) return null;
  const date = new Date(`${d}T00:00:00`);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const STATUS_STYLE: Record<TaskStatus, { label: string; cls: string }> = {
  planned: { label: "Planned", cls: "bg-sky-50 text-sky-700" },
  "in-progress": { label: "In Progress", cls: "bg-amber-50 text-amber-700" },
  blocked: { label: "Blocked", cls: "bg-red-50 text-red-700" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700" },
};

const PRIORITY_STYLE: Record<string, string> = {
  high: "text-red-600",
  medium: "text-orange-500",
  low: "text-gray-400",
};

type StatusTab = TaskStatus | "open" | "all";
type SortKey = "plate" | "time" | "open" | "name";

// remaining time on one task = estimate - time already logged (never below 0)
const taskRemaining = (t: IEmployeeTask) =>
  t.status === "completed" || !t.estimatedMinutes
    ? 0
    : Math.max(0, t.estimatedMinutes * 60 - (t.totalTimeSpentSeconds || t.timeSpentSeconds));

// remaining work for an employee across all unfinished tasks
const workInfo = (emp: ITaskBoardEmployee) => {
  const open = emp.tasks.filter((t) => t.status !== "completed");
  return {
    openCount: open.length,
    remaining: open.reduce((sum, t) => sum + taskRemaining(t), 0),
    noEstimate: open.filter((t) => !t.estimatedMinutes).length,
  };
};

const TABS: [StatusTab, string][] = [
  ["open", "Open"],
  ["planned", "Planned"],
  ["in-progress", "In Progress"],
  ["blocked", "Blocked"],
  ["completed", "Completed"],
  ["all", "All"],
];

const matchesStatus = (t: IEmployeeTask, tab: StatusTab) =>
  tab === "all" ? true : tab === "open" ? t.status !== "completed" : t.status === tab;

const Avatar: React.FC<{ emp: ITaskBoardEmployee; size?: number }> = ({ emp, size = 36 }) => {
  const [failed, setFailed] = useState(false);
  const src = emp.photo ? getImageUrl(emp.photo) : "";
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={emp.name}
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-primary-20 text-primary font-semibold text-xs flex items-center justify-center shrink-0"
    >
      {(emp.name || emp.username || "?").charAt(0).toUpperCase()}
    </div>
  );
};

/* ---------------- component ---------------- */

interface Props {
  searchTerm: string;
  refreshKey?: number;
  /** Employee login: show only the logged-in user's own tasks (no employee list) */
  selfOnly?: boolean;
}

const EmployeeTaskBoard: React.FC<Props> = ({ searchTerm, refreshKey, selfOnly = false }) => {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, error, refetch } = useGetTaskBoardEmployeesQuery(undefined, {
    pollingInterval: 30_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (refreshKey) refetch();
  }, [refreshKey, refetch]);

  const [sortBy, setSortBy] = useState<SortKey>("plate");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusTab, setStatusTab] = useState<StatusTab>("open");
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");

  const employees = useMemo(
    () => (data?.employees ?? []).filter((e) => e.summary.totalTasks > 0),
    [data],
  );

  const visibleEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const list = employees.filter(
      (e) =>
        !term ||
        e.name?.toLowerCase().includes(term) ||
        e.designation?.toLowerCase().includes(term) ||
        e.tasks.some(
          (t) =>
            t.title?.toLowerCase().includes(term) ||
            t.project?.title?.toLowerCase().includes(term),
        ),
    );
    return [...list].sort((a, b) =>
      sortBy === "plate"
        ? workInfo(b).remaining - workInfo(a).remaining ||
          workInfo(b).openCount - workInfo(a).openCount
        : sortBy === "time"
        ? b.summary.totalTimeSeconds - a.summary.totalTimeSeconds
        : sortBy === "open"
          ? b.summary.openTasks - a.summary.openTasks
          : (a.name || "").localeCompare(b.name || ""),
    );
  }, [employees, searchTerm, sortBy]);

  const activeId = visibleEmployees.some((e) => e.id === selectedId)
    ? selectedId
    : (visibleEmployees[0]?.id ?? null);
  const selected = employees.find((e) => e.id === activeId) || null;

  const selectEmployee = (id: number) => {
    setSelectedId(id);
    setStatusTab("open");
    setProjectFilter("all");
  };

  const projectTasks = useMemo(
    () =>
      (selected?.tasks ?? []).filter(
        (t) => projectFilter === "all" || t.project?.id === projectFilter,
      ),
    [selected, projectFilter],
  );

  const projects = useMemo(() => {
    const m = new Map<number, string>();
    (selected?.tasks ?? []).forEach((t) => t.project && m.set(t.project.id, t.project.title));
    return [...m.entries()]
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [selected]);

  const tasks = projectTasks.filter((t) => matchesStatus(t, statusTab));

  const openTask = (t: IEmployeeTask) => {
    if (t.project?.title) navigate(`/tasks?project=${encodeURIComponent(t.project.title)}`);
  };

  /* ---------- states ---------- */
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress size={32} sx={{ color: "#f17c04" }} />
      </div>
    );
  }

  if (error) {
    const e = error as {
      status?: number | string;
      data?: { error?: { message?: string }; message?: string } | string;
    };
    const msg =
      typeof e?.data === "string" ? e.data : e?.data?.error?.message || e?.data?.message || "";
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12">
        <p className="text-sm font-semibold text-red-600">Failed to load employee tasks</p>
        <p className="text-xs text-black-50 mt-1">
          Server responded {e?.status ?? "with an error"}
          {msg ? `: ${msg}` : ""}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!employees.length) {
    return (
      <p className="text-center text-sm text-black-50 py-24">
        {selfOnly ? "No tasks assigned to you yet." : "No assigned tasks yet."}
      </p>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      {/* ---------- Employees ---------- */}
      {!selfOnly && (
      <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden lg:sticky lg:top-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-black-80">
            Employees <span className="text-black-50 font-normal">({visibleEmployees.length})</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="text-xs text-black-50 bg-transparent outline-none cursor-pointer"
          >
            <option value="plate">Most on plate</option>
            <option value="time">Most time spent</option>
            <option value="open">Most open tasks</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="max-h-[60vh] lg:max-h-[calc(100vh-230px)] overflow-y-auto scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleEmployees.length === 0 ? (
            <p className="text-center text-xs text-black-50 py-10">No match for "{searchTerm}"</p>
          ) : (
            visibleEmployees.map((emp) => {
              const active = emp.id === activeId;
              const work = workInfo(emp);
              return (
                <button
                  key={emp.id}
                  onClick={() => selectEmployee(emp.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-l-2 transition-colors cursor-pointer ${
                    active ? "border-primary bg-primary-20/40" : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <Avatar emp={emp} />
                    {emp.summary.runningTask && (
                      <span
                        title="Working now"
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm truncate ${active ? "font-semibold text-primary" : "font-medium text-black-80"}`}>
                        {emp.name}
                      </p>
                      <p
                        className="text-sm font-semibold text-primary whitespace-nowrap"
                        title="On plate: remaining time on open tasks (estimate minus time logged)"
                      >
                        {formatDuration(work.remaining)}
                        <span className="text-[11px] font-normal text-black-50"> on plate</span>
                      </p>
                    </div>
                    <p className="text-xs text-black-50 truncate">{emp.designation || emp.username}</p>
                    <div className="mt-1.5 flex justify-between gap-1 text-[11px]">
                      <span className="text-black-50" title="Open tasks">
                        <b className="text-black-80 font-semibold">{work.openCount}</b> open tasks
                      </span>
                      <span className="text-black-50 text-right" title="Time logged">
                        <b className="text-black-80 font-semibold">
                          {formatDuration(emp.summary.totalTimeSeconds)}
                        </b>{" "}
                        spent
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
      )}

      {/* ---------- Tasks ---------- */}
      {selected && (
        <div className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-100">
          {/* header */}
          <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
            <Avatar emp={selected} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-black-80 truncate">{selected.name}</p>
              <p className="text-xs text-black-50 truncate">
                {selected.designation || selected.username}
                {selected.summary.runningTask && (
                  <span className="text-emerald-600"> · Working on {selected.summary.runningTask.title}</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-base font-semibold text-primary">
                {formatDuration(workInfo(selected).remaining)}
              </p>
              <p className="text-[11px] text-black-50">
                on plate · {workInfo(selected).openCount} open tasks
                {workInfo(selected).noEstimate > 0 && (
                  <span className="text-orange-500" title="These tasks have no estimate, so they are not in the remaining hours">
                    {" "}({workInfo(selected).noEstimate} no estimate)
                  </span>
                )}
              </p>
            </div>
            <div className="text-right pl-4 border-l border-gray-100">
              <p className="text-base font-semibold text-black-80">
                {formatDuration(selected.summary.totalTimeSeconds)}
              </p>
              <p className="text-[11px] text-black-50">time spent</p>
            </div>
            {isFetching && <CircularProgress size={14} sx={{ color: "#f17c04" }} />}
          </div>

          {/* filters */}
          <div className="px-5 pt-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
            <div className="flex gap-5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map(([key, label]) => {
                const count = projectTasks.filter((t) => matchesStatus(t, key)).length;
                const isActive = statusTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStatusTab(key)}
                    className={`pb-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
                      isActive
                        ? "border-primary text-primary font-semibold"
                        : "border-transparent text-black-50 hover:text-black-80"
                    }`}
                  >
                    {label} <span className="text-xs opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
            {projects.length > 1 && (
              <select
                value={projectFilter}
                onChange={(e) =>
                  setProjectFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="mb-2 text-xs border border-black-20 rounded-lg px-2 py-1.5 outline-none focus:border-primary cursor-pointer max-w-[200px]"
              >
                <option value="all">All projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* list */}
          {tasks.length === 0 ? (
            <p className="text-center text-sm text-black-50 py-16">No tasks here.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tasks.map((t) => {
                const est = (t.estimatedMinutes || 0) * 60;
                const over = est > 0 && t.timeSpentSeconds > est;
                const due = formatDate(t.dueDate);
                const st = STATUS_STYLE[t.status] || STATUS_STYLE.planned;
                return (
                  <li
                    key={t.id}
                    onClick={() => openTask(t)}
                    className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-black-80 truncate">
                        {t.isRunning && (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 align-middle" />
                        )}
                        {t.title}
                      </p>
                      <p className="text-xs text-black-50 mt-0.5 truncate">
                        {t.project?.title || "No project"}
                        {due && (
                          <span className={t.isOverdue ? "text-red-600" : ""}>
                            {" "}· Due {due}
                            {t.isOverdue ? " (overdue)" : ""}
                          </span>
                        )}
                        {t.priority && (
                          <span className={PRIORITY_STYLE[t.priority]}>
                            {" "}· {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)} priority
                          </span>
                        )}
                      </p>
                    </div>
                    <span className={`hidden sm:inline px-2 py-0.5 rounded-md text-xs font-medium ${st.cls}`}>
                      {st.label}
                    </span>
                    <div className="w-36 text-right shrink-0">
                      <p className={`text-sm font-semibold ${over ? "text-red-600" : "text-black-80"}`}>
                        {formatDuration(t.timeSpentSeconds)}
                      </p>
                      {est > 0 ? (
                        <p className="text-[11px] text-black-50">
                          of {formatDuration(est)}
                          {t.status !== "completed" && (
                            <span className={over ? "text-red-600" : "text-primary"}>
                              {" "}· {over ? "over" : `${formatDuration(taskRemaining(t))} left`}
                            </span>
                          )}
                        </p>
                      ) : (
                        t.status !== "completed" && (
                          <p className="text-[11px] text-orange-500">no estimate</p>
                        )
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeTaskBoard;
