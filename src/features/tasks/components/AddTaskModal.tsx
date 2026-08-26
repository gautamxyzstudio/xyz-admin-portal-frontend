import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  type TaskStatus,
  type ITaskItem,
} from "../taskApi";

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  "in-progress": {
    label: "In-Progress",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  planned: {
    label: "Planned",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  blocked: {
    label: "Blocked",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
  taskToEdit?: ITaskItem | null;
}

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
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                statusKey === "in-progress"
                  ? "bg-orange-500"
                  : statusKey === "planned"
                  ? "bg-blue-500"
                  : statusKey === "blocked"
                  ? "bg-red-500"
                  : "bg-emerald-500"
              }`}
            />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  taskToEdit,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("planned");
  const [hours, setHours] = useState<number | string>("");
  const [minutes, setMinutes] = useState<number | string>("");
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const isSubmitting = isCreating || isUpdating || isProcessing;
  const isEditMode = Boolean(taskToEdit);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setStatus(taskToEdit.status || "planned");
      setHours("");
      setMinutes("");
      setErrors({});
    } else {
      setTitle("");
      setDescription("");
      setStatus("planned");
      setHours("");
      setMinutes("");
      setErrors({});
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; time?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Task title is required.";
    }

    const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0);

    if (!isEditMode && totalMinutes <= 0) {
      newErrors.time = "Please enter estimated time.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsProcessing(true);
      if (isEditMode && taskToEdit) {
        await updateTask({
          id: taskToEdit.id,
          body: {
            title: title.trim(),
            description: description.trim(),
            status,
            date: taskToEdit.date || todayStr,
          },
        }).unwrap();
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim(),
          status,
          estimatedMinutes: totalMinutes,
          date: todayStr,
        }).unwrap();
      }

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-99999">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          {isEditMode ? "Edit Task" : "Add Today's Task"}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {/* Title Input */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="What task are you working on today?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={`w-full text-xs px-3.5 py-2.5 border rounded-xl outline-none transition text-gray-800 ${
                errors.title
                  ? "border-red-400 focus:border-red-500 bg-red-50/20"
                  : "border-gray-200 focus:border-orange-500"
              }`}
            />
            {errors.title && (
              <span className="text-[11px] text-red-500 font-medium mt-1 block">
                {errors.title}
              </span>
            )}
          </div>

          {/* Description Textarea */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Description
            </label>
            <textarea
              rows={6}
              placeholder="Add key objectives, links, or task notes...    (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[85px] text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition resize-y leading-relaxed text-gray-800 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            />
          </div>

          {/* Status Select (Segmented Pills) */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <ModalStatusSelect value={status} onChange={setStatus} />
          </div>

          {/* Estimated Time */}
          {!isEditMode && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mt-4">
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
                    className={`w-full text-xs px-3.5 py-2.5 pr-10 border rounded-xl outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      errors.time
                        ? "border-red-400 focus:border-red-500 bg-red-50/20"
                        : "border-gray-200 focus:border-orange-500"
                    }`}
                  />
                  <span className="absolute right-3.5 text-xs text-gray-400 pointer-events-none">
                    hrs
                  </span>
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
                    className={`w-full text-xs px-3.5 py-2.5 pr-10 border rounded-xl outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      errors.time
                        ? "border-red-400 focus:border-red-500 bg-red-50/20"
                        : "border-gray-200 focus:border-orange-500"
                    }`}
                  />
                  <span className="absolute right-3.5 text-xs text-gray-400 pointer-events-none">
                    mins
                  </span>
                </div>
              </div>
              {errors.time && (
                <span className="text-[11px] text-red-500 font-medium mt-1 block">
                  {errors.time}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-5">
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
              className="min-w-[100px] h-[38px] flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold shadow-xs hover:opacity-95 transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <CircularProgress size={16} sx={{ color: "#ffffff" }} />
              ) : isEditMode ? (
                "Update Task"
              ) : (
                "Save Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};