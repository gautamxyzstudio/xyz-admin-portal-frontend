import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { useGetTaskBoardEmployeesQuery } from "../taskBoardApi";
import { userInState } from "../../auth/authSlice";
import type { IEmployeeTask, TaskStatus } from "../taskBoard.types";

const formatDuration = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const formatDate = (d: string | null) => {
  if (!d) return null;
  const date = new Date(`${d}T00:00:00`);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const STATUS_STYLE: Record<TaskStatus, { label: string; cls: string }> = {
  planned: { label: "Planned", cls: "bg-sky-50 text-sky-700" },
  "in-progress": { label: "In Progress", cls: "bg-amber-50 text-amber-700" },
  blocked: { label: "Blocked", cls: "bg-red-50 text-red-700" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700" },
};

const STATUS_ORDER: Record<string, number> = {
  "in-progress": 0,
  planned: 1,
  blocked: 2,
  completed: 3,
};

const PREVIEW_COUNT = 5;

/** "My Tasks" strip shown at the top of the Task Board for the logged-in user. */
const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(userInState);
  const { data, isLoading } = useGetTaskBoardEmployeesQuery(undefined, {
    pollingInterval: 30_000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const [expanded, setExpanded] = useState(false);

  const me = useMemo(
    () => data?.employees.find((e) => String(e.id) === String(currentUser?.id)) || null,
    [data, currentUser],
  );

  const openTasks = useMemo(
    () =>
      (me?.tasks ?? [])
        .filter((t) => t.status !== "completed")
        .sort(
          (a, b) =>
            (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
            (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
        ),
    [me],
  );

  if (isLoading) return null;

  const shown = expanded ? openTasks : openTasks.slice(0, PREVIEW_COUNT);
  const remaining = openTasks.reduce((sum, t) => {
    if (!t.estimatedMinutes) return sum;
    return sum + Math.max(0, t.estimatedMinutes * 60 - (t.totalTimeSpentSeconds || t.timeSpentSeconds));
  }, 0);

  const openTask = (t: IEmployeeTask) => {
    if (t.project?.title) navigate(`/tasks?project=${encodeURIComponent(t.project.title)}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs shrink-0">
      <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-primary" />
          <h2 className="text-sm font-semibold text-black-80">My Tasks</h2>
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-primary-20 text-primary">
            {openTasks.length} open
          </span>
        </div>
        {openTasks.length > 0 && (
          <p className="text-xs text-black-50">
            <b className="text-primary font-semibold">{formatDuration(remaining)}</b> on plate ·{" "}
            <b className="text-black-80 font-semibold">
              {formatDuration(me?.summary.totalTimeSeconds || 0)}
            </b>{" "}
            spent
          </p>
        )}
      </div>

      {openTasks.length === 0 ? (
        <p className="px-5 py-6 text-sm text-black-50 text-center">
          No open tasks assigned to you. 🎉
        </p>
      ) : (
        <>
          <ul className="divide-y divide-gray-100">
            {shown.map((t) => {
              const est = (t.estimatedMinutes || 0) * 60;
              const over = est > 0 && t.timeSpentSeconds > est;
              const due = formatDate(t.dueDate);
              const st = STATUS_STYLE[t.status] || STATUS_STYLE.planned;
              return (
                <li
                  key={t.id}
                  onClick={() => openTask(t)}
                  className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer"
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
                      {t.priority === "high" && <span className="text-red-600"> · High priority</span>}
                    </p>
                  </div>
                  <span className={`hidden sm:inline px-2 py-0.5 rounded-md text-xs font-medium ${st.cls}`}>
                    {st.label}
                  </span>
                  <div className="w-28 text-right shrink-0">
                    <p className={`text-sm font-semibold ${over ? "text-red-600" : "text-black-80"}`}>
                      {formatDuration(t.timeSpentSeconds)}
                    </p>
                    {est > 0 && <p className="text-[11px] text-black-50">of {formatDuration(est)}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
          {openTasks.length > PREVIEW_COUNT && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full py-2.5 text-xs font-semibold text-primary hover:bg-primary-20/30 border-t border-gray-100 rounded-b-2xl flex items-center justify-center gap-1 cursor-pointer"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Show all {openTasks.length} tasks <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default MyTasks;
