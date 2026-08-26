import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import {
  type TaskStatus,
  type ITaskItem,
  type IActiveEmployee,
  useCreateAdminTaskMutation,
  useUpdateAdminTaskMutation,
} from "../allTaskApi";

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  "in-progress": {
    label: "In-Progress",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  planned: {
    label: "Planned",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  blocked: {
    label: "Blocked",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export const CustomDatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  className?: string;
}> = ({ value, onChange, minDate, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(selected.getMonth());
  const [currentYear, setCurrentYear] = useState(selected.getFullYear());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const formatDisplay = (isoStr: string) => {
    if (!isoStr) return "";
    const [y, m, d] = isoStr.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className={`relative ${className || "w-full"}`} ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl cursor-pointer hover:bg-white focus:border-orange-500 transition text-gray-800 font-medium"
      >
        <span>{formatDisplay(value)}</span>
        <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0 ml-1.5" />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1.5 right-0 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-800">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className="text-[10px] font-semibold text-gray-400">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = value === formattedDate;
              const isDisabled = minDate ? formattedDate < minDate : false;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(formattedDate);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-7 h-7 text-xs flex items-center justify-center rounded-full transition ${
                    isDisabled
                      ? "text-gray-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-orange-600 text-white font-bold shadow-xs cursor-pointer"
                      : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ModalStatusSelect: React.FC<{
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
      {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((statusKey) => {
        const config = STATUS_CONFIG[statusKey];
        const isSelected = statusKey === value;

        return (
          <button
            key={statusKey}
            type="button"
            onClick={() => onChange(statusKey)}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isSelected
                ? `${config.bg} ${config.text} ${config.border} shadow-2xs ring-1.5 ring-orange-400/40`
                : "bg-gray-50/70 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

interface AdminTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ITaskItem | null;
  employees: IActiveEmployee[];
  todayStr: string;
}

export const AdminTaskModal: React.FC<AdminTaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  employees,
  todayStr,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | string>("");
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [taskDate, setTaskDate] = useState(todayStr);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("planned");
  const [hours, setHours] = useState<number | string>("");
  const [minutes, setMinutes] = useState<number | string>("");
  const [errors, setErrors] = useState<{ title?: string; time?: string; employee?: string }>({});

  const [createAdminTask, { isLoading: isCreating }] = useCreateAdminTaskMutation();
  const [updateAdminTask, { isLoading: isUpdating }] = useUpdateAdminTaskMutation();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setStatus(taskToEdit.status || "planned");
      const est = taskToEdit.estimatedMinutes || 0;
      setHours(Math.floor(est / 60) || "");
      setMinutes(est % 60 || "");
      setTaskDate(taskToEdit.date || todayStr);
      setErrors({});
    } else {
      setTitle("");
      setDescription("");
      setStatus("planned");
      setHours("");
      setMinutes("");
      setTaskDate(todayStr);
      if (employees.length > 0) {
        setSelectedEmployeeId(employees[0].id);
      }
      setErrors({});
    }
  }, [taskToEdit, isOpen, employees, todayStr]);

  if (!isOpen) return null;

  const currentEmployee = employees.find((e) => e.id === Number(selectedEmployeeId));

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; time?: string; employee?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Task title is required.";
    }

    if (!taskToEdit && !selectedEmployeeId) {
      newErrors.employee = "Please select an employee.";
    }

    const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
    if (totalMinutes <= 0) {
      newErrors.time = "Please enter estimated time.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (taskToEdit) {
        await updateAdminTask({
          id: taskToEdit.id,
          body: {
            title: title.trim(),
            description: description.trim(),
            status,
            estimatedMinutes: totalMinutes,
          },
        }).unwrap();
      } else {
        await createAdminTask({
          title: title.trim(),
          description: description.trim(),
          status,
          date: taskDate,
          estimatedMinutes: totalMinutes,
          employeeId: selectedEmployeeId,
        }).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[99999]">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">
            {taskToEdit ? "Edit Task" : "Assign Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleModalSubmit} noValidate className="flex flex-col gap-4">
          {!taskToEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                  className="w-full flex items-center justify-between text-xs px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl cursor-pointer hover:bg-white focus:border-orange-500 transition text-gray-800 font-medium"
                >
                  <div className="flex items-center gap-2 truncate">
                    {currentEmployee?.profile_photo && typeof currentEmployee.profile_photo === "object" ? (
                      <img
                        src={
                          currentEmployee.profile_photo.formats?.thumbnail?.url ||
                          currentEmployee.profile_photo.url
                        }
                        alt=""
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                    ) : null}
                    <span className="truncate">
                      {currentEmployee?.name || currentEmployee?.username || "Select Employee"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      isEmployeeDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {errors.employee && (
                  <span className="text-[11px] text-red-500 font-medium mt-1 block">
                    {errors.employee}
                  </span>
                )}

                {isEmployeeDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsEmployeeDropdownOpen(false)}
                    />
                    {/* Scrollbar hidden cleanly with Tailwind utilities */}
                    <div className="absolute top-full mt-1.5 left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-20 py-1 max-h-48 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {employees.map((emp) => {
                        const avatarUrl =
                          typeof emp.profile_photo === "object"
                            ? emp.profile_photo?.formats?.thumbnail?.url || emp.profile_photo?.url
                            : typeof emp.profile_photo === "string"
                            ? emp.profile_photo
                            : null;

                        return (
                          <div
                            key={emp.id}
                            onClick={() => {
                              setSelectedEmployeeId(emp.id);
                              setIsEmployeeDropdownOpen(false);
                              if (errors.employee) setErrors((prev) => ({ ...prev, employee: undefined }));
                            }}
                            className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-orange-50 flex items-center gap-2 transition ${
                              selectedEmployeeId === emp.id
                                ? "bg-orange-50/60 text-orange-600 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[10px]">
                                {(emp.name || emp.username || "U").slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <span className="truncate">{emp.name || emp.username}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Task Date <span className="text-red-500">*</span>
                </label>
                <CustomDatePicker value={taskDate} minDate={todayStr} onChange={setTaskDate} />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={`w-full text-xs px-3.5 py-2.5 border rounded-xl outline-none transition text-gray-800 placeholder:text-gray-400 ${
                errors.title
                  ? "border-red-400 focus:border-red-500 bg-red-50/20"
                  : "border-gray-200 bg-gray-50/70 focus:bg-white focus:border-orange-500"
              }`}
            />
            {errors.title && (
              <span className="text-[11px] text-red-500 font-medium mt-1 block">
                {errors.title}
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Add key objectives, links, or task notes... (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[85px] text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none bg-gray-50/70 focus:bg-white focus:border-orange-500 transition resize-y leading-relaxed text-gray-800 placeholder:text-gray-400 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <ModalStatusSelect value={status} onChange={setStatus} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mt-1">
              Estimated Time <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);
                    if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
                  }}
                  className={`w-full text-xs px-3.5 py-2.5 pr-10 border rounded-xl outline-none transition bg-gray-50/70 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    errors.time
                      ? "border-red-400 focus:border-red-500 bg-red-50/20"
                      : "border-gray-200 focus:border-orange-500"
                  }`}
                />
                <span className="absolute right-3.5 text-xs text-gray-400 pointer-events-none">hrs</span>
              </div>

              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="30"
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value);
                    if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
                  }}
                  className={`w-full text-xs px-3.5 py-2.5 pr-10 border rounded-xl outline-none transition bg-gray-50/70 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    errors.time
                      ? "border-red-400 focus:border-red-500 bg-red-50/20"
                      : "border-gray-200 focus:border-orange-500"
                  }`}
                />
                <span className="absolute right-3.5 text-xs text-gray-400 pointer-events-none">mins</span>
              </div>
            </div>
            {errors.time && (
              <span className="text-[11px] text-red-500 font-medium mt-1 block">
                {errors.time}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px] h-[38px] flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold shadow-xs hover:opacity-95 transition cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <CircularProgress size={16} sx={{ color: "#ffffff" }} />
              ) : taskToEdit ? (
                "Update Task"
              ) : (
                "Save Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};