import React, { useState, useRef, useEffect } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeConfig = STATUS_CONFIG[value] || STATUS_CONFIG.planned;

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

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white outline-none focus:border-orange-500 transition cursor-pointer"
      >
        <span
          className={`px-2 py-0.5 rounded-md font-semibold ${activeConfig.bg} ${activeConfig.text}`}
        >
          {activeConfig.label}
        </span>
        <KeyboardArrowDown
          sx={{
            fontSize: 16,
            color: "#9ca3af",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease-in-out",
          }}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 rounded-xl bg-white border border-gray-100 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((statusKey) => {
            const config = STATUS_CONFIG[statusKey];
            const isSelected = statusKey === value;

            return (
              <button
                key={statusKey}
                type="button"
                onClick={() => {
                  onChange(statusKey);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition cursor-pointer ${
                  isSelected
                    ? "bg-orange-50/60 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded-md font-medium ${config.bg} ${config.text}`}
                >
                  {config.label}
                </span>
                {isSelected && (
                  <span className="text-orange-500 text-xs font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
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

  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("planned");
  const [hours, setHours] = useState<number | string>("");
  const [minutes, setMinutes] = useState<number | string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const isSubmitting = isCreating || isUpdating || isProcessing;
  const isEditMode = Boolean(taskToEdit);

  useEffect(() => {
    if (taskToEdit) {
      setDescription(taskToEdit.description || "");
      setStatus(taskToEdit.status || "planned");

      const totalMins = taskToEdit.estimatedMinutes || 0;
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;

      setHours(h > 0 ? h : "");
      setMinutes(m > 0 ? m : "");
    } else {
      setDescription("");
      setStatus("planned");
      setHours("");
      setMinutes("");
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0);

    try {
      setIsProcessing(true);
      if (isEditMode && taskToEdit) {
        await updateTask({
          id: taskToEdit.id,
          body: {
            description: description.trim(),
            status,
            estimatedMinutes: totalMinutes,
            date: taskToEdit.date || todayStr,
          },
        }).unwrap();
      } else {
        await createTask({
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Description *
            </label>
            <textarea
              rows={5}
              required
              placeholder="What are you working on today?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[130px] text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition resize-y leading-relaxed text-gray-800 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Status
            </label>
            <ModalStatusSelect value={status} onChange={setStatus} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Estimated Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl outline-none focus:border-orange-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3.5 text-xs text-gray-400 pointer-events-none">
                  mins
                </span>
              </div>
            </div>
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