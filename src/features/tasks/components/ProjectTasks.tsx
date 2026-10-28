/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Clock,
  ChevronDown,
  ChevronsUp,
  Equal,
  X,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import {
  useGetProjectTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  type IProjectTaskItem,
  type TaskStatus,
} from "../taskApi";
import { useGetActiveEmployeesQuery } from "../../allTasks/allTaskApi";
import { useGetTaskBoardProjectsQuery } from "../../taskBoard/taskBoardApi";
import { getImageUrl } from "../../../utils/utils";
import { toast } from "react-toastify";

// Column config matching the mockup
const COLUMNS: {
  id: TaskStatus;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}[] = [
  {
    id: "planned",
    label: "Planned",
    dotColor: "bg-blue-500",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-600",
    badgeBorder: "border-blue-200/60",
  },
  {
    id: "in-progress",
    label: "In-Progress",
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200/60",
  },
  {
    id: "blocked",
    label: "Blocked",
    dotColor: "bg-rose-500",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-600",
    badgeBorder: "border-rose-200/60",
  },
  {
    id: "completed",
    label: "Completed",
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200/60",
  },
];

// Helper to format minutes into "3h 15m" or "45m"
const formatTime = (minutes: number = 0): string => {
  const m = Number(minutes) || 0;
  if (m <= 0) return "0m";
  const hours = Math.floor(m / 60);
  const remainingMinutes = m % 60;
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMinutes}m`;
};

// Deterministic avatar background colors
const AVATAR_COLORS = [
  "#b45309", // Amber/brown
  "#2563eb", // Blue
  "#7c3aed", // Violet/purple
  "#059669", // Emerald/green
  "#e11d48", // Rose
  "#0284c7", // Sky
  "#4f46e5", // Indigo
];

const getAvatarBg = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name: string): string => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ProjectTasks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectName = searchParams.get("project") || "";
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  // Projects list for switcher and fallback
  const { data: boardProjects = [] } =
    useGetTaskBoardProjectsQuery();

  // If no project in URL, automatically select the first project
  useEffect(() => {
    if (!projectName && boardProjects.length > 0) {
      setSearchParams({ project: boardProjects[0].title }, { replace: true });
    }
  }, [projectName, boardProjects, setSearchParams]);

  // Click outside listener for project dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Drag and drop state
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  // Modal State for Add Task
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalTargetStatus, setModalTargetStatus] =
    useState<TaskStatus>("planned");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    estimatedMinutes: 60,
    assignedTo: "" as string | number,
  });

  // Modal State for Task Details / Status Change
  const [selectedTask, setSelectedTask] = useState<IProjectTaskItem | null>(
    null,
  );

  // RTK Query: fetch tasks for this project
  const {
    data: tasks = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectTasksQuery(
    { project: projectName },
    { skip: !projectName },
  );

  // RTK Query: employees for assigning tasks
  const { data: activeEmployees = [] } = useGetActiveEmployeesQuery();

  // Mutations
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  // Unique assignees in this project for the top avatar filter bar
  const projectAssignees = useMemo(() => {
    const map = new Map<string, { username: string; photo?: string | null }>();
    tasks.forEach((t) => {
      const username = t.assigned_to?.username || t.Task_assigned_to;
      if (username && !map.has(username)) {
        map.set(username, {
          username,
          photo: t.assigned_to?.photo,
        });
      }
    });
    // Supplement with active team members up to 5 members so avatar filter bar is always rich
    activeEmployees.forEach((emp) => {
      const uname = emp.username || emp.name;
      if (uname && !map.has(uname) && map.size < 5) {
        map.set(uname, {
          username: uname,
          photo: emp.photo,
        });
      }
    });
    return Array.from(map.values());
  }, [tasks, activeEmployees]);

  // Filter tasks based on search, selected assignee, and priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Search filter (title, description, key, id)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const keyMatch = `task-${t.id}`.toLowerCase().includes(query);
        const titleMatch = t.title.toLowerCase().includes(query);
        const descMatch = (t.description || "").toLowerCase().includes(query);
        if (!keyMatch && !titleMatch && !descMatch) return false;
      }

      // 2. Assignee filter
      if (selectedAssignee) {
        const username = t.assigned_to?.username || t.Task_assigned_to;
        if (username !== selectedAssignee) return false;
      }

      // 3. Priority filter
      if (selectedPriority !== "all") {
        if ((t.priority || "medium").toLowerCase() !== selectedPriority)
          return false;
      }

      return true;
    });
  }, [tasks, searchTerm, selectedAssignee, selectedPriority]);

  // Group filtered tasks by column
  const columnData = useMemo(() => {
    return COLUMNS.map((col) => {
      const colTasks = filteredTasks.filter((t) => t.status === col.id);
      const totalMinutes = colTasks.reduce(
        (sum, t) => sum + (Number(t.estimatedMinutes) || 0),
        0,
      );
      return {
        ...col,
        tasks: colTasks,
        totalTimeFormatted: formatTime(totalMinutes),
        count: colTasks.length,
      };
    });
  }, [filteredTasks]);

  // Handlers
  const handleOpenAddModal = (status: TaskStatus) => {
    setModalTargetStatus(status);
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      estimatedMinutes: 60,
      assignedTo: "",
    });
    setIsAddModalOpen(true);
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    if (!taskForm.description.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    try {
      await createTask({
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        status: modalTargetStatus,
        priority: taskForm.priority,
        estimatedMinutes: Number(taskForm.estimatedMinutes) || 60,
        project: projectName,
        assignedTo: taskForm.assignedTo || undefined,
      }).unwrap();

      toast.success("Task created successfully!");
      setIsAddModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message ||
          err?.message ||
          "Failed to create task. Make sure project exists and user is assigned.",
      );
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await updateTask({
        id: taskId,
        body: { status: newStatus },
      }).unwrap();
      toast.success(`Task moved to ${newStatus}`);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message || err?.message || "Failed to update status",
      );
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId).unwrap();
      toast.success("Task deleted");
      setSelectedTask(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || "Failed to delete task");
    }
  };

  // Render Priority Icon
  const renderPriorityIcon = (priority?: string) => {
    const p = (priority || "medium").toLowerCase();
    if (p === "high") {
      return <ChevronsUp size={13} className="text-rose-500 stroke-[2.5]" />;
    }
    if (p === "low") {
      return <ChevronDown size={13} className="text-blue-500 stroke-[2.5]" />;
    }
    return <Equal size={13} className="text-amber-500 stroke-[2.5]" />;
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden min-h-0 gap-5 bg-[#fbfbfb]">
      {/* 1. Header Section: Breadcrumb + Project Title + Create Task Button */}
      <div className="flex flex-col gap-1 shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <button
            onClick={() => navigate("/task-board")}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Projects
          </button>
          <span>/</span>
          <span className="text-slate-700 font-semibold">{projectName || "Tasks"}</span>
        </div>

        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-0.5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {projectName || "Project Tasks"}
              </h1>

              {/* Project Switcher Dropdown */}
              <div className="relative" ref={projectDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Switch Project"
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      isProjectDropdownOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isProjectDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in duration-100">
                    <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Switch Project
                    </div>
                    {boardProjects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSearchParams({ project: p.title });
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          p.title.toLowerCase() === projectName.toLowerCase()
                            ? "bg-primary-20/40 text-primary"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{p.title}</span>
                        {Number(p.in_progress_tasks_count) > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            {p.in_progress_tasks_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Drag cards between columns to change status. Click a card to edit it.
            </p>
          </div>

          {/* Right Action: Create Task Button + Refresh */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => handleOpenAddModal("planned")}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Task</span>
            </button>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh Tasks"
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-primary hover:border-primary/50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw
                size={15}
                className={isFetching ? "animate-spin text-primary" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        {/* Left: Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={15}
          />
          <input
            type="text"
            placeholder="Search tasks or keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary shadow-2xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right: Team Avatars & Priority Dropdown */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Team Members Avatars */}
          {projectAssignees.length > 0 && (
            <div className="flex items-center -space-x-1.5">
              {projectAssignees.map((assignee) => {
                const isSelected = selectedAssignee === assignee.username;
                const photoSrc = assignee.photo
                  ? getImageUrl(assignee.photo)
                  : null;

                return (
                  <button
                    key={assignee.username}
                    onClick={() =>
                      setSelectedAssignee(
                        isSelected ? null : assignee.username,
                      )
                    }
                    title={`Filter by ${assignee.username}`}
                    className={`relative w-7 h-7 rounded-full border-2 transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 z-10 scale-110"
                        : "border-white hover:scale-105 hover:z-10 shadow-2xs"
                    }`}
                  >
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={assignee.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{
                          backgroundColor: getAvatarBg(assignee.username),
                        }}
                      >
                        {getInitials(assignee.username)}
                      </div>
                    )}
                  </button>
                );
              })}

              {selectedAssignee && (
                <button
                  onClick={() => setSelectedAssignee(null)}
                  title="Clear member filter"
                  className="ml-2 text-xs text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Priority Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPriorityOpen(!isPriorityOpen)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <span>
                {selectedPriority === "all"
                  ? "All priorities"
                  : `${selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)} priority`}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isPriorityOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                {["all", "high", "medium", "low"].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPriority(p);
                      setIsPriorityOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedPriority === p
                        ? "font-bold text-primary bg-primary-20/20"
                        : "text-slate-600"
                    }`}
                  >
                    {p === "all"
                      ? "All priorities"
                      : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board 4 Columns */}
      <div className="flex-1 min-h-0 overflow-x-auto pb-4">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center py-28 gap-3">
            <CircularProgress size={36} sx={{ color: "#f17c04" }} />
            <p className="text-xs text-slate-500 font-medium">
              Loading {projectName} tasks...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full min-w-[1000px]">
            {columnData.map((col) => (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverCol !== col.id) setDragOverCol(col.id);
                }}
                onDragLeave={() => {
                  if (dragOverCol === col.id) setDragOverCol(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCol(null);
                  const taskId = Number(e.dataTransfer.getData("text/plain"));
                  if (taskId) {
                    handleUpdateStatus(taskId, col.id);
                  }
                }}
                className={`bg-[#f8f9fa] border rounded-3xl p-3.5 flex flex-col h-full min-h-[450px] transition-all ${
                  dragOverCol === col.id
                    ? "border-primary/50 ring-2 ring-primary/20 bg-orange-50/20"
                    : "border-slate-200/70"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span className="text-sm font-bold text-slate-800">
                      {col.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {col.totalTimeFormatted}
                    </span>
                  </div>

                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-white text-slate-600 text-xs font-semibold flex items-center justify-center border border-slate-200/80 shadow-2xs">
                    {col.count}
                  </span>
                </div>

                {/* Column Tasks List Container */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {col.tasks.map((task) => {
                    const assigneeName =
                      task.assigned_to?.username ||
                      task.Task_assigned_to ||
                      "Unassigned";
                    const photoSrc = task.assigned_to?.photo
                      ? getImageUrl(task.assigned_to.photo)
                      : null;
                    const taskKey = `WEB-${task.id + 100}`;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(task.id));
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onClick={() => setSelectedTask(task)}
                        className="group bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col gap-2.5 cursor-pointer active:opacity-75"
                      >
                        {/* Task Title */}
                        <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Tag & Status Row */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                            {projectName || "General"}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${col.badgeBg} ${col.badgeText} border ${col.badgeBorder}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${col.dotColor} ${
                                col.id === "in-progress" ? "animate-pulse" : ""
                              }`}
                            />
                            <span>{col.label}</span>
                          </span>
                        </div>

                        {/* Footer Row: Priority, Task Key, Estimate & Assignee */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            {renderPriorityIcon(task.priority)}
                            <span className="text-[11px] font-semibold tracking-tight text-slate-500">
                              {taskKey}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium ml-1.5">
                              <Clock size={11} className="text-slate-400" />
                              <span>{formatTime(task.estimatedMinutes)}</span>
                            </span>
                          </div>

                          {/* Assignee Avatar */}
                          <div
                            title={`Assigned to ${assigneeName}`}
                            className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white shadow-2xs"
                          >
                            {photoSrc ? (
                              <img
                                src={photoSrc}
                                alt={assigneeName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{
                                  backgroundColor: getAvatarBg(assigneeName),
                                }}
                              >
                                {getInitials(assigneeName)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Task Button at bottom of column */}
                <button
                  onClick={() => handleOpenAddModal(col.id)}
                  className="w-full mt-3 py-2.5 rounded-2xl border border-dashed border-slate-200 hover:border-primary/50 text-slate-500 hover:text-primary text-xs font-semibold flex items-center justify-center gap-1.5 bg-white/70 hover:bg-white transition-all cursor-pointer shrink-0"
                >
                  <Plus size={14} />
                  <span>Add task</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Task */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Create Task in {projectName}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fix Core Web Vitals on /work"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details and acceptance criteria..."
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as any,
                      })
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Estimated (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={15}
                    value={taskForm.estimatedMinutes}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        estimatedMinutes: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Assign To
                </label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, assignedTo: e.target.value })
                  }
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white cursor-pointer"
                >
                  <option value="">Assign to me (default)</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || emp.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-white shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Task & Move Status */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  WEB-{selectedTask.id + 100} • {projectName}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Description</label>
                <p className="text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-slate-400 font-medium">Assignee</label>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedTask.assigned_to?.username ||
                      selectedTask.Task_assigned_to ||
                      "Unassigned"}
                  </p>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Estimate</label>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {formatTime(selectedTask.estimatedMinutes)}
                  </p>
                </div>
              </div>

              {/* Move Status Buttons */}
              <div className="pt-3 border-t border-slate-100">
                <label className="text-slate-400 font-medium block mb-2">
                  Change Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() =>
                        handleUpdateStatus(selectedTask.id, col.id)
                      }
                      disabled={selectedTask.status === col.id || isUpdating}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedTask.status === col.id
                          ? `${col.badgeBg} ${col.badgeText} border ${col.badgeBorder}`
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
                      <span>{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;
