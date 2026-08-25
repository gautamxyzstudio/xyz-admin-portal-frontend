import React, { useState } from "react";
import {
  Add,
  CheckCircleOutline,
  RadioButtonUnchecked,
  CalendarTodayOutlined,
  BlockOutlined,
  EventNoteOutlined,
  AccessTime,
  DeleteOutline,
  PersonOutline,
} from "@mui/icons-material";

export type TaskStatus = "in-progress" | "planned" | "blocked" | "completed";

export interface ITaskItem {
  id: string | number;
  description: string;
  status: TaskStatus;
  estimatedMinutes?: number;
  date: string;
  task_created_by?: string | null;
}

const Tasks: React.FC = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [activeTab, setActiveTab] = useState<TaskStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Mock State representing today's items returned by getTodayTasks
  const [taskItems, setTaskItems] = useState<ITaskItem[]>([
    {
      id: "1",
      description: "Implement interactive daily task UI dashboard with tabs and modal",
      status: "in-progress",
      estimatedMinutes: 90,
      date: todayStr,
      task_created_by: "testEmployee",
    },
    {
      id: "2",
      description: "Review handbook guidelines and leave balance policies for Q3",
      status: "completed",
      estimatedMinutes: 45,
      date: todayStr,
      task_created_by: "Admin",
    },
    {
      id: "3",
      description: "Setup Strapi custom task controllers and lifecycle hooks",
      status: "planned",
      estimatedMinutes: 120,
      date: todayStr,
      task_created_by: "testEmployee",
    },
    {
      id: "4",
      description: "Investigate AWS Cognito auth token expiration in staging environment",
      status: "blocked",
      estimatedMinutes: 60,
      date: todayStr,
      task_created_by: "HR",
    },
  ]);

  // Modal Form State
  const [newTask, setNewTask] = useState<{
    description: string;
    date: string;
    status: TaskStatus;
    estimatedMinutes: number | string;
  }>({
    description: "",
    date: todayStr,
    status: "planned",
    estimatedMinutes: 30,
  });

  // Strict Today Filter
  const todayTasks = taskItems.filter((t) => t.date === todayStr);

  // Status Counts for Today
  const inProgressCount = todayTasks.filter((t) => t.status === "in-progress").length;
  const plannedCount = todayTasks.filter((t) => t.status === "planned").length;
  const blockedCount = todayTasks.filter((t) => t.status === "blocked").length;
  const completedCount = todayTasks.filter((t) => t.status === "completed").length;

  // Filtered list for current tab
  const filteredTasks =
    activeTab === "all"
      ? todayTasks
      : todayTasks.filter((task) => task.status === activeTab);

  const handleStatusChange = (id: string | number, newStatus: TaskStatus) => {
    setTaskItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const handleToggleCompleted = (id: string | number, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === "completed" ? "in-progress" : "completed";
    handleStatusChange(id, nextStatus);
  };

  const handleDeleteTask = (id: string | number) => {
    setTaskItems((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.description.trim()) return;

    const createdItem: ITaskItem = {
      id: Date.now().toString(),
      description: newTask.description,
      date: todayStr,
      status: newTask.status,
      estimatedMinutes: Number(newTask.estimatedMinutes) || 0,
      task_created_by: "You",
    };

    setTaskItems([createdItem, ...taskItems]);
    setNewTask({
      description: "",
      date: todayStr,
      status: "planned",
      estimatedMinutes: 30,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-5 p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Today's Tasks</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize, monitor, and update your tasks for {todayStr}.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[linear-gradient(95deg,#ff7300_0%,#d17200_100%)] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition active:scale-95 cursor-pointer"
        >
          <Add fontSize="small" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Compact Status Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* IN-PROGRESS */}
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
            <h3 className="text-xl font-bold text-orange-600 mt-0.5">{inProgressCount}</h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
            <CalendarTodayOutlined sx={{ fontSize: 16 }} />
          </div>
        </div>

        {/* PLANNED */}
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
            <h3 className="text-xl font-bold text-blue-600 mt-0.5">{plannedCount}</h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
            <EventNoteOutlined sx={{ fontSize: 16 }} />
          </div>
        </div>

        {/* BLOCKED */}
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
            <h3 className="text-xl font-bold text-red-600 mt-0.5">{blockedCount}</h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
            <BlockOutlined sx={{ fontSize: 16 }} />
          </div>
        </div>

        {/* COMPLETED */}
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
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5">{completedCount}</h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircleOutline sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer shrink-0 outline-none ${
            activeTab === "all"
              ? "text-orange-600 border-b-2 border-orange-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          All Tasks ({todayTasks.length})
        </button>

        <button
          onClick={() => setActiveTab("in-progress")}
          className={`pb-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer shrink-0 outline-none ${
            activeTab === "in-progress"
              ? "text-orange-600 border-b-2 border-orange-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          In-Progress ({inProgressCount})
        </button>

        <button
          onClick={() => setActiveTab("planned")}
          className={`pb-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer shrink-0 outline-none ${
            activeTab === "planned"
              ? "text-blue-600 border-b-2 border-blue-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Planned ({plannedCount})
        </button>

        <button
          onClick={() => setActiveTab("blocked")}
          className={`pb-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer shrink-0 outline-none ${
            activeTab === "blocked"
              ? "text-red-600 border-b-2 border-red-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Blocked ({blockedCount})
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`pb-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer shrink-0 outline-none ${
            activeTab === "completed"
              ? "text-emerald-600 border-b-2 border-emerald-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <p className="text-gray-400 text-xs">No tasks found for today in this category.</p>
          </div>
        ) : (
          filteredTasks.map((item) => {
            const isCompleted = item.status === "completed";
            const isBlocked = item.status === "blocked";

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition ${
                  isBlocked
                    ? "border-red-200 bg-red-50/20"
                    : "border-gray-100 hover:border-orange-200"
                }`}
              >
                {/* Left: Check & Description */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => handleToggleCompleted(item.id, item.status)}
                    className="mt-0.5 text-gray-300 hover:text-orange-500 transition cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckCircleOutline className="text-emerald-500" sx={{ fontSize: 20 }} />
                    ) : (
                      <RadioButtonUnchecked sx={{ fontSize: 20 }} />
                    )}
                  </button>

                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold leading-snug ${
                        isCompleted
                          ? "line-through text-gray-400"
                          : isBlocked
                          ? "text-red-700"
                          : "text-gray-800"
                      }`}
                    >
                      {item.description}
                    </span>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                        Today
                      </span>

                      {item.estimatedMinutes ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 font-medium flex items-center gap-1">
                          <AccessTime style={{ fontSize: 12 }} />
                          {item.estimatedMinutes} mins
                        </span>
                      ) : null}

                      {item.task_created_by && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-medium flex items-center gap-1">
                          <PersonOutline style={{ fontSize: 12 }} />
                          {item.task_created_by}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Dropdown & Delete */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value as TaskStatus)
                    }
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                      item.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : item.status === "blocked"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : item.status === "planned"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-orange-50 text-orange-700 border-orange-200"
                    }`}
                  >
                    <option value="in-progress">In-Progress</option>
                    <option value="planned">Planned</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTask(item.id)}
                    title="Delete task"
                    className="text-gray-300 hover:text-red-500 transition p-1 cursor-pointer"
                  >
                    <DeleteOutline sx={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl">
            <h2 className="text-base font-bold text-gray-800 mb-3">Add Today's Task</h2>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What are you working on today?"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition bg-white"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 60"
                    value={newTask.estimatedMinutes}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        estimatedMinutes: e.target.value,
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[linear-gradient(95deg,#ff7300_0%,#d17200_100%)] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;