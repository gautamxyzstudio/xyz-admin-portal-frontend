import { formatTaskCardTimestamp } from "../../../utils/istDateUtils";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CircularProgress } from "@mui/material";
import {
  Search,
  Plus,
  Clock,
  Paperclip,
  MessageSquare,
} from "lucide-react";
import type { IProjectTaskItem, TaskStatus } from "../taskApi";
import type { IUploadedAttachment } from "../utils/taskAttachmentUtils";

export interface ProjectKanbanBoardProps {
  isLoading: boolean;
  projectName: string;
  searchTerm: string;
  filteredTasks: IProjectTaskItem[];
  setSearchTerm: (term: string) => void;
  columnData: Array<{
    id: TaskStatus;
    label: string;
    dotColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    count: number;
    totalTimeFormatted: string;
    tasks: IProjectTaskItem[];
  }>;
  dragCounterMap: React.MutableRefObject<Record<string, number>>;
  dragOverCol: TaskStatus | null;
  setDragOverCol: (col: TaskStatus | null) => void;
  draggedTaskIdRef: React.MutableRefObject<number | null>;
  handleUpdateStatus: (taskId: number, newStatus: TaskStatus) => void;
  handleOpenAddModal: (status: TaskStatus) => void;
  handleOpenEditModal: (task: IProjectTaskItem) => void;
  getImageUrl: (url?: string | null) => string;
  extractTaskAttachments: (attachments: any) => IUploadedAttachment[];
  formatTaskTimestamp: (
    task: IProjectTaskItem,
  ) => { icon: string; text: string } | null;
  renderPriorityIndicator: (priority?: string) => React.ReactNode;
  formatTime: (minutes?: number) => string;
  getAvatarBg: (name: string) => string;
  getInitials: (name: string) => string;
}

const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
  isLoading,
  projectName,
  searchTerm,
  filteredTasks,
  setSearchTerm,
  columnData,
  dragCounterMap,
  dragOverCol,
  setDragOverCol,
  draggedTaskIdRef,
  handleUpdateStatus,
  handleOpenAddModal,
  handleOpenEditModal,
  getImageUrl,
  extractTaskAttachments,
  formatTaskTimestamp,
  renderPriorityIndicator,
  formatTime,
  getAvatarBg,
  getInitials,
}) => {
  return (
    <div className="flex-1 w-full overflow-x-auto pb-4 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden kanban-board-scroll">
      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center py-28 gap-3">
          <CircularProgress size={36} sx={{ color: "#f17c04" }} />
          <p className="text-xs text-slate-500 font-medium">
            Loading {projectName} tasks...
          </p>
        </div>
      ) : searchTerm.trim() && filteredTasks.length === 0 ? (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-primary mb-3 shadow-2xs">
            <Search size={24} className="stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No tasks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
            We couldn't find any tasks matching "{searchTerm}".
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3.5 w-full min-w-[1020px] min-h-[calc(100vh-210px)] min-h-[640px]">
          {columnData.map((col) => (
            <div
              key={col.id}
              onDragEnter={(e) => {
                e.preventDefault();
                dragCounterMap.current[col.id] =
                  (dragCounterMap.current[col.id] || 0) + 1;
                if (dragOverCol !== col.id) {
                  setDragOverCol(col.id);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "move";
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                dragCounterMap.current[col.id] = Math.max(
                  0,
                  (dragCounterMap.current[col.id] || 1) - 1,
                );
                if (dragCounterMap.current[col.id] === 0) {
                  if (dragOverCol === col.id) {
                    setDragOverCol(null);
                  }
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dragCounterMap.current = {};
                setDragOverCol(null);
                const dataId = Number(e.dataTransfer.getData("text/plain"));
                const taskId = dataId || draggedTaskIdRef.current;
                if (taskId) {
                  handleUpdateStatus(taskId, col.id);
                }
                draggedTaskIdRef.current = null;
              }}
              className={`bg-[#f4f5f7] border rounded-2xl p-3 flex flex-col w-full min-w-[240px] min-h-[calc(100vh-220px)] min-h-[640px] transition-all ${
                dragOverCol === col.id
                  ? "border-primary/50 ring-2 ring-primary/20 bg-orange-50/20"
                  : "border-slate-200/70"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 px-1 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`}
                  />
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
              <div
                className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden kanban-column-scroll"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dragCounterMap.current = {};
                  setDragOverCol(null);
                  const dataId = Number(e.dataTransfer.getData("text/plain"));
                  const taskId = dataId || draggedTaskIdRef.current;
                  if (taskId) {
                    handleUpdateStatus(taskId, col.id);
                  }
                  draggedTaskIdRef.current = null;
                }}
              >
                {col.tasks.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center pt-8 pb-4 gap-3 w-full"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dragCounterMap.current = {};
                      setDragOverCol(null);
                      const dataId = Number(
                        e.dataTransfer.getData("text/plain"),
                      );
                      const taskId = dataId || draggedTaskIdRef.current;
                      if (taskId) {
                        handleUpdateStatus(taskId, col.id);
                      }
                      draggedTaskIdRef.current = null;
                    }}
                  >
                    <p className="text-xs text-slate-400 font-medium pointer-events-none">
                      {searchTerm.trim() ? "No matching tasks" : "No tasks here"}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(col.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dragCounterMap.current = {};
                        setDragOverCol(null);
                        const dataId = Number(
                          e.dataTransfer.getData("text/plain"),
                        );
                        const taskId = dataId || draggedTaskIdRef.current;
                        if (taskId) {
                          handleUpdateStatus(taskId, col.id);
                        }
                        draggedTaskIdRef.current = null;
                      }}
                      className="w-full py-2.5 px-3 rounded-2xl bg-[#ebedf0] text-slate-700 border border-transparent hover:border-dashed hover:border-[#ff7300] hover:text-[#ff7300] hover:bg-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                      <span>Add task</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {col.tasks.map((task) => {
                      const assigneeName =
                        task.assigned_to?.username ||
                        task.Task_assigned_to ||
                        "Unassigned";
                      const photoSrc = task.assigned_to?.photo
                        ? getImageUrl(task.assigned_to.photo)
                        : null;
                      const taskKey =
                        task.taskId || (task.id ? `TSK-${task.id}` : "");
                      const commentsCount = Array.isArray(task.taskComments)
                        ? task.taskComments.length
                        : Array.isArray(task.task_comments)
                          ? task.task_comments.length
                          : Array.isArray(task.comments)
                            ? task.comments.length
                            : 0;
                      const taskAttachments = extractTaskAttachments(
                        task.attachments,
                      );
                      const taskTag =
                        task.project?.title || projectName || "General";
                      const timestampInfo = formatTaskTimestamp ? formatTaskTimestamp(task) : formatTaskCardTimestamp(task, formatTime);

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            draggedTaskIdRef.current = task.id;
                            e.dataTransfer.setData(
                              "text/plain",
                              String(task.id),
                            );
                            e.dataTransfer.effectAllowed = "move";
                            if (e.currentTarget) {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              e.dataTransfer.setDragImage(
                                e.currentTarget,
                                Math.min(
                                  Math.max(10, e.clientX - rect.left),
                                  rect.width / 2,
                                ),
                                Math.min(
                                  Math.max(10, e.clientY - rect.top),
                                  30,
                                ),
                              );
                            }
                          }}
                          onDragEnd={() => {
                            draggedTaskIdRef.current = null;
                            setDragOverCol(null);
                            dragCounterMap.current = {};
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dragCounterMap.current = {};
                            setDragOverCol(null);
                            const dataId = Number(
                              e.dataTransfer.getData("text/plain"),
                            );
                            const taskId = dataId || draggedTaskIdRef.current;
                            if (taskId && taskId !== task.id) {
                              handleUpdateStatus(taskId, col.id);
                            }
                            draggedTaskIdRef.current = null;
                          }}
                          onClick={() => handleOpenEditModal(task)}
                          className="group bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col gap-2 cursor-pointer active:opacity-75 w-full min-w-0 max-w-full select-none"
                        >
                          {/* Cover image thumbnail if attachments exist */}
                          {taskAttachments.length > 0 &&
                            (taskAttachments[0].url ||
                              taskAttachments[0].previewUrl) && (
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

                            {/* Simple Status Badge (No Dropdown) */}
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${col.badgeBg} ${col.badgeText} border ${col.badgeBorder} shrink-0`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${col.dotColor} ${
                                  col.id === "in-progress"
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              />
                              <span>{col.label}</span>
                            </span>
                          </div>

                          {/* Footer Row: Priority, Task Key, Estimate, Attachments & Comments */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 mt-0.5">
                            <div className="flex items-center gap-1 text-slate-500 min-w-0">
                              {renderPriorityIndicator(task.priority)}
                              <span className="text-[11px] font-semibold tracking-tight text-slate-600">
                                {taskKey}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 font-medium ml-1">
                                <Clock size={10} className="text-slate-400" />
                                <span>
                                  {formatTime(task.estimatedMinutes)}
                                </span>
                              </span>

                              {/* Attachments indicator - always show even if 0 */}
                              <span
                                className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 font-medium ml-1"
                                title={`${taskAttachments.length} attachment(s)`}
                              >
                                <Paperclip
                                  size={11}
                                  className="text-slate-400"
                                />
                                <span>{taskAttachments.length}</span>
                              </span>

                              {/* Comments indicator - always show even if 0 */}
                              <span
                                className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 font-medium ml-1"
                                title={`${commentsCount} comment(s)`}
                              >
                                <MessageSquare
                                  size={11}
                                  className="text-slate-400"
                                />
                                <span>{commentsCount}</span>
                              </span>
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
                                    backgroundColor:
                                      getAvatarBg(assigneeName),
                                  }}
                                >
                                  {getInitials(assigneeName)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Created / Completed timestamp line */}
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
                              <span className="truncate">
                                {timestampInfo.text}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add Task Button directly below cards */}
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(col.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dragCounterMap.current = {};
                        setDragOverCol(null);
                        const dataId = Number(
                          e.dataTransfer.getData("text/plain"),
                        );
                        const taskId = dataId || draggedTaskIdRef.current;
                        if (taskId) {
                          handleUpdateStatus(taskId, col.id);
                        }
                        draggedTaskIdRef.current = null;
                      }}
                      className="w-full py-2.5 px-3 rounded-2xl bg-[#ebedf0] text-slate-700 border border-transparent hover:border-dashed hover:border-[#ff7300] hover:text-[#ff7300] hover:bg-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                      <span>Add task</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectKanbanBoard;
