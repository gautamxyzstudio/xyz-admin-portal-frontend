/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect, useRef } from "react";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import ProjectKanbanBoard from "./ProjectKanbanBoard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Search,
  Plus,
  ChevronDown,
  X,
  RotateCcw,
  Paperclip,
  Check,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import {
  useGetProjectTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useCreateTaskCommentMutation,
  useGetTaskCommentsQuery,
  type IProjectTaskItem,
  type TaskStatus,
} from "../taskApi";
import { useGetActiveEmployeesQuery } from "../../allTasks/allTaskApi";
import { useGetTaskBoardProjectsQuery } from "../../taskBoard/taskBoardApi";
import { useGetProjectsQuery } from "../../projects/projectsApi";
import { userInState, userDetailsInState } from "../../auth/authSlice";
import {
  getImageUrl,
  extractEmployeePhotoUrl,
  formatTaskCardTimestamp,
  formatIstRelativeTime,
  getIstTodayDateString,
  toIstDayjs,
} from "../../../utils/utils";
import { toast } from "react-toastify";
import { TaskAttachmentUpload } from "./TaskAttachmentUpload";
import { useUploadFileMutation } from "../../../shared/api/sharedApi";
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

// Priority options with color indicators
const PRIORITY_OPTIONS: {
  id: "low" | "medium" | "high";
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}[] = [
    {
      id: "low",
      label: "Low",
      dotColor: "bg-blue-500",
      badgeBg: "bg-blue-50",
      badgeText: "text-blue-600",
      badgeBorder: "border-blue-200/60",
    },
    {
      id: "medium",
      label: "Medium",
      dotColor: "bg-amber-500",
      badgeBg: "bg-amber-50",
      badgeText: "text-amber-600",
      badgeBorder: "border-amber-200/60",
    },
    {
      id: "high",
      label: "High",
      dotColor: "bg-rose-500",
      badgeBg: "bg-rose-50",
      badgeText: "text-rose-600",
      badgeBorder: "border-rose-200/60",
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

// Formats timestamp for task card footer using centralized IST utilities
const formatTaskTimestamp = (
  task: IProjectTaskItem,
): { icon: string; text: string } | null => {
  return formatTaskCardTimestamp(task, formatTime);
};

const formatRelativeTime = (dateStr?: string | number): string => {
  return formatIstRelativeTime(dateStr);
};
const formatHistoryTime = (dateStr?: string | number): string => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

interface ITaskHistoryRecord {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  dotColor: string;
}

interface ITaskHistoryEvent {
  user?: string;
  action: string;
  timestamp?: string;
  dotColor?: string;
}

const getTaskHistoryStorageKey = (taskId: number | string) =>
  `xyz_project_task_history_${taskId}`;

const getStoredTaskHistory = (
  taskId: number | string,
): ITaskHistoryRecord[] => {
  try {
    const raw = localStorage.getItem(getTaskHistoryStorageKey(taskId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
};

const saveStoredTaskHistory = (
  taskId: number | string,
  history: ITaskHistoryRecord[],
) => {
  try {
    localStorage.setItem(
      getTaskHistoryStorageKey(taskId),
      JSON.stringify(history),
    );
  } catch {
    // ignore
  }
};

const recordTaskHistoryEvent = (
  taskId: number | string,
  event: ITaskHistoryEvent,
  backendResponse?: any,
) => {
  const current = getStoredTaskHistory(taskId);

  // Extract timestamp from backend response taskhistory field if available
  const backendTaskHistory =
    backendResponse?.taskhistory ||
    backendResponse?.taskHistory ||
    backendResponse?.task_history ||
    backendResponse?.data?.taskhistory ||
    backendResponse?.data?.taskHistory ||
    backendResponse?.data?.task_history ||
    backendResponse?.data?.attributes?.taskhistory ||
    backendResponse?.data?.attributes?.taskHistory ||
    backendResponse?.data?.attributes?.task_history ||
    backendResponse?.attributes?.taskhistory ||
    backendResponse?.attributes?.taskHistory ||
    backendResponse?.attributes?.task_history;

    console.log(backendTaskHistory,`backendTaskHistory`)

  let resolvedTimestamp = event.timestamp;

  if (Array.isArray(backendTaskHistory) && backendTaskHistory.length > 0) {
    const latest = backendTaskHistory[backendTaskHistory.length - 1];
    resolvedTimestamp =
      latest?.createdAt ||
      latest?.created_at ||
      latest?.date ||
      latest?.time ||
      latest?.updatedAt ||
      resolvedTimestamp;
  }

  // Fallback to backend response direct fields or current ISO string
  if (!resolvedTimestamp) {
    resolvedTimestamp =
      backendResponse?.updatedAt ||
      backendResponse?.createdAt ||
      backendResponse?.data?.attributes?.updatedAt ||
      backendResponse?.data?.attributes?.createdAt ||
      backendResponse?.data?.updatedAt ||
      backendResponse?.data?.createdAt ||
      new Date().toISOString();
  }

  // Ensure timestamp is parsed properly
  const istD = toIstDayjs(resolvedTimestamp);
  const finalTimestamp = istD ? istD.toISOString() : (resolvedTimestamp || new Date().toISOString());

  const newRecord: ITaskHistoryRecord = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user: event.user || "Team Member",
    action: event.action || "updated the task",
    timestamp: finalTimestamp,
    dotColor: event.dotColor || "bg-blue-500",
  };
  const updated = [newRecord, ...current];
  saveStoredTaskHistory(taskId, updated);
  return updated;
};

const getCompleteTaskHistory = (
  task: IProjectTaskItem,
): ITaskHistoryRecord[] => {
  const historyMap = new Map<string, ITaskHistoryRecord>();

  const rawCreatedAt =
    task.createdAt ||
    (task as any).attributes?.createdAt ||
    "";
  const createdDayjs = toIstDayjs(rawCreatedAt);
  const createdTimeEpoch = createdDayjs?.valueOf() || 0;
  const createdTimeIso = createdDayjs
    ? createdDayjs.toISOString()
    : (rawCreatedAt || new Date().toISOString());

  const creator =
    task.task_created_by ||
    task.assigned_to?.username ||
    task.Task_assigned_to ||
    "Team Member";

  // 1. Backend task.taskHistory or task.history if present
  const backendHistory =
    task.taskHistory || (task as any).history || (task as any).activities || [];

  if (Array.isArray(backendHistory)) {
    backendHistory.forEach((h: any, idx: number) => {
      const user =
  h.changedBy ||
  h.user?.name ||
  h.user?.username ||
  h.username ||
  h.by ||
  creator;

const rawTime =
  h.createdAt ||
  h.created_at ||
  h.date ||
  rawCreatedAt ||
  "";

const hIso = rawTime;

let action = h.action || h.description || h.text;

if (h.oldStatus === null && h.newStatus) {
  action = "created the task";
} else if (h.oldStatus && h.newStatus) {
  action = `moved ${h.oldStatus} → ${h.newStatus}`;
} else if (!action) {
  action = idx === 0 ? "created the task" : "updated the task";
}

const status = String(h.newStatus || "").toLowerCase();

const dot =
  h.dotColor ||
  (status === "completed"
    ? "bg-emerald-500"
    : status === "blocked"
      ? "bg-rose-500"
      : status === "in-progress"
        ? "bg-orange-500"
        : "bg-blue-500");

const key = `${h.id ?? idx}-${hIso}-${action}`;

historyMap.set(key, {
  id: `backend-${h.id ?? idx}`,
  user,
  action,
  timestamp: hIso,
  dotColor: dot,
});
    });
  }

  // 2. Local storage history
  const localHistory = getStoredTaskHistory(task.id);
  localHistory.forEach((h) => {
    const hDayjs = toIstDayjs(h.timestamp);
    const hEpoch = hDayjs?.valueOf() || 0;
    const hIso = hDayjs ? hDayjs.toISOString() : h.timestamp;

    // Filter out duplicate generic "updated the task" if it happened at creation time
    const isNearCreation =
      createdTimeEpoch > 0 && hEpoch > 0
        ? Math.abs(hEpoch - createdTimeEpoch) < 120000
        : false;

    if (isNearCreation && h.action === "updated the task") {
      return;
    }

    const key = `${hIso}-${h.action}`;
    historyMap.set(key, {
      ...h,
      timestamp: hIso,
    });
  });

  // 3. Baseline creation event
  // If no "created the task" event exists anywhere in history, add one
  const hasCreationEvent = Array.from(historyMap.values()).some((h) =>
    h.action.toLowerCase().includes("created the task"),
  );

  if (!hasCreationEvent) {
    historyMap.set("baseline-create", {
      id: "baseline-create",
      user: creator,
      action: "created the task",
      timestamp: createdTimeIso,
      dotColor: "bg-blue-500",
    });
  }

  // 4. Deduplicate: Keep at most ONE "created the task" entry
  let foundCreation = false;
  for (const [key, val] of Array.from(historyMap.entries())) {
    if (val.action.toLowerCase().includes("created the task")) {
      if (!foundCreation) {
        foundCreation = true;
      } else {
        historyMap.delete(key);
      }
    }
  }

  // 5. Remove any duplicate generic "updated the task" entry that shares the creation time
  const creationEntry = Array.from(historyMap.values()).find((h) =>
    h.action.toLowerCase().includes("created the task"),
  );
  if (creationEntry) {
    const cEpoch = toIstDayjs(creationEntry.timestamp)?.valueOf() || 0;
    for (const [key, val] of historyMap.entries()) {
      if (val.id !== creationEntry.id && val.action === "updated the task") {
        const valEpoch = toIstDayjs(val.timestamp)?.valueOf() || 0;
        if (cEpoch > 0 && valEpoch > 0 && Math.abs(valEpoch - cEpoch) < 120000) {
          historyMap.delete(key);
        }
      }
    }
  }

  // Sort descending by timestamp (newest on top, oldest at bottom)
  return Array.from(historyMap.values()).sort((a, b) => {
    const tA = toIstDayjs(a.timestamp)?.valueOf() || 0;
    const tB = toIstDayjs(b.timestamp)?.valueOf() || 0;
    return tB - tA;
  });
};

const STATUS_OPTIONS: {
  id: TaskStatus;
  label: string;
  dot: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}[] = [
    {
      id: "planned",
      label: "Planned",
      dot: "bg-blue-500",
      activeBg: "bg-blue-50/70",
      activeBorder: "border-blue-400",
      activeText: "text-blue-600",
    },
    {
      id: "in-progress",
      label: "In-Progress",
      dot: "bg-orange-500",
      activeBg: "bg-orange-50/70",
      activeBorder: "border-orange-400",
      activeText: "text-orange-600",
    },
    {
      id: "blocked",
      label: "Blocked",
      dot: "bg-rose-500",
      activeBg: "bg-rose-50/70",
      activeBorder: "border-rose-400",
      activeText: "text-rose-600",
    },
    {
      id: "completed",
      label: "Completed",
      dot: "bg-emerald-500",
      activeBg: "bg-emerald-50/70",
      activeBorder: "border-emerald-400",
      activeText: "text-emerald-600",
    },
  ];

const ProjectTasks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectName = searchParams.get("project") || "";

  // Auth & Permissions
  const currentUser = useSelector(userInState);
  const userDetails = useSelector(userDetailsInState);
  const isAdmin =
    currentUser?.user_type === "Admin" ||
    currentUser?.user_type === "Hr" ||
    currentUser?.user_type === "Management";

  // Projects list for fallback
  const { data: boardProjects = [] } = useGetTaskBoardProjectsQuery();

  // If no project in URL, automatically select the first project
  useEffect(() => {
    if (!projectName && boardProjects.length > 0) {
      setSearchParams({ project: boardProjects[0].title }, { replace: true });
    }
  }, [projectName, boardProjects, setSearchParams]);

  // Drag and drop state & refs
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const dragCounterMap = useRef<Record<string, number>>({});
  const draggedTaskIdRef = useRef<number | null>(null);

  // Optimistic UI overrides for instant drag-and-drop feedback
  const [localTasksOverride, setLocalTasksOverride] = useState<
    Record<number, TaskStatus>
  >({});

  // Priority dropdown ref for outside click
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

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
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isCreatePriorityDropdownOpen, setIsCreatePriorityDropdownOpen] =
    useState(false);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState("");

  // Modal State for Edit Task
  const [selectedTask, setSelectedTask] = useState<IProjectTaskItem | null>(
    null,
  );
  const [editTaskForm, setEditTaskForm] = useState({
    title: "",
    description: "",
    status: "planned" as TaskStatus,
    priority: "medium" as "low" | "medium" | "high",
    assignedTo: "" as string | number,
  });
  const [editEstimatedHours, setEditEstimatedHours] = useState("1");
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState("0");
  const [editAttachments, setEditAttachments] = useState<IUploadedAttachment[]>(
    [],
  );
  const [isEditUploadingAttachments, setIsEditUploadingAttachments] =
    useState(false);
  const [isEditAssigneeDropdownOpen, setIsEditAssigneeDropdownOpen] =
    useState(false);
  const [editAssigneeSearchQuery, setEditAssigneeSearchQuery] = useState("");
  const [activityTab, setActivityTab] = useState<"history" | "comments">(
    "comments",
  );
  const [commentAttachments, setCommentAttachments] = useState<
    IUploadedAttachment[]
  >([]);
  const [isUploadingCommentPhoto, setIsUploadingCommentPhoto] = useState(false);
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const commentComposerRef = useRef<HTMLDivElement>(null);
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const newCommentTextRef = useRef(newCommentText);
  newCommentTextRef.current = newCommentText;
  const commentAttachmentsRef = useRef(commentAttachments);
  commentAttachmentsRef.current = commentAttachments;
  const [viewAttachmentPreview, setViewAttachmentPreview] =
    useState<IUploadedAttachment | null>(null);

  const currentUserName =
    userDetails?.name ||
    (currentUser as any)?.name ||
    (currentUser as any)?.username ||
    currentUser?.email?.split("@")[0] ||
    "You";

  const currentUserPhoto = useMemo(() => {
    if (userDetails?.photo) {
      return getImageUrl(userDetails.photo);
    }
    if (userDetails) {
      const url = extractEmployeePhotoUrl(userDetails);
      if (url) return url;
    }
    return extractEmployeePhotoUrl(currentUser) || "";
  }, [userDetails, currentUser]);

  const isCommentExpanded =
    isCommentFocused ||
    newCommentText.trim().length > 0 ||
    commentAttachments.length > 0 ||
    isUploadingCommentPhoto;

  // Outside click listener for priority dropdown and quick move
  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      if (
        isPriorityOpen &&
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(e.target as Node)
      ) {
        setIsPriorityOpen(false);
      }
      if (
        commentComposerRef.current &&
        !commentComposerRef.current.contains(e.target as Node) &&
        !newCommentTextRef.current.trim() &&
        commentAttachmentsRef.current.length === 0
      ) {
        setIsCommentFocused(false);
      }
    };
    document.addEventListener("mousedown", handleGlobalMouseDown);
    return () =>
      document.removeEventListener("mousedown", handleGlobalMouseDown);
  }, [isPriorityOpen]);

  // RTK Query: fetch tasks for this project
  const {
    data: tasks = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectTasksQuery({ project: projectName }, { skip: !projectName });

  // RTK Query: all active employees (skip for standard employees to avoid 403 Forbidden)
  const { data: activeEmployees = [] } = useGetActiveEmployeesQuery(undefined, {
    skip: !isAdmin,
  });

  // RTK Query: fetch all projects with populated team members
  const { data: projectsData, isLoading: isProjectsLoading } =
    useGetProjectsQuery();

  // Normalize projects list from Strapi response
  const allProjectsList: any[] = useMemo(() => {
    if (Array.isArray(projectsData?.projects)) return projectsData.projects;
    if (Array.isArray(projectsData?.data)) return projectsData.data;
    if (Array.isArray(projectsData)) return projectsData;
    return [];
  }, [projectsData]);

  // Find current project object to access its assigned team members
  const currentProjectObj = useMemo(() => {
    if (!projectName || allProjectsList.length === 0) return null;
    return (
      allProjectsList.find(
        (p: any) =>
          (p.title || p.attributes?.title || "").toLowerCase().trim() ===
          projectName.toLowerCase().trim(),
      ) || null
    );
  }, [allProjectsList, projectName]);

  // Only employees assigned to this specific project
  const projectAssignedEmployees = useMemo(() => {
    if (!currentProjectObj) return [];

    const rawUsers: any[] =
      currentProjectObj?.users_permissions_users ||
      currentProjectObj?.attributes?.users_permissions_users?.data ||
      currentProjectObj?.users ||
      [];

    if (!Array.isArray(rawUsers) || rawUsers.length === 0) {
      return [];
    }

    const assignedUserIds = new Set<string>();
    const assignedUsernames = new Set<string>();

    rawUsers.forEach((u: any) => {
      const id = u.id;
      const username = (u.username || u.attributes?.username || "")
        .toLowerCase()
        .trim();
      if (id) assignedUserIds.add(String(id));
      if (username) assignedUsernames.add(username);
    });

    const matched = activeEmployees.filter((emp) => {
      const idMatch = assignedUserIds.has(String(emp.id));
      const usernameMatch =
        emp.username &&
        assignedUsernames.has(emp.username.toLowerCase().trim());
      return idMatch || usernameMatch;
    });

    if (matched.length > 0) {
      return matched;
    }

    return rawUsers.map((u: any) => ({
      id: u.id,
      username: u.username || u.attributes?.username || `user-${u.id}`,
      name:
        u.name ||
        u.attributes?.name ||
        u.username ||
        u.attributes?.username ||
        "Employee",
      photo: u.photo || u.attributes?.photo,
      profile_photo: u.profile_photo || u.attributes?.profile_photo || u.photo,
      email: u.email || u.attributes?.email,
    }));
  }, [currentProjectObj, activeEmployees]);

  // Selected employee object for rich Assignee dropdown
  const selectedEmployeeObj = useMemo(() => {
    if (!taskForm.assignedTo) return null;
    return (
      projectAssignedEmployees.find(
        (emp) => String(emp.id) === String(taskForm.assignedTo),
      ) ||
      activeEmployees.find(
        (emp) => String(emp.id) === String(taskForm.assignedTo),
      ) ||
      null
    );
  }, [projectAssignedEmployees, activeEmployees, taskForm.assignedTo]);

  // Filtered project employees for search inside dropdown
  const filteredProjectEmployees = useMemo(() => {
    if (!assigneeSearchQuery.trim()) return projectAssignedEmployees;
    const q = assigneeSearchQuery.toLowerCase().trim();
    return projectAssignedEmployees.filter(
      (emp) =>
        (emp.name || "").toLowerCase().includes(q) ||
        (emp.username || "").toLowerCase().includes(q) ||
        (emp.email || "").toLowerCase().includes(q),
    );
  }, [projectAssignedEmployees, assigneeSearchQuery]);

  // Selected employee for Edit Modal
  const editSelectedEmployeeObj = useMemo(() => {
    if (!editTaskForm.assignedTo) return null;
    return (
      projectAssignedEmployees.find(
        (emp) => String(emp.id) === String(editTaskForm.assignedTo),
      ) ||
      activeEmployees.find(
        (emp) => String(emp.id) === String(editTaskForm.assignedTo),
      ) ||
      null
    );
  }, [projectAssignedEmployees, activeEmployees, editTaskForm.assignedTo]);

  // Filtered employees for search inside Edit Modal
  const editFilteredProjectEmployees = useMemo(() => {
    if (!editAssigneeSearchQuery.trim()) return projectAssignedEmployees;
    const q = editAssigneeSearchQuery.toLowerCase().trim();
    return projectAssignedEmployees.filter(
      (emp) =>
        (emp.name || "").toLowerCase().includes(q) ||
        (emp.username || "").toLowerCase().includes(q) ||
        (emp.email || "").toLowerCase().includes(q),
    );
  }, [projectAssignedEmployees, editAssigneeSearchQuery]);

  // Complete history for the selected task
  const completeHistory = useMemo(() => {
    if (!selectedTask) return [];
    return getCompleteTaskHistory(selectedTask);
  }, [selectedTask]);

  // Mutations
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [createTaskComment, { isLoading: isPostingComment }] =
    useCreateTaskCommentMutation();
  const [uploadFile] = useUploadFileMutation();

  // RTK Query: fetch comments for selected task
  const { data: taskCommentsData = [], isLoading: isCommentsLoading } =
    useGetTaskCommentsQuery(selectedTask?.id || 0, {
      skip: !selectedTask?.id,
    });

  // Normalized comments list
  const taskCommentsList = useMemo(() => {
    if (!Array.isArray(taskCommentsData)) return [];
    return taskCommentsData.map((item: any, itemIdx: number) => {
      const attrs = item?.attributes || item || {};
      const commentText =
        attrs.comment || attrs.content || attrs.text || item.comment || "";

      const authorObj =
        item.addedBy ||
        attrs.addedBy ||
        attrs.user?.data?.attributes ||
        attrs.user?.attributes ||
        attrs.user ||
        attrs.author?.data?.attributes ||
        attrs.author ||
        attrs.created_by?.data?.attributes ||
        attrs.created_by ||
        attrs.task_created_by;

      const authorName =
        authorObj?.username ||
        authorObj?.name ||
        authorObj?.email?.split("@")[0] ||
        (typeof authorObj === "string" ? authorObj : "") ||
        "Team Member";

      const authorLogo =
        authorObj?.logo || authorObj?.photo || authorObj?.avatar || null;

      const createdAt =
        attrs.createdAt ||
        attrs.created_at ||
        attrs.date ||
        item.createdAt ||
        "";

      const rawAtts =
        item.attachments || attrs.attachments?.data || attrs.attachments || [];

      const parsedAttachments = Array.isArray(rawAtts)
        ? rawAtts.map((att: any, attIdx: number) => {
          if (typeof att === "string") {
            const fileName =
              att.split("/").pop()?.split("?")[0] ||
              `attachment-${attIdx + 1}`;
            const isImage = /\.(webp|png|jpe?g|gif|svg|avif)$/i.test(fileName);
            return {
              id: `${item.id || itemIdx}-${attIdx}`,
              name: fileName,
              url: att,
              isImage,
            };
          }
          const url = att?.url || att?.attributes?.url || "";
          const name =
            att?.name ||
            att?.attributes?.name ||
            `attachment-${attIdx + 1}`;
          const isImage =
            att?.mime?.startsWith("image/") ||
            /\.(webp|png|jpe?g|gif|svg|avif)$/i.test(name || url);
          return {
            id: att?.id || `${item.id || itemIdx}-${attIdx}`,
            name,
            url,
            isImage,
          };
        })
        : [];

      return {
        id: item.id || `comment-${itemIdx}`,
        user: authorName,
        userLogo: authorLogo ? getImageUrl(authorLogo) : null,
        text: commentText,
        time: formatRelativeTime(createdAt),
        attachments: parsedAttachments,
      };
    });
  }, [taskCommentsData]);

  // Merge server tasks with local optimistic overrides
  const displayTasks = useMemo(() => {
    return tasks.map((t) => {
      const overrideStatus = localTasksOverride[t.id];
      if (overrideStatus) {
        return { ...t, status: overrideStatus };
      }
      return t;
    });
  }, [tasks, localTasksOverride]);

  // Unique assignees who actually have tasks assigned to them in this project
  const projectAssignees = useMemo(() => {
    const map = new Map<string, { username: string; photo?: string | null }>();
    displayTasks.forEach((t) => {
      const username = t.assigned_to?.username || t.Task_assigned_to;
      if (username && !map.has(username)) {
        // Find photo from task assigned_to or match with project/active employees
        const matchedEmp =
          projectAssignedEmployees.find(
            (e) =>
              (e.username || e.name)?.toLowerCase().trim() ===
              username.toLowerCase().trim(),
          ) ||
          activeEmployees.find(
            (e) =>
              (e.username || e.name)?.toLowerCase().trim() ===
              username.toLowerCase().trim(),
          );
        const photo =
          t.assigned_to?.photo ||
          matchedEmp?.photo ||
          matchedEmp?.profile_photo;

        map.set(username, {
          username,
          photo,
        });
      }
    });
    return Array.from(map.values());
  }, [displayTasks, projectAssignedEmployees, activeEmployees]);

  // Filter tasks based on search, selected assignee, and priority
  const filteredTasks = useMemo(() => {
    return displayTasks.filter((t) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const keyMatch =
          (t.taskId && t.taskId.toLowerCase().includes(query)) ||
          `task-${t.id}`.toLowerCase().includes(query) ||
          String(t.id).includes(query);
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
  }, [displayTasks, searchTerm, selectedAssignee, selectedPriority]);

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
    setIsAssigneeDropdownOpen(false);
    setIsCreatePriorityDropdownOpen(false);
    setAssigneeSearchQuery("");
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
      toast.error(
        "Please enter a valid estimated time (greater than 0 minutes)",
      );
      return;
    }

    if (isAdmin && !taskForm.assignedTo) {
      toast.error("Please select an assignee for this task");
      return;
    }

    try {
      const todayStr = getIstTodayDateString();

      await createTask({
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        status: modalTargetStatus,
        priority: taskForm.priority,
        estimatedMinutes: totalMinutes,
        date: todayStr,
        project: projectName,
        assignedTo: isAdmin ? taskForm.assignedTo || undefined : undefined,
        attachments: attachments.map((a) => a.id),
      }).unwrap();

      toast.success("Task created successfully!");
      setIsAddModalOpen(false);
      setIsCreatePriorityDropdownOpen(false);
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

  const handleOpenEditModal = (task: IProjectTaskItem) => {
    setSelectedTask(task);
    const assignedId =
      task.assigned_to?.id ||
      activeEmployees.find(
        (e) =>
          e.username === task.Task_assigned_to ||
          e.name === task.Task_assigned_to,
      )?.id ||
      "";

    setEditTaskForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "planned",
      priority: task.priority || "medium",
      assignedTo: assignedId,
    });

    const est = Number(task.estimatedMinutes) || 0;
    setEditEstimatedHours(est > 0 ? String(Math.floor(est / 60)) : "0");
    setEditEstimatedMinutes(est > 0 ? String(est % 60) : "0");
    setEditAttachments(extractTaskAttachments(task.attachments));
    setIsEditAssigneeDropdownOpen(false);
    setEditAssigneeSearchQuery("");
    setActivityTab("comments");
    setNewCommentText("");
    setCommentAttachments([]);
    setIsCommentFocused(false);
  };

  const handleUpdateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (!editTaskForm.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const totalMinutes =
      (Number(editEstimatedHours) || 0) * 60 +
      (Number(editEstimatedMinutes) || 0);

    if (totalMinutes <= 0) {
      toast.error(
        "Please enter a valid estimated time (greater than 0 minutes)",
      );
      return;
    }

    if (isAdmin && !editTaskForm.assignedTo) {
      toast.error("Please select an assignee for this task");
      return;
    }

    const userName = currentUser?.email?.split("@")[0] || "Team Member";
    const changes: { action: string; dot: string }[] = [];

    if (editTaskForm.status !== selectedTask.status) {
      const prevLabel =
        selectedTask.status.charAt(0).toUpperCase() +
        selectedTask.status.slice(1);
      const nextLabel =
        editTaskForm.status.charAt(0).toUpperCase() +
        editTaskForm.status.slice(1);
      const dot =
        editTaskForm.status === "completed"
          ? "bg-emerald-500"
          : editTaskForm.status === "blocked"
            ? "bg-rose-500"
            : editTaskForm.status === "in-progress"
              ? "bg-orange-500"
              : "bg-blue-500";
      changes.push({ action: `moved ${prevLabel} → ${nextLabel}`, dot });
    }

    if (editTaskForm.priority !== (selectedTask.priority || "medium")) {
      changes.push({
        action: `changed priority to ${editTaskForm.priority.charAt(0).toUpperCase() +
          editTaskForm.priority.slice(1)
          }`,
        dot: "bg-amber-500",
      });
    }

    if (
      isAdmin && editTaskForm.assignedTo &&
      String(editTaskForm.assignedTo) !==
      String(selectedTask.assigned_to?.id || "")
    ) {
      const newAssignee =
        editSelectedEmployeeObj?.name ||
        editSelectedEmployeeObj?.username ||
        "Employee";
      changes.push({
        action: `reassigned task to ${newAssignee}`,
        dot: "bg-purple-500",
      });
    }

    if (totalMinutes !== (Number(selectedTask.estimatedMinutes) || 0)) {
      changes.push({
        action: `updated estimated time to ${formatTime(totalMinutes)}`,
        dot: "bg-sky-500",
      });
    }

    try {
      await updateTask({
        id: selectedTask.id,
        body: {
          title: editTaskForm.title.trim(),
          description: editTaskForm.description.trim(),
          status: editTaskForm.status,
          priority: editTaskForm.priority,
          estimatedMinutes: totalMinutes,
          assignedTo: isAdmin
            ? editTaskForm.assignedTo || undefined
            : undefined,
          attachments: editAttachments.map((a) => a.id),
        },
      }).unwrap();

      changes.forEach((ch) => {
        recordTaskHistoryEvent(selectedTask.id, {
          user: userName,
          action: ch.action,
          dotColor: ch.dot,
        });
      });

      toast.success("Task updated successfully!");
      setSelectedTask(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || "Failed to update task");
    }
  };

  const handleUploadCommentPhotos = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const imageFiles = fileList.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please select an image file.");
      return;
    }
    setIsUploadingCommentPhoto(true);
    try {
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("files", file);
        const res: any = await uploadFile(formData).unwrap();
        const uploadedMedia = Array.isArray(res) ? res[0] : res;
        if (uploadedMedia?.id) {
          setCommentAttachments((prev) => [
            ...prev,
            {
              id: uploadedMedia.id,
              name: uploadedMedia.name || file.name,
              url: uploadedMedia.url || "",
              previewUrl: URL.createObjectURL(file),
              size: uploadedMedia.size || file.size,
              mime: uploadedMedia.mime || file.type,
              isUploading: false,
            },
          ]);
        }
      }
    } catch (err: any) {
      console.error("Failed to upload comment photo:", err);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingCommentPhoto(false);
    }
  };

  const handleAddComment = async () => {
    if (
      (!newCommentText.trim() && commentAttachments.length === 0) ||
      !selectedTask ||
      isPostingComment ||
      isUploadingCommentPhoto
    ) {
      return;
    }
    const commentBody = newCommentText.trim();
    const attachmentIds = commentAttachments.map((a) => a.id);
    try {
      await createTaskComment({
        comment: commentBody,
        task_item: Number(selectedTask.id) || selectedTask.id,
        attachments: attachmentIds,
      }).unwrap();
      setNewCommentText("");
      setCommentAttachments([]);
      setIsCommentFocused(false);
      toast.success("Comment posted successfully");
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message || err?.message || "Failed to post comment",
      );
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: TaskStatus) => {
    const currentTask = tasks.find((t) => t.id === taskId) || selectedTask;
    const prevStatus = currentTask?.status || "planned";
    setLocalTasksOverride((prev) => ({ ...prev, [taskId]: newStatus }));
    const userName = currentUser?.email?.split("@")[0] || "Team Member";

    try {
      await updateTask({
        id: taskId,
        body: { status: newStatus },
      }).unwrap();
      toast.success(`Task moved to ${newStatus}`);

      const prevLabel =
        prevStatus.charAt(0).toUpperCase() + prevStatus.slice(1);
      const nextLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      const dot =
        newStatus === "completed"
          ? "bg-emerald-500"
          : newStatus === "blocked"
            ? "bg-rose-500"
            : newStatus === "in-progress"
              ? "bg-orange-500"
              : "bg-blue-500";

      recordTaskHistoryEvent(taskId, {
        user: userName,
        action: `moved ${prevLabel} → ${nextLabel}`,
        timestamp: new Date().toISOString(),
        dotColor: dot,
      });

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
      refetch();
    } catch (err: any) {
      setLocalTasksOverride((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      if (selectedTask && selectedTask.id === taskId && currentTask) {
        setSelectedTask({ ...selectedTask, status: currentTask.status });
      }
      toast.error(
        err?.data?.error?.message || err?.message || "Failed to update status",
      );
    }
  };

  // Render Priority Indicator icon
  const renderPriorityIndicator = (priority?: string) => {
    const p = (priority || "medium").toLowerCase();
    if (p === "high") {
      return (
        <span
          className="text-rose-500 font-bold text-xs select-none"
          title="High Priority"
        >
          ▲
        </span>
      );
    }
    if (p === "low") {
      return (
        <span
          className="text-blue-500 font-bold text-xs select-none"
          title="Low Priority"
        >
          ▼
        </span>
      );
    }
    return (
      <span
        className="text-amber-500 font-bold text-xs select-none"
        title="Medium Priority"
      >
        ═
      </span>
    );
  };

  // Custom Priority Dropdown inside Create Task Modal
  const renderCreatePriorityDropdown = () => (
    <div>
      <label className="text-xs font-semibold text-slate-800 block mb-1.5">
        Priority
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setIsCreatePriorityDropdownOpen(!isCreatePriorityDropdownOpen)
          }
          className={`w-full h-[46px] px-3.5 bg-[#fafafa] border rounded-2xl text-xs text-left outline-none transition-all shadow-2xs flex items-center justify-between gap-2 cursor-pointer ${isCreatePriorityDropdownOpen
              ? "border-primary bg-white ring-2 ring-orange-500/10"
              : "border-slate-200/90 hover:border-slate-300"
            }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${taskForm.priority === "high"
                  ? "bg-rose-500"
                  : taskForm.priority === "low"
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
            />
            <span className="font-semibold text-slate-800 capitalize">
              {taskForm.priority || "Medium"}
            </span>
          </div>
          <ChevronDown
            size={15}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${isCreatePriorityDropdownOpen ? "rotate-180 text-primary" : ""
              }`}
          />
        </button>

        {isCreatePriorityDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setIsCreatePriorityDropdownOpen(false)}
            />
            <div className="absolute top-full mt-1.5 left-0 w-full z-50 bg-white border border-slate-200/90 shadow-xl rounded-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
              {PRIORITY_OPTIONS.map((opt) => {
                const isSelected = taskForm.priority === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setTaskForm({ ...taskForm, priority: opt.id });
                      setIsCreatePriorityDropdownOpen(false);
                    }}
                    className={`px-3.5 py-2.5 text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${isSelected
                        ? "bg-orange-50/90 text-primary font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full ${opt.dotColor}`}
                      />
                      <span className="font-medium">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-primary shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen flex flex-col p-5 overflow-y-auto min-h-0 gap-3.5 bg-[#fbfbfb] scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
              Drag and drop cards between columns to change status. 
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
            placeholder="Search tasks..."
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
                      setSelectedAssignee(isSelected ? null : assignee.username)
                    }
                    title={`Filter by ${assignee.username}`}
                    className={`relative w-7 h-7 rounded-full border-2 transition-all cursor-pointer overflow-hidden ${isSelected
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

          {/* Priority Filter Dropdown (Closes on outside click) */}
          <div className="relative" ref={priorityDropdownRef}>
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
              <>
                <div
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={() => setIsPriorityOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {["all", "high", "medium", "low"].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedPriority(p);
                        setIsPriorityOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer ${selectedPriority === p
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Kanban Board 4 Columns */}
      <ProjectKanbanBoard
        isLoading={isLoading}
        projectName={projectName}
        searchTerm={searchTerm}
        filteredTasks={filteredTasks}
        setSearchTerm={setSearchTerm}
        columnData={columnData}
        dragCounterMap={dragCounterMap}
        dragOverCol={dragOverCol}
        setDragOverCol={setDragOverCol}
        draggedTaskIdRef={draggedTaskIdRef}
        handleUpdateStatus={handleUpdateStatus}
        handleOpenAddModal={handleOpenAddModal}
        handleOpenEditModal={handleOpenEditModal}
        getImageUrl={getImageUrl}
        extractTaskAttachments={extractTaskAttachments}
        formatTaskTimestamp={formatTaskTimestamp}
        renderPriorityIndicator={renderPriorityIndicator}
        formatTime={formatTime}
        getAvatarBg={getAvatarBg}
        getInitials={getInitials}
      />

      <CreateTaskModal {...{ Check, ChevronDown, CircularProgress, STATUS_OPTIONS, Search, TaskAttachmentUpload, X, assigneeSearchQuery, attachments, estimatedHours, estimatedMinutes, extractEmployeePhotoUrl, filteredProjectEmployees, getAvatarBg, getInitials, handleCreateTaskSubmit, isAddModalOpen, isAdmin, isAssigneeDropdownOpen, isCreating, isProjectsLoading, isUploadingAttachments, modalTargetStatus, projectAssignedEmployees, projectName, renderCreatePriorityDropdown, selectedEmployeeObj, setAssigneeSearchQuery, setAttachments, setEstimatedHours, setEstimatedMinutes, setIsAddModalOpen, setIsAssigneeDropdownOpen, setIsCreatePriorityDropdownOpen, setIsUploadingAttachments, setModalTargetStatus, setTaskForm, taskForm }} />

      <EditTaskModal {...{ Check, ChevronDown, CircularProgress, Paperclip, STATUS_OPTIONS, Search, TaskAttachmentUpload, X, activityTab, attachments, commentAttachments, commentComposerRef, commentFileInputRef, completeHistory, currentUserName, currentUserPhoto, editAssigneeSearchQuery, editAttachments, editEstimatedHours, editEstimatedMinutes, editFilteredProjectEmployees, editSelectedEmployeeObj, editTaskForm, extractEmployeePhotoUrl, formatHistoryTime, getAvatarBg, getImageUrl, getInitials, handleAddComment, handleUpdateTaskSubmit, handleUploadCommentPhotos, isAdmin, isCommentExpanded, isCommentsLoading, isEditAssigneeDropdownOpen, isEditUploadingAttachments, isPostingComment, isProjectsLoading, isUpdating, isUploadingCommentPhoto, newCommentText, projectAssignedEmployees, selectedTask, setActivityTab, setCommentAttachments, setEditAssigneeSearchQuery, setEditAttachments, setEditEstimatedHours, setEditEstimatedMinutes, setEditTaskForm, setIsCommentFocused, setIsEditAssigneeDropdownOpen, setIsEditUploadingAttachments, setNewCommentText, setSelectedTask, setViewAttachmentPreview, taskCommentsList }} />

      {/* Lightbox Preview Modal for Task Details (Closes on backdrop click) */}
      {viewAttachmentPreview && (
        <div
          onClick={() => setViewAttachmentPreview(null)}
          className="fixed inset-0 z-9999 bg-black/25 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150"
          style={{ zIndex: 9999 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/80">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[320px]">
                {viewAttachmentPreview.name}
              </span>
              <button
                type="button"
                onClick={() => setViewAttachmentPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-2.5 flex items-center justify-center overflow-y-auto overflow-x-hidden max-h-[58vh] bg-slate-50/40 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <img
                src={getImageUrl(viewAttachmentPreview.url)}
                alt={viewAttachmentPreview.name}
                className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-2xs"
              />
            </div>
            <div className="flex items-center justify-end px-3.5 py-2 border-t border-slate-100 bg-slate-50/50 text-[11px]">
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
