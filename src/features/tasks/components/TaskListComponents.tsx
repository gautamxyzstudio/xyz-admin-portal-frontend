import React, { useState, useRef, useEffect } from "react";
import {
  Add,
  CalendarTodayOutlined,
  BlockOutlined,
  EventNoteOutlined,
  CheckCircleOutline,
  AccessTime,
  EditOutlined,
  DeleteOutline,
  PersonOutline,
  KeyboardArrowDown,
  AssignmentOutlined,
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

import {
  useGetTodayTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  type TaskStatus,
  type ITaskItem,
} from "../taskApi";
import { TaskModal, STATUS_CONFIG } from "./AddTaskModal";

interface StatusSelectProps {
  currentStatus: TaskStatus;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (newStatus: TaskStatus) => void;
}

const StatusSelect: React.FC<StatusSelectProps> = ({
  currentStatus,
  disabled = false,
  loading = false,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.planned;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect whether to open upwards or downwards based on viewport space
  const handleToggle = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // 160px is the approximate height of the status dropdown
      setOpenUpwards(spaceBelow < 170);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleToggle}
        className={`w-32 flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
          disabled || loading
            ? "opacity-75 cursor-not-allowed"
            : "cursor-pointer"
        } ${activeConfig.bg} ${activeConfig.text} ${activeConfig.border}`}
      >
        <span className="flex-1 text-center">{activeConfig.label}</span>
        {loading ? (
          <CircularProgress size={13} sx={{ color: "currentColor" }} />
        ) : (
          <KeyboardArrowDown
            sx={{
              fontSize: 15,
              transform: isOpen ? (openUpwards ? "rotate(0deg)" : "rotate(180deg)") : "rotate(0deg)",
              transition: "transform 0.2s ease-in-out",
            }}
          />
        )}
      </button>

      {isOpen && !disabled && !loading && (
        <div
          className={`absolute right-0 w-32 rounded-xl bg-white border border-gray-100 shadow-xl py-1 z-30 animate-in fade-in duration-100 ${
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((statusKey) => {
            const config = STATUS_CONFIG[statusKey];
            const isSelected = statusKey === currentStatus;

            return (
              <button
                key={statusKey}
                type="button"
                onClick={() => {
                  onSelect(statusKey);
                  setIsOpen(false);
                }}
                className={`w-full text-center px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-gray-50 text-gray-900 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const formatEstimatedTime = (totalMinutes?: number) => {
  if (!totalMinutes || totalMinutes <= 0) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} mins`;
  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${minutes} mins`;
};

const TaskListComponents = () => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [activeTab, setActiveTab] = useState<TaskStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<ITaskItem | null>(
    null
  );

  const [deletingTaskId, setDeletingTaskId] = useState<string | number | null>(
    null
  );
  const [updatingTaskId, setUpdatingTaskId] = useState<string | number | null>(
    null
  );

  // RTK Query: GET Today's Tasks
  const {
    data: taskItems = [],
    isLoading,
    refetch,
  } = useGetTodayTasksQuery();

  // RTK Query: Mutations
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  // Status Counts
  const inProgressCount = taskItems.filter(
    (t) => t.status === "in-progress"
  ).length;
  const plannedCount = taskItems.filter((t) => t.status === "planned").length;
  const blockedCount = taskItems.filter((t) => t.status === "blocked").length;
  const completedCount = taskItems.filter(
    (t) => t.status === "completed"
  ).length;

  const filteredTasks =
    activeTab === "all"
      ? taskItems
      : taskItems.filter((task) => task.status === activeTab);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setSelectedTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: ITaskItem) => {
    setSelectedTaskToEdit(task);
    setIsModalOpen(true);
  };

  // Status Dropdown Update with Refetch Sync
  const handleStatusChange = async (
    id: string | number,
    newStatus: TaskStatus
  ) => {
    try {
      setUpdatingTaskId(id);
      await updateTask({
        id,
        body: { status: newStatus },
      }).unwrap();
      await refetch();
    } catch (error) {
      console.error(`Failed to update task ${id}:`, error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Delete with Refetch Sync
  const handleDeleteTask = async (id: string | number) => {
    try {
      setDeletingTaskId(id);
      await deleteTask(id).unwrap();
      await refetch();
    } catch (error) {
      console.error(`Failed to delete task ${id}:`, error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <div className="w-full h-full max-h-full min-h-0 flex flex-col gap-3.5 p-1 overflow-hidden">
      {/* 1. Fixed Header Section */}
      <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Today's Tasks</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize, monitor, and update your tasks for {todayStr}.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
        >
          <Add fontSize="small" />
          <span>Add Task</span>
        </button>
      </div>

      {/* 2. Fixed Metric Cards */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab("in-progress")}
          className={`bg-white py-3 px-4 rounded-xl border transition cursor-pointer ${
            activeTab === "in-progress"
              ? "border-orange-500 shadow-xs"
              : "border-gray-100 shadow-xs hover:border-orange-200"
          } flex items-center justify-between`}
        >
          <div>
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
              In-Progress
            </span>
            <h3 className="text-xl font-bold text-orange-600 mt-0.5">
              {inProgressCount}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
            <CalendarTodayOutlined sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("planned")}
          className={`bg-white py-3 px-4 rounded-xl border transition cursor-pointer ${
            activeTab === "planned"
              ? "border-blue-500 shadow-xs"
              : "border-gray-100 shadow-xs hover:border-blue-200"
          } flex items-center justify-between`}
        >
          <div>
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
              Planned
            </span>
            <h3 className="text-xl font-bold text-blue-600 mt-0.5">
              {plannedCount}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
            <EventNoteOutlined sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("blocked")}
          className={`bg-white py-3 px-4 rounded-xl border transition cursor-pointer ${
            activeTab === "blocked"
              ? "border-red-500 shadow-xs"
              : "border-gray-100 shadow-xs hover:border-red-200"
          } flex items-center justify-between`}
        >
          <div>
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
              Blocked
            </span>
            <h3 className="text-xl font-bold text-red-600 mt-0.5">
              {blockedCount}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
            <BlockOutlined sx={{ fontSize: 16 }} />
          </div>
        </div>

        <div
          onClick={() => setActiveTab("completed")}
          className={`bg-white py-3 px-4 rounded-xl border transition cursor-pointer ${
            activeTab === "completed"
              ? "border-emerald-500 shadow-xs"
              : "border-gray-100 shadow-xs hover:border-emerald-200"
          } flex items-center justify-between`}
        >
          <div>
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">
              Completed
            </span>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5">
              {completedCount}
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircleOutline sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* 3. Fixed Tabs */}
      <div className="shrink-0 flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        {(
          ["all", "in-progress", "planned", "blocked", "completed"] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer shrink-0 outline-none capitalize ${
              activeTab === tab
                ? tab === "all" || tab === "in-progress"
                  ? "text-orange-600 border-b-2 border-orange-500"
                  : tab === "planned"
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : tab === "blocked"
                      ? "text-red-600 border-b-2 border-red-500"
                      : "text-emerald-600 border-b-2 border-emerald-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "all" ? "All Tasks" : tab} (
            {tab === "all"
              ? taskItems.length
              : tab === "in-progress"
                ? inProgressCount
                : tab === "planned"
                  ? plannedCount
                  : tab === "blocked"
                    ? blockedCount
                    : completedCount}
            )
          </button>
        ))}
      </div>

      {/* 4. Independent Scrollable Task List with Hidden Scrollbars */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-4 flex flex-col gap-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center my-auto">
            <CircularProgress size={26} sx={{ color: "#ea580c" }} />
            <p className="text-gray-400 text-xs mt-2">Loading today's tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-6 flex flex-col items-center justify-center text-center shadow-2xs my-auto">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-3.5 shadow-xs">
              <AssignmentOutlined sx={{ fontSize: 28 }} />
            </div>

            <h3 className="text-sm font-semibold text-gray-800">
              {activeTab === "all"
                ? "No tasks for today"
                : `No ${activeTab} tasks found`}
            </h3>

            <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
              {activeTab === "all"
                ? "Get started by adding your first daily work item or planned activity."
                : `You currently have no tasks marked as "${activeTab}" for today.`}
            </p>

            {activeTab === "all" && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-semibold transition-all cursor-pointer active:scale-95"
              >
                <Add sx={{ fontSize: 16 }} />
                <span>Create Task</span>
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((item) => {
            const formattedTime = formatEstimatedTime(item.estimatedMinutes);
            const isItemDeleting = deletingTaskId === item.id;
            const isItemUpdating = updatingTaskId === item.id;
            const isItemBusy = isItemDeleting || isItemUpdating;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border border-gray-100 p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition hover:border-orange-200 ${
                  isItemBusy ? "opacity-75" : ""
                }`}
              >
                {/* Left: Task Description */}
                <div className="flex flex-col flex-1 pl-1">
                  <span className="text-sm font-semibold leading-snug text-gray-800">
                    {item.description}
                  </span>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {formattedTime && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 font-medium flex items-center gap-1">
                        <AccessTime style={{ fontSize: 12 }} />
                        {formattedTime}
                      </span>
                    )}

                    {item.task_created_by && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium flex items-center gap-1">
                        <PersonOutline style={{ fontSize: 12 }} />
                        <span className="text-gray-400 font-normal">
                          Created by:
                        </span>
                        <span className="font-semibold text-gray-700">
                          {item.task_created_by}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Custom Status Dropdown, Edit & Delete Buttons */}
                <div className="flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <StatusSelect
                    currentStatus={item.status}
                    loading={isItemUpdating}
                    disabled={isItemBusy}
                    onSelect={(newStatus) =>
                      handleStatusChange(item.id, newStatus)
                    }
                  />

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    disabled={isItemBusy}
                    title="Edit task"
                    className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-lg hover:bg-blue-50 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <EditOutlined sx={{ fontSize: 18 }} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTask(item.id)}
                    disabled={isItemBusy}
                    title="Delete task"
                    className="text-gray-300 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isItemDeleting ? (
                      <CircularProgress size={16} sx={{ color: "#ef4444" }} />
                    ) : (
                      <DeleteOutline sx={{ fontSize: 18 }} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTaskToEdit(null);
        }}
        onSuccess={async () => {
          await refetch();
        }}
        taskToEdit={selectedTaskToEdit}
      />
    </div>
  );
};

export default TaskListComponents;