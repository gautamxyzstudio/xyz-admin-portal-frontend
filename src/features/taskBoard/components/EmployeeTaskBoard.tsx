import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useGetTaskBoardEmployeesQuery } from "../taskBoardApi";
import { getImageUrl } from "../../../utils/utils";
import ThemedDropdown from "../../../components/ThemedDropdown";
import ThemedDateRange from "../../../components/ThemedDateRange";
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

type StatusTab = TaskStatus | "open" | "all" | "worked";
type RangePreset = "all" | "today" | "yesterday" | "7d" | "month" | "custom";

/* ---- IST calendar helpers (dates as YYYY-MM-DD) ---- */
const istToday = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
const shiftDay = (d: string, days: number) => {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + days);
  return t.toISOString().slice(0, 10);
};
const shortDay = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });

const resolveRange = (
  preset: RangePreset,
  customFrom: string,
  customTo: string,
): { from: string; to: string } | null => {
  const today = istToday();
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = shiftDay(today, -1);
      return { from: y, to: y };
    }
    case "7d":
      return { from: shiftDay(today, -6), to: today };
    case "month":
      return { from: `${today.slice(0, 8)}01`, to: today };
    case "custom": {
      if (!customFrom && !customTo) return null;
      const a = customFrom || customTo;
      const b = customTo || customFrom;
      return a <= b ? { from: a, to: b } : { from: b, to: a };
    }
    default:
      return null;
  }
};

const rangeLabel = (r: { from: string; to: string } | null) => {
  if (!r) return "all time";
  const today = istToday();
  if (r.from === r.to) {
    if (r.from === today) return "today";
    if (r.from === shiftDay(today, -1)) return "yesterday";
    return `on ${shortDay(r.from)}`;
  }
  return `${shortDay(r.from)} – ${shortDay(r.to)}`;
};
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

// numbers shown for an employee: live (no range) or as of the end of the range
const figures = (emp: ITaskBoardEmployee, ranged: boolean) => {
  const r = emp.summary.range;
  if (ranged && r) {
    return {
      remaining: r.onPlateSeconds,
      openCount: r.openTasks,
      noEstimate: r.noEstimate,
      spent: r.seconds,
    };
  }
  return { ...workInfo(emp), spent: emp.summary.totalTimeSeconds };
};

const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: "all", label: "Live (all time)" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom range…" },
];

// today's plan: tasks in progress or worked on today, and their estimates
const todayPlan = (emp: ITaskBoardEmployee) => {
  const tasks = emp.tasks.filter((t) => t.todaySeconds > 0 || t.status === "in-progress");
  const estimate = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0) * 60, 0);
  const worked = emp.summary.todaySeconds || 0;
  return {
    worked,
    estimate,
    count: tasks.length,
    noEstimate: tasks.filter((t) => !t.estimatedMinutes).length,
    pct: estimate ? Math.round((worked / estimate) * 100) : 0,
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

// status to filter by: the status at the end of the range when a range is set
const statusOf = (t: IEmployeeTask, ranged: boolean): TaskStatus =>
  (ranged && t.range?.statusAtEnd) || t.status;

const matchesStatus = (t: IEmployeeTask, tab: StatusTab, ranged: boolean) => {
  if (tab === "all") return true;
  if (tab === "worked") return ranged ? (t.range?.seconds ?? 0) > 0 : t.todaySeconds > 0;
  const st = statusOf(t, ranged);
  return tab === "open" ? st !== "completed" : st === tab;
};

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
  // every role (HR, Management, employees) lands on today by default
  const [preset, setPreset] = useState<RangePreset>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const range = resolveRange(preset, customFrom, customTo);
  const ranged = !!range;
  const label = rangeLabel(range);
  const { data, isLoading, isFetching, error, refetch } = useGetTaskBoardEmployeesQuery(
    range ?? undefined,
    {
    pollingInterval: 30_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (refreshKey) refetch();
  }, [refreshKey, refetch]);

  const [sortBy, setSortBy] = useState<SortKey>("plate");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusTab, setStatusTab] = useState<StatusTab>("worked");
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");

  const changePreset = (p: RangePreset) => {
    setPreset(p);
    // with a range, start on the tasks actually worked in it
    setStatusTab(p === "all" ? "open" : "worked");
    if (p === "custom" && !customFrom) {
      const y = shiftDay(istToday(), -1);
      setCustomFrom(y);
      setCustomTo(y);
    }
  };

  const employees = useMemo(
    () => (data?.employees ?? []).filter((e) => e.summary.totalTasks > 0),
    [data],
  );

  const visibleEmployees = useMemo(() => {
    const term = selfOnly ? "" : searchTerm.toLowerCase().trim();
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
        ? figures(b, ranged).remaining - figures(a, ranged).remaining ||
          figures(b, ranged).openCount - figures(a, ranged).openCount
        : sortBy === "time"
        ? figures(b, ranged).spent - figures(a, ranged).spent
        : sortBy === "open"
          ? figures(b, ranged).openCount - figures(a, ranged).openCount
          : (a.name || "").localeCompare(b.name || ""),
    );
  }, [employees, searchTerm, sortBy, selfOnly, ranged]);

  const activeId = visibleEmployees.some((e) => e.id === selectedId)
    ? selectedId
    : (visibleEmployees[0]?.id ?? null);
  const selected = employees.find((e) => e.id === activeId) || null;

  const selectEmployee = (id: number) => {
    setSelectedId(id);
    setStatusTab(ranged ? "worked" : "open");
    setProjectFilter("all");
  };

  const projectTasks = useMemo(
    () =>
      (selected?.tasks ?? []).filter(
        (t) =>
          (projectFilter === "all" || t.project?.id === projectFilter) &&
          // with a range, hide tasks that did not exist yet by its end
          (!ranged || t.range?.existed !== false),
      ),
    [selected, projectFilter, ranged],
  );

  const projects = useMemo(() => {
    const m = new Map<number, string>();
    (selected?.tasks ?? []).forEach((t) => t.project && m.set(t.project.id, t.project.title));
    return [...m.entries()]
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [selected]);

  const taskTerm = selfOnly ? searchTerm.toLowerCase().trim() : "";
  const tasks = projectTasks.filter(
    (t) =>
      matchesStatus(t, statusTab, ranged) &&
      (!taskTerm ||
        t.title?.toLowerCase().includes(taskTerm) ||
        t.project?.title?.toLowerCase().includes(taskTerm)),
  );

  const openTask = (t: IEmployeeTask) => {
    if (!t.project?.title) return;
    // open the project board with this task's details already open
    const params = new URLSearchParams({ project: t.project.title, taskId: String(t.taskId || t.id) });
    navigate(`/tasks?${params.toString()}`);
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

  const tabs: [StatusTab, string][] = [
    ...TABS.slice(0, 1),
    ["worked", ranged ? "Worked on" : "Worked today"],
    ...TABS.slice(1),
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* ---------- Date range ---------- */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-xs text-black-50">Show</span>
        <ThemedDropdown
          value={preset}
          options={RANGE_OPTIONS}
          onChange={changePreset}
          align="right"
          ariaLabel="Date range"
        />
        {preset === "custom" && (
          <ThemedDateRange
            from={customFrom}
            to={customTo}
            max={istToday()}
            onChange={(a, b) => {
              setCustomFrom(a);
              setCustomTo(b);
            }}
          />
        )}
        {isFetching && <CircularProgress size={12} sx={{ color: "#f17c04" }} />}
      </div>

    <div className="flex flex-col lg:flex-row gap-4 items-start">
      {/* ---------- Employees ---------- */}
      {!selfOnly && (
      <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-gray-100 lg:sticky lg:top-0 lg:z-10">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-black-80">
            Employees <span className="text-black-50 font-normal">({visibleEmployees.length})</span>
          </span>
          <ThemedDropdown<SortKey>
            value={sortBy}
            onChange={setSortBy}
            variant="plain"
            align="right"
            ariaLabel="Sort employees"
            options={[
              { value: "plate", label: "Most on plate" },
              { value: "time", label: ranged ? `Most time ${label}` : "Most time spent" },
              { value: "open", label: "Most open tasks" },
              { value: "name", label: "Name" },
            ]}
          />
        </div>

        <div className="rounded-b-2xl max-h-[60vh] lg:max-h-[calc(100vh-230px)] overflow-y-auto scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleEmployees.length === 0 ? (
            <p className="text-center text-xs text-black-50 py-10">No match for "{searchTerm}"</p>
          ) : (
            visibleEmployees.map((emp) => {
              const active = emp.id === activeId;
              const work = figures(emp, ranged);
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
                        title={
                          ranged
                            ? `On plate at the end of ${label}: estimate minus time logged by then`
                            : "On plate: remaining time on open tasks (estimate minus time logged)"
                        }
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
                        {!ranged && emp.summary.todaySeconds > 0 && (
                          <>
                            <b className="text-emerald-600 font-semibold">
                              {formatDuration(emp.summary.todaySeconds)}
                            </b>
                            {todayPlan(emp).estimate > 0 && (
                              <span className="text-black-50"> / {formatDuration(todayPlan(emp).estimate)}</span>
                            )}{" "}
                            today ·{" "}
                          </>
                        )}
                        <b className="text-black-80 font-semibold">{formatDuration(work.spent)}</b>{" "}
                        {ranged ? label : "spent"}
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
            {(() => {
              const f = figures(selected, ranged);
              return (
                <>
                  <div className="text-right">
                    <p className="text-base font-semibold text-primary">{formatDuration(f.remaining)}</p>
                    <p className="text-[11px] text-black-50">
                      on plate{ranged && preset !== "today" ? ` (end of ${label})` : ""} · {f.openCount} open
                      tasks
                      {f.noEstimate > 0 && (
                        <span
                          className="text-orange-500"
                          title="These tasks have no estimate, so they are not in the remaining hours"
                        >
                          {" "}({f.noEstimate} no estimate)
                        </span>
                      )}
                    </p>
                  </div>
                  {preset !== "today" && (
                  <div className="text-right pl-4 border-l border-gray-100">
                    <p className="text-base font-semibold text-black-80">{formatDuration(f.spent)}</p>
                    <p className="text-[11px] text-black-50">
                      {ranged ? `time spent ${label}` : "time spent (all time)"}
                    </p>
                  </div>
                  )}
                  {(() => {
                    const plan = todayPlan(selected);
                    const over = plan.estimate > 0 && plan.worked > plan.estimate;
                    return (
                      <div
                        className="pl-4 border-l border-gray-100 w-48"
                        title={`Worked today vs. the estimates of ${plan.count} task${plan.count === 1 ? "" : "s"} in progress or worked on today`}
                      >
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-base font-semibold text-emerald-600">{formatDuration(plan.worked)}</span>
                          {plan.estimate > 0 && (
                            <span className="text-xs text-black-50">/ {formatDuration(plan.estimate)} est</span>
                          )}
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`att-bar h-full rounded-full ${over ? "bg-red-500" : "bg-emerald-500"}`}
                            style={{ width: `${plan.estimate ? Math.min(100, Math.max(plan.worked ? 3 : 0, plan.pct)) : 0}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-black-50 text-right mt-0.5">
                          worked today
                          {plan.estimate > 0 ? (
                            <span className={over ? "text-red-600" : "text-emerald-600"}>
                              {" "}· {over ? `${plan.pct}% (over)` : `${plan.pct}%`}
                            </span>
                          ) : plan.count > 0 ? (
                            <span className="text-orange-500"> · no estimate</span>
                          ) : null}
                        </p>
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </div>

          {/* filters */}
          <div className="px-5 pt-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
            <div className="flex gap-5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map(([key, tabLabel]) => {
                const count = projectTasks.filter((t) => matchesStatus(t, key, ranged)).length;
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
                    {tabLabel} <span className="text-xs opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
            {projects.length > 1 && (
              <ThemedDropdown<number | "all">
                value={projectFilter}
                onChange={setProjectFilter}
                align="right"
                className="mb-2"
                ariaLabel="Filter by project"
                options={[
                  { value: "all", label: "All projects" },
                  ...projects.map((p) => ({ value: p.id, label: p.title })),
                ]}
              />
            )}
          </div>

          {/* list */}
          {tasks.length === 0 ? (
            <p className="text-center text-sm text-black-50 py-16">No tasks here.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tasks.map((t) => {
                const est = (t.estimatedMinutes || 0) * 60;
                // with a range: logged up to its end; otherwise logged so far
                const logged = ranged ? (t.range?.loggedByEndSeconds ?? 0) : t.timeSpentSeconds;
                const left = ranged ? (t.range?.onPlateSeconds ?? 0) : taskRemaining(t);
                const shownStatus = statusOf(t, ranged);
                const over = est > 0 && logged > est;
                const due = formatDate(t.dueDate);
                const st = STATUS_STYLE[shownStatus] || STATUS_STYLE.planned;
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
                    <div className="w-40 text-right shrink-0">
                      {ranged ? (
                        <p className="text-sm font-semibold text-black-80" title={`Time logged ${label}`}>
                          {formatDuration(t.range?.seconds ?? 0)}
                          <span className="text-[11px] font-normal text-black-50"> {label}</span>
                        </p>
                      ) : (
                        <p className={`text-sm font-semibold ${over ? "text-red-600" : "text-black-80"}`}>
                          {formatDuration(t.timeSpentSeconds)}
                          {t.todaySeconds > 0 && (
                            <span className="text-[11px] font-normal text-emerald-600">
                              {" "}({formatDuration(t.todaySeconds)} today)
                            </span>
                          )}
                        </p>
                      )}
                      {est > 0 ? (
                        <p className="text-[11px] text-black-50">
                          {ranged ? `${formatDuration(logged)} of ` : "of "}
                          {formatDuration(est)}
                          {shownStatus !== "completed" && (
                            <span className={over ? "text-red-600" : "text-primary"}>
                              {" "}· {over ? "over" : `${formatDuration(left)} left`}
                            </span>
                          )}
                        </p>
                      ) : (
                        shownStatus !== "completed" && (
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
    </div>
  );
};

export default EmployeeTaskBoard;
