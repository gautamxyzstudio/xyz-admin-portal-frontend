/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Clock,
  ChevronDown,
  X,
  RotateCcw,
  Trash2,
  Paperclip,
  Eye,
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
import { TaskAttachmentUpload } from "./TaskAttachmentUpload";
import {
  extractTaskAttachments,
  type IUploadedAttachment,
} from "../utils/taskAttachmentUtils";

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
  "#b45309", // Amber/brown (MN style)
  "#2563eb", // Blue (AK style)
  "#7c3aed", // Violet/purple (SP style)
  "#059669", // Emerald/green (RV style)
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

// Formats timestamp for task card footer
const formatTaskTimestamp = (
  task: IProjectTaskItem,
): { icon: string; text: string } | null => {
  if (task.status === "completed") {
    const dateStr = task.updatedAt || task.createdAt;
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
      const formattedTime = date
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase();
      const timeSpent = task.estimatedMinutes
        ? formatTime(task.estimatedMinutes)
        : "45m";
      return {
        icon: "✓",
        text: `Completed ${formattedDate}, ${formattedTime} · took ${timeSpent}`,
      };
    } catch {
      return null;
    }
  }

  if (task.status === "in-progress" || task.status === "blocked") {
    const dateStr = task.createdAt || task.updatedAt;
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
      const formattedTime = date
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase();

      const diffMs = Math.max(0, Date.now() - date.getTime());
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;

      let timeAgo = "";
      if (diffDays > 0) {
        timeAgo = `${diffDays}d ${remainingHours}h ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours}h ago`;
      } else {
        timeAgo = "just now";
      }

      return {
        icon: "▶",
        text: `Started ${formattedDate}, ${formattedTime} · ${timeAgo}`,
      };
    } catch {
      return null;
    }
  }

  return null;
};

const ProjectTasks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectName = searchParams.get("project") || "";

  // Projects list for fallback
  const { data: boardProjects = [] } = useGetTaskBoardProjectsQuery();

  // If no project in URL, automatically select the first project
  useEffect(() => {
    if (!projectName && boardProjects.length > 0) {
      setSearchParams({ project: boardProjects[0].title }, { replace: true });
    }
  }, [projectName, boardProjects, setSearchParams]);

  // Drag and drop state
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // Filters State
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
    assignedTo: "" as string | number,
  });
  const [estimatedHours, setEstimatedHours] = useState("1");
  const [estimatedMinutes, setEstimatedMinutes] = useState("0");
  const [attachments, setAttachments] = useState<IUploadedAttachment[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  // Modal State for Task Details / Status Change
  const [selectedTask, setSelectedTask] = useState<IProjectTaskItem | null>(
    null,
  );
  const [viewAttachmentPreview, setViewAttachmentPreview] =
    useState<IUploadedAttachment | null>(null);

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
      // 1. Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const keyMatch = `web-${t.id >= 100 ? t.id : t.id + 100}`.includes(query) || `task-${t.id}`.includes(query);
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
      assignedTo: "",
    });
    setEstimatedHours("1");
    setEstimatedMinutes("0");
    setAttachments([]);
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

    const totalMinutes =
      (Number(estimatedHours) || 0) * 60 + (Number(estimatedMinutes) || 0);

    if (totalMinutes <= 0) {
      toast.error("Please enter a valid estimated time (greater than 0 minutes)");
      return;
    }

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await createTask({
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        status: modalTargetStatus,
        priority: taskForm.priority,
        estimatedMinutes: totalMinutes,
        date: todayStr,
        project: projectName,
        assignedTo: taskForm.assignedTo || undefined,
        attachments: attachments.map((a) => a.id),
      }).unwrap();

      toast.success("Task created successfully!");
      setIsAddModalOpen(false);
      setAttachments([]);
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

  // Render Priority Indicator icon
  const renderPriorityIndicator = (priority?: string) => {
    const p = (priority || "medium").toLowerCase();
    if (p === "high") {
      return (
        <span className="text-rose-500 font-bold text-xs select-none" title="High Priority">
          ▲
        </span>
      );
    }
    if (p === "low") {
      return (
        <span className="text-blue-500 font-bold text-xs select-none" title="Low Priority">
          ▼
        </span>
      );
    }
    return (
      <span className="text-amber-500 font-bold text-xs select-none" title="Medium Priority">
        ═
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-5 overflow-y-auto min-h-0 gap-3.5 bg-[#fbfbfb]">
      {/* 1. Header Section: Breadcrumbs + Project Title + Create Task Button */}
      <div className="flex flex-col gap-0.5 shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <button
            onClick={() => navigate("/task-board")}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Projects
          </button>
          <span>/</span>
          <span className="text-slate-700 font-semibold">
            {projectName || "Tasks"}
          </span>
        </div>

        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-0.5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {projectName || "Project Tasks"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag cards between columns to change status. Start and completion
              times are stamped automatically.
            </p>
          </div>

          {/* Right Action: Create Task Button + Refresh */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => handleOpenAddModal("planned")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Task</span>
            </button>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh Tasks"
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-primary hover:border-primary/50 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw
                size={14}
                className={isFetching ? "animate-spin text-primary" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        {/* Left: Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search tasks or keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8.5 pr-8 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary shadow-2xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Right: Team Avatars + Signed in as + Priority Dropdown */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <span>
                {selectedPriority === "all"
                  ? "All priorities"
                  : `${selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)} priority`}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
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

      {/* 3. Kanban Board 4 Columns (All on one screen, NO X-axis scroll, smooth Y-axis scroll) */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center py-28 gap-3">
            <CircularProgress size={36} sx={{ color: "#f17c04" }} />
            <p className="text-xs text-slate-500 font-medium">
              Loading {projectName} tasks...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 h-full w-full min-w-0">
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
                className={`bg-[#f4f5f7] border rounded-2xl p-3 flex flex-col h-full min-h-[480px] min-w-0 transition-all ${
                  dragOverCol === col.id
                    ? "border-primary/50 ring-2 ring-primary/20 bg-orange-50/20"
                    : "border-slate-200/70"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 px-1 shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`} />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {col.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal shrink-0">
                      {col.totalTimeFormatted}
                    </span>
                  </div>

                  <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-white text-slate-600 text-[11px] font-semibold flex items-center justify-center border border-slate-200/80 shadow-2xs shrink-0 ml-1">
                    {col.count}
                  </span>
                </div>

                {/* Column Tasks List Container - Smooth vertical scroll with clean scrollbar */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 kanban-column-scroll">
                  {col.tasks.map((task) => {
                    const assigneeName =
                      task.assigned_to?.username ||
                      task.Task_assigned_to ||
                      "Unassigned";
                    const photoSrc = task.assigned_to?.photo
                      ? getImageUrl(task.assigned_to.photo)
                      : null;
                    const taskKey = `WEB-${task.id >= 100 ? task.id : task.id + 100}`;
                    const taskAttachments = extractTaskAttachments(
                      task.attachments,
                    );
                    const taskTag = task.project?.title || projectName || "General";
                    const timestampInfo = formatTaskTimestamp(task);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(task.id));
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onClick={() => setSelectedTask(task)}
                        className="group bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col gap-2 cursor-pointer active:opacity-75"
                      >
                        {/* Cover image thumbnail if attachments exist */}
                        {taskAttachments.length > 0 &&
                          (taskAttachments[0].url || taskAttachments[0].previewUrl) && (
                            <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-100/90 mb-0.5 shrink-0">
                              <img
                                src={
                                  taskAttachments[0].previewUrl ||
                                  getImageUrl(taskAttachments[0].url)
                                }
                                alt={task.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          )}

                        {/* Task Title */}
                        <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {task.title}
                        </h4>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Tag & Status Row */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 truncate max-w-[110px]">
                            {taskTag}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${col.badgeBg} ${col.badgeText} border ${col.badgeBorder} shrink-0`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${col.dotColor} ${
                                col.id === "in-progress" ? "animate-pulse" : ""
                              }`}
                            />
                            <span>{col.label}</span>
                          </span>
                        </div>

                        {/* Footer Row: Priority, Task Key, Estimate, Attachments & Assignee */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 mt-0.5">
                          <div className="flex items-center gap-1 text-slate-500 min-w-0">
                            {renderPriorityIndicator(task.priority)}
                            <span className="text-[11px] font-semibold tracking-tight text-slate-600">
                              {taskKey}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 font-medium ml-1">
                              <Clock size={10} className="text-slate-400" />
                              <span>{formatTime(task.estimatedMinutes)}</span>
                            </span>

                            {/* Attachments indicator */}
                            {taskAttachments.length > 0 && (
                              <span
                                className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 font-medium ml-1"
                                title={`${taskAttachments.length} image attachment(s)`}
                              >
                                <Paperclip size={11} className="text-slate-400" />
                                <span>{taskAttachments.length}</span>
                              </span>
                            )}
                          </div>

                          {/* Assignee Avatar */}
                          <div
                            title={`Assigned to ${assigneeName}`}
                            className="w-5.5 h-5.5 rounded-full overflow-hidden shrink-0 border border-white shadow-2xs ml-1"
                          >
                            {photoSrc ? (
                              <img
                                src={photoSrc}
                                alt={assigneeName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white"
                                style={{
                                  backgroundColor: getAvatarBg(assigneeName),
                                }}
                              >
                                {getInitials(assigneeName)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Started / Completed timestamp line */}
                        {timestampInfo && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            <span
                              className={
                                task.status === "completed"
                                  ? "text-emerald-500 font-bold"
                                  : "text-slate-400 text-[9px]"
                              }
                            >
                              {timestampInfo.icon}
                            </span>
                            <span className="truncate">{timestampInfo.text}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Task Button at bottom of column */}
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(col.id)}
                  className="w-full mt-auto py-2.5 px-3 rounded-2xl bg-[#ebedf0] text-slate-700 border border-transparent hover:border-dashed hover:border-[#ff7300] hover:text-[#ff7300] hover:bg-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shrink-0 shadow-2xs"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  <span>Add task</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Task */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-99999 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150">
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
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fix Core Web Vitals on /work"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details and acceptance criteria..."
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white resize-none transition-all shadow-2xs"
                />
              </div>

              {/* Row 1: Assignee on left, Priority on right */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                    Assignee
                  </label>
                  <div className="relative">
                    <select
                      value={taskForm.assignedTo}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, assignedTo: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white cursor-pointer appearance-none pr-9 transition-all shadow-2xs"
                    >
                      <option value="">Assign to me (default)</option>
                      {activeEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name || emp.username}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={taskForm.priority}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          priority: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white cursor-pointer appearance-none pr-9 transition-all shadow-2xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <ChevronDown
                      size={15}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Estimated Time * with hrs and mins */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Estimated Time <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      placeholder="1"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className="w-full text-xs px-4 py-3 pr-10 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-slate-800 outline-none focus:border-primary focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all shadow-2xs"
                    />
                    <span className="absolute right-4 text-xs text-slate-400 pointer-events-none select-none">
                      hrs
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(e.target.value)}
                      className="w-full text-xs px-4 py-3 pr-10 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-slate-800 outline-none focus:border-primary focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all shadow-2xs"
                    />
                    <span className="absolute right-4 text-xs text-slate-400 pointer-events-none select-none">
                      mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Attachments Option */}
              <TaskAttachmentUpload
                attachments={attachments}
                onChange={setAttachments}
                onUploadingChange={setIsUploadingAttachments}
                disabled={isCreating}
              />

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
                  disabled={isCreating || isUploadingAttachments}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-white shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating
                    ? "Creating..."
                    : isUploadingAttachments
                    ? "Uploading attachments..."
                    : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Task & Move Status */}
      {selectedTask && (
        <div className="fixed inset-0 z-99999 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  WEB-{selectedTask.id >= 100 ? selectedTask.id : selectedTask.id + 100} • {projectName}
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

              {/* Attachments Section if present */}
              {extractTaskAttachments(selectedTask.attachments).length > 0 && (
                <div className="pt-2">
                  <label className="text-slate-400 font-medium block mb-2 flex items-center gap-1.5">
                    <Paperclip size={12} />
                    <span>
                      Attachments (
                      {extractTaskAttachments(selectedTask.attachments).length})
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {extractTaskAttachments(selectedTask.attachments).map(
                      (att) => (
                        <div
                          key={att.id}
                          onClick={() => setViewAttachmentPreview(att)}
                          className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:border-primary transition-all cursor-pointer shadow-2xs"
                        >
                          <img
                            src={getImageUrl(att.url)}
                            alt={att.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye size={16} />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

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

      {/* Lightbox Preview Modal for Task Details */}
      {viewAttachmentPreview && (
        <div
          onClick={() => setViewAttachmentPreview(null)}
          className="fixed inset-0 z-99999 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <span className="text-xs font-bold text-slate-800 truncate max-w-md">
                {viewAttachmentPreview.name}
              </span>
              <button
                type="button"
                onClick={() => setViewAttachmentPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={getImageUrl(viewAttachmentPreview.url)}
                alt={viewAttachmentPreview.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-end px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px]">
              <a
                href={getImageUrl(viewAttachmentPreview.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                Open original in new tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;
