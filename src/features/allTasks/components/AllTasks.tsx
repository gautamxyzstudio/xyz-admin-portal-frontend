import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ListTodo,
  User,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Eye,
  X,
  ArrowRight,
  Plus,
  RotateCcw,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import {
  type ITaskItem,
  useGetAllTasksQuery,
  useGetActiveEmployeesQuery,
  useDeleteAdminTaskMutation,
} from "../allTaskApi";
import {
  AdminTaskModal,
  CustomDatePicker,
  STATUS_CONFIG,
} from "./AdminTaskModal";

// Helper function to resolve photo arrays, nested formats, and absolute/relative URLs
const getValidImageUrl = (photo: any): string | null => {
  if (!photo) return null;

  // Handle array structure like photo: ["https://storage.googleapis.com/..."]
  if (Array.isArray(photo)) {
    if (photo.length === 0) return null;
    return getValidImageUrl(photo[0]);
  }

  // Handle direct string URLs
  if (typeof photo === "string") {
    const trimmed = photo.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    const backendBaseUrl =
      (import.meta as any).env?.VITE_BACKEND_URL ||
      (import.meta as any).env?.VITE_API_URL ||
      "http://localhost:1337";
    return `${backendBaseUrl.replace(/\/$/, "")}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
  }

  // Handle nested object formats (Strapi media objects)
  if (typeof photo === "object") {
    const nested =
      photo?.url ||
      photo?.formats?.thumbnail?.url ||
      photo?.formats?.small?.url ||
      photo?.data?.attributes?.url ||
      null;
    return nested ? getValidImageUrl(nested) : null;
  }

  return null;
};

export default function AllTasks() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [isTodayOnly, setIsTodayOnly] = useState<boolean>(true);

  // Directly bound query dates
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // State to track which task is currently deleting until refetch completes
  const [deletingTaskId, setDeletingTaskId] = useState<string | number | null>(null);

  // RTK Query fetches immediately whenever startDate or endDate changes
  const {
    data: taskContainers = [],
    isLoading: isTasksInitialLoading,
    isFetching: isTasksFetching,
    refetch,
  } = useGetAllTasksQuery({
    startDate: isTodayOnly ? todayStr : startDate,
    endDate: isTodayOnly ? todayStr : endDate,
  });

  const { data: activeEmployees = [] } = useGetActiveEmployeesQuery();
  const [deleteAdminTask] = useDeleteAdminTaskMutation();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ITaskItem | null>(null);
  const [viewingTask, setViewingTask] = useState<{
    employee: string | null;
    task: ITaskItem;
  } | null>(null);

  const hasActiveFilters = useMemo(() => {
    return !isTodayOnly || searchTerm.trim().length > 0;
  }, [isTodayOnly, searchTerm]);

  const handleClearFilters = () => {
    setIsTodayOnly(true);
    setStartDate(todayStr);
    setEndDate(todayStr);
    setSearchTerm("");
  };

  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatMinutes = (totalMins: number = 0) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const handleDeleteTask = async (taskId: string | number) => {
    try {
      setDeletingTaskId(taskId);
      await deleteAdminTask(taskId).unwrap();
      await refetch();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return taskContainers;

    return taskContainers
      .map((entry) => {
        const matchesEmployee = (entry.employee || "")
          .toLowerCase()
          .includes(query);

        const matchingTasks = (entry.task_items || []).filter((task) =>
          task.title.toLowerCase().includes(query)
        );

        if (matchesEmployee) {
          return entry;
        }

        if (matchingTasks.length > 0) {
          return {
            ...entry,
            task_items: matchingTasks,
          };
        }

        return null;
      })
      .filter((entry): entry is (typeof taskContainers)[0] => entry !== null);
  }, [taskContainers, searchTerm]);

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden min-h-0">
      {/* Header - Fixed */}
      <div className="flex flex-row items-center justify-between gap-4 shrink-0 pt-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Employee Daily Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily work allocations and workload estimates
          </p>
        </div>
        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Assign Task
        </button>
      </div>

      {/* Control Filter Bar - Fixed */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold shrink-0">
            <button
              onClick={() => {
                setIsTodayOnly(true);
                setStartDate(todayStr);
                setEndDate(todayStr);
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                isTodayOnly
                  ? "bg-white text-orange-600 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setIsTodayOnly(false)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                !isTodayOnly
                  ? "bg-white text-orange-600 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Custom Range
            </button>
          </div>

          {!isTodayOnly && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  From
                </span>
                <CustomDatePicker
                  value={startDate}
                  onChange={(d) => {
                    setStartDate(d);
                    // If start date is ahead of current end date, bump end date to match
                    if (d > endDate) {
                      setEndDate(d);
                    }
                  }}
                  className="w-36"
                />
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  To
                </span>
                <CustomDatePicker
                  value={endDate}
                  minDate={startDate}
                  onChange={(d) => {
                    setEndDate(d);
                  }}
                  className="w-36"
                />
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employee or task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Task List Scrollable Container - Hidden Scrollbar */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isTasksInitialLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((skeletonId) => (
              <div
                key={skeletonId}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-5 animate-pulse"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-slate-200 rounded-md" />
                      <div className="w-20 h-3 bg-slate-100 rounded-md" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="flex items-center gap-8">
                      <div className="space-y-1 text-center">
                        <div className="w-10 h-2.5 bg-slate-100 rounded mx-auto" />
                        <div className="w-6 h-4 bg-slate-200 rounded mx-auto" />
                      </div>
                      <div className="space-y-1 text-center">
                        <div className="w-12 h-2.5 bg-slate-100 rounded mx-auto" />
                        <div className="w-10 h-4 bg-slate-200 rounded mx-auto" />
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-slate-100 rounded-xl shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm space-y-3">
            {searchTerm.trim() ? (
              <>
                <p>
                  No tasks found for employee name matching &ldquo;
                  <span className="text-slate-700 font-medium">{searchTerm}</span>
                  &rdquo;.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Search
                </button>
              </>
            ) : !isTodayOnly ? (
              <>
                <p>No employee task records found for the selected date range.</p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Today
                </button>
              </>
            ) : (
              <p>No employee tasks recorded for today.</p>
            )}
          </div>
        ) : (
          <div
            className={`flex flex-col gap-4 transition-opacity duration-200 ${
              isTasksFetching && !deletingTaskId ? "opacity-60" : "opacity-100"
            }`}
          >
            {filteredData.map((container) => {
              const tasks = container.task_items || [];
              const totalEstimatedMins = tasks.reduce(
                (acc, curr) => acc + (curr.estimatedMinutes || 0),
                0
              );
              const isExpanded = expandedCards[container.id] ?? false;

              // Advanced name matching (supports partials like "Sumit" matching "Sumit Thakur" and "Amit" matching "Amit Singh")
              const matchedEmp = activeEmployees.find((e: any) => {
                const containerEmp = (container.employee || "").trim().toLowerCase();
                const empName = (e.name || "").trim().toLowerCase();
                const empUsername = (e.username || "").trim().toLowerCase();

                if (!containerEmp) return false;

                // Exact match
                if (empName === containerEmp || empUsername === containerEmp) return true;

                // First name match
                const empFirstName = empName.split(" ")[0];
                if (empFirstName && empFirstName === containerEmp) return true;

                // Container contains full name or full name starts with container name
                if (empName.startsWith(containerEmp) || containerEmp.startsWith(empName)) return true;

                // Direct ID matching if available
                return String(e.id) === String((container as any).employeeId || (container as any).employee_id);
              });

              // Extract photo array or object from matched employee / container
              const rawPhoto =
                (matchedEmp as any)?.photo ||
                (matchedEmp as any)?.profile_photo ||
                (matchedEmp as any)?.profile_image ||
                (matchedEmp as any)?.avatar ||
                (container as any).photo ||
                container.profile_photo;

              const avatarUrl = getValidImageUrl(rawPhoto);

              return (
                <div
                  key={container.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition hover:border-slate-300"
                >
                  {/* Employee Row Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={container.employee || ""}
                          className="w-10 h-10 rounded-xl object-cover border border-orange-200/70 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-200/70 shrink-0">
                          {container.employee ? (
                            container.employee.slice(0, 2).toUpperCase()
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 leading-tight">
                          {container.employee || "Unassigned"}
                        </h3>
                        <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {container.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/60">
                      <div className="flex items-center gap-8 text-center">
                        <div>
                          <span className="text-[11px] text-slate-400 uppercase font-medium block">
                            Tasks
                          </span>
                          <span className="font-semibold text-slate-800 text-sm">
                            {tasks.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 uppercase font-medium block">
                            Est. Time
                          </span>
                          <span className="font-semibold text-slate-800 text-sm">
                            {formatMinutes(totalEstimatedMins)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(container.id)}
                        className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/50 transition shrink-0 cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tasks Grid */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-white">
                      {tasks.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">
                          No tasks found for this employee.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {tasks.map((task) => {
                            const isThisTaskDeleting = deletingTaskId === task.id;
                            const statusCfg =
                              STATUS_CONFIG[task.status] || STATUS_CONFIG.planned;
                            const StatusIcon =
                              task.status === "completed"
                                ? CheckCircle2
                                : task.status === "in-progress"
                                ? Clock3
                                : task.status === "blocked"
                                ? AlertCircle
                                : ListTodo;

                            return (
                              <div
                                key={task.id}
                                className={`relative p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all space-y-3 ${
                                  isThisTaskDeleting ? "opacity-40 pointer-events-none" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-sm font-semibold text-slate-800 leading-snug break-words">
                                    {task.title}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                                  >
                                    <StatusIcon className="w-3 h-3" />
                                    {statusCfg.label}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                                  <span className="flex items-center gap-1 font-medium text-slate-600">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {formatMinutes(task.estimatedMinutes)}
                                  </span>

                                  <div className="flex items-center gap-0.5">
                                    <button
                                      onClick={() =>
                                        setViewingTask({
                                          employee: container.employee,
                                          task,
                                        })
                                      }
                                      disabled={isThisTaskDeleting}
                                      title="View Task Details"
                                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer disabled:opacity-40"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setTaskToEdit(task);
                                        setIsModalOpen(true);
                                      }}
                                      disabled={isThisTaskDeleting}
                                      title="Edit Task"
                                      className="p-1 rounded-md text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer disabled:opacity-40"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      disabled={isThisTaskDeleting}
                                      title="Delete Task"
                                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:cursor-not-allowed"
                                    >
                                      {isThisTaskDeleting ? (
                                        <CircularProgress size={13} sx={{ color: "#e11d48" }} />
                                      ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Creation & Edit Modal */}
      <AdminTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        employees={activeEmployees}
        todayStr={todayStr}
      />

      {/* View Task Details Modal */}
      {viewingTask &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-in fade-in duration-200">
            <div
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Header Banner */}
              <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-b border-orange-100/60 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider text-orange-700 bg-orange-100/80 border border-orange-200/60 uppercase">
                    Task #{viewingTask.task.id}
                  </span>
                  {viewingTask.task.date && (
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      {viewingTask.task.date}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setViewingTask(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-all cursor-pointer shadow-2xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-7 space-y-6">
                {/* Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-slate-900 leading-snug tracking-tight">
                    {viewingTask.task.title}
                  </h2>
                  {(() => {
                    const statusCfg =
                      STATUS_CONFIG[viewingTask.task.status] || STATUS_CONFIG.planned;
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border shrink-0 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Description Box */}
                <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <ListTodo className="w-3.5 h-3.5 text-orange-500" />
                    <span>Description</span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-xs">
                    {viewingTask.task.description || (
                      <span className="text-slate-400 italic">No description provided for this task.</span>
                    )}
                  </p>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Assigned To */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Assigned To
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800 text-xs truncate">
                        {viewingTask.employee || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Duration */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Est. Duration
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800 text-xs">
                        {formatMinutes(viewingTask.task.estimatedMinutes)}
                      </span>
                    </div>
                  </div>

                  {/* Created By */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Created By
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800 text-xs truncate">
                        {viewingTask.task.task_created_by || "HR / Admin"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => setViewingTask(null)}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}