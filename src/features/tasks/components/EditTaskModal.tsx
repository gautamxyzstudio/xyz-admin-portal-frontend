/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState, useMemo } from "react";
import TaskOvertimeSection from "./TaskOvertimeSection";
import TaskManualTimeSection from "./TaskManualTimeSection";
import TaskDueDatePicker from "./TaskDueDatePicker";
import RichTextEditor from "../../../components/RichTextEditor/RichTextEditor";
import ModalSizeButton from "../../../components/ModalSizeButton/ModalSizeButton";
import { useTaskModalSize } from "../../../shared/hooks/useTaskModalSize";
import ThemedDropdown from "../../../components/ThemedDropdown";
import {
  Link2,
  FileText,
  FileSpreadsheet,
  File as FileIcon,
  Image as ImageIcon,
  Download,
  ExternalLink,
  UploadCloud,
} from "lucide-react";
import {
  getAttachmentKind,
  formatFileSize,
} from "../utils/taskAttachmentUtils";

/* ---------- comment helpers: links + file icons ---------- */
// [label](https://url)  OR  bare https://url / www.url
const COMMENT_LINK_RE =
  /\[([^\]\n]{1,120})\]\((https?:\/\/[^\s)]+)\)|((?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,;:!?)\]])/gi;

const normalizeUrl = (raw: string): string | null => {
  let v = raw.trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
};

const prettyUrl = (url: string) => {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" ? "" : u.pathname;
    const out = u.hostname.replace(/^www\./, "") + path;
    return out.length > 48 ? out.slice(0, 45) + "…" : out;
  } catch {
    return url;
  }
};

const AttachmentKindIcon = ({ name, mime, size = 16 }: { name?: string; mime?: string; size?: number }) => {
  const kind = getAttachmentKind({ name, mime });
  if (kind === "image") return <ImageIcon size={size} className="text-sky-500" />;
  if (kind === "pdf") return <FileText size={size} className="text-red-500" />;
  if (kind === "word") return <FileText size={size} className="text-blue-600" />;
  if (kind === "excel") return <FileSpreadsheet size={size} className="text-emerald-600" />;
  return <FileIcon size={size} className="text-slate-500" />;
};

const PriorityLabel = ({ color, text }: { color: string; text: string }) => (
  <span className="inline-flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${color}`} />
    <span className="font-medium">{text}</span>
  </span>
);

interface Props { [key: string]: any }
const EditTaskModal: React.FC<Props> = (props) => {
  const modalSize = useTaskModalSize();
  const { isEditMgmtAssignee, isEditUnassigned, setIsEditUnassigned, Check, ChevronDown, CircularProgress, Paperclip, STATUS_OPTIONS, Search, TaskAttachmentUpload, X, activityTab, commentAttachments, commentComposerRef, commentFileInputRef, completeHistory, currentUserName, currentUserPhoto, editAssigneeSearchQuery, editAttachments, editEstimatedHours, editEstimatedMinutes, editFilteredProjectEmployees, editSelectedEmployeeObj, editTaskForm, extractEmployeePhotoUrl, formatHistoryTime, getAvatarBg, getImageUrl, getInitials, handleAddComment, handleDeleteTask, isDeleting, mentionableUsers = [], handleUpdateTaskSubmit, handleUploadCommentPhotos, commentUploadingCount = 0, isAdmin, isCommentExpanded, isCommentsLoading, isEditAssigneeDropdownOpen, isEditUploadingAttachments, isPostingComment, isProjectsLoading, isUpdating, isUploadingCommentPhoto, newCommentText, projectAssignedEmployees, selectedTask, setActivityTab, setCommentAttachments, setEditAssigneeSearchQuery, setEditAttachments, setEditEstimatedHours, setEditEstimatedMinutes, setEditTaskForm, setIsCommentFocused, setIsEditAssigneeDropdownOpen, setIsEditUploadingAttachments, setNewCommentText, setSelectedTask, setViewAttachmentPreview, taskCommentsList } = props;
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const prevCommentsCountRef = useRef<number>(taskCommentsList?.length || 0);
  const prevTaskIdRef = useRef<any>(selectedTask?.id);

  /* ---------------- Delete (Admin / HR / Management) ---------------- */
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    setConfirmDelete(false);
  }, [selectedTask?.id]);

  /* ---------------- @mentions ---------------- */
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [pickedMentions, setPickedMentions] = useState<{ id: number; name: string }[]>([]);

  const mentionMatches = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return (mentionableUsers as any[])
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.username || "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [mentionQuery, mentionableUsers]);

  const detectMention = (value: string, caret: number) => {
    const before = value.slice(0, caret);
    const match = before.match(/(^|\s)@([^\s@]*)$/);
    if (match) {
      setMentionQuery(match[2]);
      setMentionStart(caret - match[2].length - 1);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (user: { id: number; name: string }) => {
    const el = commentInputRef.current;
    const caret = el?.selectionStart ?? newCommentText.length;
    const next =
      newCommentText.slice(0, mentionStart) +
      `@${user.name} ` +
      newCommentText.slice(caret);
    setNewCommentText(next);
    setPickedMentions((prev) =>
      prev.some((m) => m.id === user.id) ? prev : [...prev, user],
    );
    setMentionQuery(null);
    const pos = mentionStart + user.name.length + 2;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  };

  // Highlight @Name of any project member inside a posted comment
  const mentionNames = useMemo(
    () =>
      Array.from(
        new Set(
          (mentionableUsers as any[])
            .map((u) => u.name)
            .concat(currentUserName ? [currentUserName] : [])
            .filter(Boolean),
        ),
      ).sort((a: any, b: any) => b.length - a.length) as string[],
    [mentionableUsers, currentUserName],
  );

  const renderMentions = (text: string, keyPrefix: string) => {
    if (!text || !text.includes("@") || mentionNames.length === 0)
      return [<React.Fragment key={keyPrefix}>{text}</React.Fragment>];
    const escaped = mentionNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`(@(?:${escaped.join("|")}))`, "g");
    return text.split(re).map((part, i) =>
      i % 2 === 1 ? (
        <span key={`${keyPrefix}-${i}`} className="text-primary font-semibold bg-primary-20 px-1 rounded">
          {part}
        </span>
      ) : (
        <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>
      ),
    );
  };

  // Clickable links ([label](url) or bare urls) + @mention highlight
  const renderCommentText = (text: string) => {
    if (!text) return text;
    const out: React.ReactNode[] = [];
    let last = 0;
    let idx = 0;
    const linkRe = new RegExp(COMMENT_LINK_RE.source, "gi");
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(text)) !== null) {
      if (m.index > last) out.push(...renderMentions(text.slice(last, m.index), `t${idx}`));
      const label = m[1];
      const href = normalizeUrl(m[2] || m[3] || "");
      if (href) {
        out.push(
          <a
            key={`l${idx}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={href}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 max-w-full align-baseline px-1.5 py-px rounded-md bg-orange-50 text-[#e06600] hover:bg-orange-100 hover:underline font-medium break-all"
          >
            <Link2 size={11} className="shrink-0" />
            <span className="truncate">{label || prettyUrl(href)}</span>
          </a>,
        );
      } else {
        out.push(<React.Fragment key={`r${idx}`}>{m[0]}</React.Fragment>);
      }
      last = m.index + m[0].length;
      idx += 1;
    }
    if (last < text.length) out.push(...renderMentions(text.slice(last), `t${idx}`));
    return out;
  };

  /* ---------------- links / files in the composer ---------------- */
  const commentDocInputRef = useRef<HTMLInputElement | null>(null);
  const linkUrlInputRef = useRef<HTMLInputElement | null>(null);
  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isComposerDragOver, setIsComposerDragOver] = useState(false);

  const resetLinkForm = () => {
    setIsLinkFormOpen(false);
    setLinkUrl("");
    setLinkLabel("");
    setLinkError("");
  };

  const insertLink = () => {
    const href = normalizeUrl(linkUrl);
    if (!href) {
      setLinkError("Enter a valid link, e.g. https://example.com");
      return;
    }
    const label = linkLabel.trim().replace(/[[\]]/g, "");
    const token = label ? `[${label}](${href})` : href;
    const el = commentInputRef.current;
    const caret = el?.selectionStart ?? newCommentText.length;
    const before = newCommentText.slice(0, caret);
    const after = newCommentText.slice(caret);
    const pre = before && !/\s$/.test(before) ? " " : "";
    const post = after && !/^\s/.test(after) ? " " : "";
    setNewCommentText(before + pre + token + post + after);
    setIsCommentFocused(true);
    resetLinkForm();
    requestAnimationFrame(() => commentInputRef.current?.focus());
  };

  const commentLinksPreview = useMemo(() => {
    const found: { href: string; label?: string }[] = [];
    if (!newCommentText) return found;
    const linkRe = new RegExp(COMMENT_LINK_RE.source, "gi");
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(newCommentText)) !== null) {
      const href = normalizeUrl(m[2] || m[3] || "");
      if (href && !found.some((f) => f.href === href)) found.push({ href, label: m[1] });
    }
    return found;
  }, [newCommentText]);

  // comments are listed newest-first, so "latest" is at the top of the list
  const scrollToBottom = (smooth = true) => {
    commentsContainerRef.current?.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Auto-scroll when new comments are added so the latest comment is always visible
  useEffect(() => {
    const currentCount = taskCommentsList?.length || 0;
    if (currentCount > prevCommentsCountRef.current) {
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 80);
      return () => clearTimeout(timer);
    }
    prevCommentsCountRef.current = currentCount;
  }, [taskCommentsList?.length]);

  // Auto-scroll to bottom on task select or when switching to comments tab
  useEffect(() => {
    if (selectedTask?.id !== prevTaskIdRef.current) {
      prevTaskIdRef.current = selectedTask?.id;
      prevCommentsCountRef.current = taskCommentsList?.length || 0;
    }
    if (activityTab === "comments" && (taskCommentsList?.length || 0) > 0) {
      const timer = setTimeout(() => {
        scrollToBottom(false);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [selectedTask?.id, activityTab]);

  const handleSubmitComment = async () => {
    const mentionIds = pickedMentions
      .filter((m) => newCommentText.includes(`@${m.name}`))
      .map((m) => m.id);
    await handleAddComment(mentionIds);
    setPickedMentions([]);
    setMentionQuery(null);
    setTimeout(() => scrollToBottom(true), 150);
    setTimeout(() => scrollToBottom(true), 400);
  };
  return (
    <>
{/* Modal: Edit Task (Does not close on outside click) */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-99 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150 ${modalSize.panelClass}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Edit Task
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {selectedTask.taskId || `#${selectedTask.id}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ModalSizeButton isFull={modalSize.isFull} onClick={modalSize.toggle} />
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateTaskSubmit} className="space-y-4 mt-4">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTaskForm.title}
                  onChange={(e) =>
                    setEditTaskForm({ ...editTaskForm, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white transition-all shadow-2xs"
                  placeholder="Task title..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Description
                </label>
                <RichTextEditor
                  value={editTaskForm.description}
                  onChange={(html) => setEditTaskForm((f: any) => ({ ...f, description: html }))}
                  placeholder="Task details and notes…"
                  minHeight={modalSize.isFull ? 280 : 170}
                  disabled={isUpdating}
                />
              </div>

              {/* Attachments */}
              <div>
                <TaskAttachmentUpload
                  attachments={editAttachments}
                  onChange={setEditAttachments}
                  onUploadingChange={setIsEditUploadingAttachments}
                  disabled={isUpdating}
                />
              </div>

              {/* Status Segmented Pills */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map((opt: any) => {
                    const isSelected = editTaskForm.status === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setEditTaskForm({ ...editTaskForm, status: opt.id })
                        }
                        className={`w-full py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${isSelected
                            ? `${opt.activeBg} ${opt.activeBorder} ${opt.activeText} font-semibold shadow-2xs ring-1 ${opt.activeBorder}`
                            : "bg-[#fafafa] border-slate-200/90 text-slate-700 font-medium hover:bg-slate-100/70"
                          }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`}
                        />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assignee & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {isAdmin ? (
                      <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                        Assignee <span className="text-rose-500">*</span>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-800">
                          Assignee {!isEditUnassigned && <span className="text-rose-500">*</span>}
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(isEditUnassigned)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setIsEditUnassigned?.(checked);
                              if (checked) {
                                setEditTaskForm({ ...editTaskForm, assignedTo: "" });
                                setIsEditAssigneeDropdownOpen(false);
                                setEditAssigneeSearchQuery("");
                              }
                            }}
                            className="checkbox checkbox-xs rounded border-slate-300 text-primary focus:ring-0 cursor-pointer accent-orange-500"
                          />
                          <span className="text-[11px] font-medium text-slate-600 hover:text-slate-800 transition-colors">
                            Don't assign
                          </span>
                        </label>
                      </div>
                    )}
                    <div className="relative">
                      <button
                        type="button"
                        disabled={!isAdmin && Boolean(isEditUnassigned)}
                        onClick={() => {
                          if (!isAdmin && isEditUnassigned) return;
                          setIsEditAssigneeDropdownOpen(!isEditAssigneeDropdownOpen);
                        }}
                        className={`w-full h-[46px] px-3.5 border rounded-2xl text-xs text-left outline-none transition-all shadow-2xs flex items-center justify-between gap-2 ${
                          !isAdmin && isEditUnassigned
                            ? "bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-75"
                            : isEditAssigneeDropdownOpen
                              ? "border-primary bg-white ring-2 ring-orange-500/10 cursor-pointer"
                              : "bg-[#fafafa] border-slate-200/90 hover:border-slate-300 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {!isAdmin && isEditUnassigned ? (
                            <span className="text-slate-400 italic">Unassigned</span>
                          ) : editSelectedEmployeeObj ? (
                            <>
                              {(() => {
                                const photoUrl = extractEmployeePhotoUrl(
                                  editSelectedEmployeeObj,
                                );
                                const displayName =
                                  editSelectedEmployeeObj.name ||
                                  editSelectedEmployeeObj.username ||
                                  "Employee";
                                if (photoUrl) {
                                  return (
                                    <img
                                      src={photoUrl}
                                      alt=""
                                      className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.display =
                                          "none";
                                      }}
                                    />
                                  );
                                }
                                return (
                                  <div
                                    className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[9px] shrink-0"
                                    style={{
                                      backgroundColor: getAvatarBg(displayName),
                                    }}
                                  >
                                    {getInitials(displayName)}
                                  </div>
                                );
                              })()}
                              <span className="truncate text-slate-800 font-medium">
                                {editSelectedEmployeeObj.name ||
                                  editSelectedEmployeeObj.username}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-400">Select Assignee</span>
                          )}
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isEditAssigneeDropdownOpen ? "rotate-180 text-primary" : ""} ${!isAdmin && isEditUnassigned ? "opacity-30" : ""}
                            }`}
                        />
                      </button>

                      {/* Popover Dropdown */}
                      {isEditAssigneeDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsEditAssigneeDropdownOpen(false)}
                          />
                          <div className="absolute top-full mt-1.5 left-0 w-full z-50 tdd-pop !rounded-2xl overflow-hidden py-1">
                            {projectAssignedEmployees.length > 5 && (
                              <div className="p-2 border-b border-slate-100">
                                <div className="tdd-search !m-0">
                                  <Search size={13} className="text-slate-400 shrink-0" />
                                  <input
                                    type="text"
                                    placeholder="Search project member..."
                                    value={editAssigneeSearchQuery}
                                    onChange={(e) =>
                                      setEditAssigneeSearchQuery(e.target.value)
                                    }
                                    className="w-full text-xs bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                  />
                                </div>
                              </div>
                            )}

                            <div className="max-h-52 overflow-y-auto scrollbar-hide py-1">
                              {isProjectsLoading ? (
                                <div className="px-3.5 py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                  <CircularProgress size={14} className="text-primary" />
                                  <span>Loading project members...</span>
                                </div>
                              ) : editFilteredProjectEmployees.length === 0 ? (
                                <div className="px-3.5 py-3 text-center text-xs text-slate-400">
                                  {editAssigneeSearchQuery.trim()
                                    ? "No employees found"
                                    : "No employees available"}
                                </div>
                              ) : (
                                editFilteredProjectEmployees.map((emp: any) => {
                                  const isSelected =
                                    String(editTaskForm.assignedTo) === String(emp.id);
                                  const photoUrl = extractEmployeePhotoUrl(emp);
                                  const displayName =
                                    emp.name || emp.username || "Employee";

                                  return (
                                    <div
                                      key={emp.id}
                                      onClick={() => {
                                        setEditTaskForm({
                                          ...editTaskForm,
                                          assignedTo: emp.id,
                                        });
                                        setIsEditUnassigned?.(false);
                                        setIsEditAssigneeDropdownOpen(false);
                                        setEditAssigneeSearchQuery("");
                                      }}
                                      className={`tdd-item px-3 py-2 text-xs cursor-pointer flex items-center justify-between gap-2 ${isSelected ? "tdd-selected" : "text-slate-700"}`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        {photoUrl ? (
                                          <img
                                            src={photoUrl}
                                            alt=""
                                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                                            onError={(e) => {
                                              (e.currentTarget as HTMLElement).style.display =
                                                "none";
                                            }}
                                          />
                                        ) : (
                                          <div
                                            className="w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[9px] shrink-0"
                                            style={{
                                              backgroundColor: getAvatarBg(displayName),
                                            }}
                                          >
                                            {getInitials(displayName)}
                                          </div>
                                        )}
                                        <div className="truncate text-left">
                                          <div className="truncate font-medium">
                                            {displayName}
                                          </div>
                                          {emp.email && (
                                            <div className="text-[10px] text-slate-400 truncate">
                                              {emp.email}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <Check size={14} className="text-primary shrink-0" />
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                      Priority
                    </label>
                    <ThemedDropdown<"low" | "medium" | "high">
                      value={editTaskForm.priority as "low" | "medium" | "high"}
                      onChange={(priority) =>
                        setEditTaskForm({ ...editTaskForm, priority: priority as any })
                      }
                      variant="field"
                      ariaLabel="Priority"
                      options={[
                        { value: "low", label: <PriorityLabel color="bg-blue-500" text="Low" />, searchText: "low" },
                        { value: "medium", label: <PriorityLabel color="bg-amber-500" text="Medium" />, searchText: "medium" },
                        { value: "high", label: <PriorityLabel color="bg-rose-500" text="High" />, searchText: "high" },
                      ]}
                    />
                  </div>
                </div>

              {/* Assigned by (task creator) */}
              {(selectedTask?.task_created_by_name || selectedTask?.task_created_by) && (() => {
                const by = selectedTask.task_created_by_name || selectedTask.task_created_by;
                const on = selectedTask.createdAt
                  ? new Date(selectedTask.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      timeZone: "Asia/Kolkata",
                    })
                  : null;
                return (
                  <div className="flex items-center gap-2 text-xs text-slate-500 -mt-1">
                    <span>Assigned by</span>
                    <span
                      className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: getAvatarBg(by) }}
                    >
                      {getInitials(by)}
                    </span>
                    <span className="font-semibold text-slate-800">{by}</span>
                    {on && <span className="text-slate-400">· {on}</span>}
                  </div>
                );
              })()}

              {/* Estimated Time */}
              {isEditMgmtAssignee ? (
                <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5">
                  Management task — no estimate or timer. Add time spent manually below.
                </p>
              ) : (
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Estimated Time <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="1"
                      value={editEstimatedHours}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        setEditEstimatedHours(clean.slice(0, 2));
                      }}
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
                      value={editEstimatedMinutes}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        if (!clean) {
                          setEditEstimatedMinutes("");
                        } else if (Number(clean) > 59) {
                          setEditEstimatedMinutes("59");
                        } else {
                          setEditEstimatedMinutes(clean.slice(0, 2));
                        }
                      }}
                      className="w-full text-xs px-4 py-3 pr-10 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-slate-800 outline-none focus:border-primary focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all shadow-2xs"
                    />
                    <span className="absolute right-4 text-xs text-slate-400 pointer-events-none select-none">
                      mins
                    </span>
                  </div>
                </div>
              </div>
              )}

              {/* Due Date (Optional) */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Due Date <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                </label>
                <TaskDueDatePicker
                  value={editTaskForm.dueDate || ""}
                  onChange={(dateStr) =>
                    setEditTaskForm({
                      ...editTaskForm,
                      dueDate: dateStr,
                    })
                  }
                  disabled={isUpdating}
                />
              </div>

              {/* Manual time — shows only when the assignee is Management / HR */}
              <TaskManualTimeSection taskId={selectedTask?.id} />

              {/* Overtime Section (not shown for Management tasks – no time tracking) */}
              {!isEditMgmtAssignee && (
                <TaskOvertimeSection
                  taskId={selectedTask?.id}
                  selectedTask={selectedTask}
                  currentStatus={editTaskForm.status}
                />
              )}

              {/* Activity Section (Comments / History) */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800">Activity</h4>
                  <div className="inline-flex items-center p-0.5 rounded-2xl border border-slate-200/80 bg-white">
                    <button
                      type="button"
                      onClick={() => setActivityTab("comments")}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activityTab === "comments"
                          ? "bg-white text-slate-800 shadow-2xs"
                          : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      <span>Comments</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                          activityTab === "comments"
                            ? "bg-white text-[#ff7300] shadow-2xs border border-orange-100"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {taskCommentsList.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityTab("history")}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activityTab === "history"
                          ? "bg-white text-orange-600 shadow-2xs"
                          : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      History
                    </button>
                  </div>
                </div>

                {activityTab === "history" ? (
                  <div className="max-h-60 overflow-y-auto scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 py-1">
                      {completeHistory.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2">
                          No history recorded yet.
                        </p>
                      ) : (
                        completeHistory.map((item: any) => (
                          <div key={item.id} className="relative flex flex-col">
                            <span
                              className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${item.dotColor} ring-4 ring-white`}
                            />
                            <span className="text-xs text-slate-800">
                              <strong className="font-semibold text-slate-900">
                                {item.user}
                              </strong>{" "}
                              {item.action}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5">
                              {formatHistoryTime(item.timestamp)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Add comment box matching target mockup */}
                    <div
                      ref={commentComposerRef}
                      className="flex items-start gap-3"
                      onDragOver={(e) => {
                        if (e.dataTransfer?.types?.includes("Files")) {
                          e.preventDefault();
                          if (!isComposerDragOver) setIsComposerDragOver(true);
                        }
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsComposerDragOver(false);
                      }}
                      onDrop={(e) => {
                        const files = e.dataTransfer?.files;
                        setIsComposerDragOver(false);
                        if (files && files.length > 0) {
                          e.preventDefault();
                          setIsCommentFocused(true);
                          handleUploadCommentPhotos(files);
                        }
                      }}
                    >
                      {currentUserPhoto ? (
                        <img
                          src={currentUserPhoto}
                          alt={currentUserName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display =
                              "none";
                            const sibling = e.currentTarget
                              .nextElementSibling as HTMLElement | null;
                            if (sibling) sibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="w-8 h-8 rounded-full items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: getAvatarBg(currentUserName),
                          display: currentUserPhoto ? "none" : "flex",
                        }}
                      >
                        {getInitials(currentUserName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="relative">
                        {isComposerDragOver && (
                          <div className="absolute inset-0 z-[90] flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#ff7300] bg-orange-50/95 text-xs font-semibold text-[#e06600] pointer-events-none">
                            <UploadCloud size={16} />
                            Drop photos or files to attach
                          </div>
                        )}
                        {mentionQuery !== null && (
                          <div className="absolute top-full left-0 mt-1.5 w-72 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] py-1">
                            <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Mention someone
                            </p>
                            {mentionMatches.length === 0 && (
                              <p className="px-3 py-2 text-xs text-slate-500">
                                {(mentionableUsers as any[]).length === 0
                                  ? "Loading people..."
                                  : `No one matches "${mentionQuery}"`}
                              </p>
                            )}
                            {mentionMatches.map((u: any, idx: number) => (
                              <button
                                key={u.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  insertMention(u);
                                }}
                                onMouseEnter={() => setMentionIndex(idx)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs cursor-pointer ${
                                  idx === mentionIndex ? "bg-primary-20 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {u.photo ? (
                                  <img src={u.photo} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                ) : (
                                  <span
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                    style={{ backgroundColor: getAvatarBg(u.name) }}
                                  >
                                    {getInitials(u.name)}
                                  </span>
                                )}
                                <span className="truncate font-medium">{u.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <textarea
                          ref={commentInputRef}
                          rows={isCommentExpanded ? 3 : 1}
                          placeholder="Add a comment… type @ to mention, paste a link, or drop files"
                          value={newCommentText}
                          onFocus={() => setIsCommentFocused(true)}
                          onClick={() => setIsCommentFocused(true)}
                          onChange={(e) => {
                            setNewCommentText(e.target.value);
                            detectMention(e.target.value, e.target.selectionStart ?? e.target.value.length);
                          }}
                          onBlur={() => setTimeout(() => setMentionQuery(null), 150)}
                          onKeyDown={(e) => {
                            if (mentionQuery !== null && mentionMatches.length > 0) {
                              if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setMentionIndex((i) => (i + 1) % mentionMatches.length);
                                return;
                              }
                              if (e.key === "ArrowUp") {
                                e.preventDefault();
                                setMentionIndex((i) => (i - 1 + mentionMatches.length) % mentionMatches.length);
                                return;
                              }
                              if (e.key === "Enter" || e.key === "Tab") {
                                e.preventDefault();
                                insertMention(mentionMatches[mentionIndex] || mentionMatches[0]);
                                return;
                              }
                              if (e.key === "Escape") {
                                e.preventDefault();
                                setMentionQuery(null);
                                return;
                              }
                            }
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                              e.preventDefault();
                              handleSubmitComment(); }
                          }}
                          onPaste={(e) => {
                            const files = e.clipboardData?.files;
                            if (files && files.length > 0) {
                              e.preventDefault();
                              handleUploadCommentPhotos(files);
                            }
                          }}
                          disabled={isPostingComment}
                          className={`w-full px-3.5 py-2.5 bg-white rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 outline-none leading-relaxed transition-all ${
                            isCommentExpanded
                              ? "border border-[#ff7300] focus:ring-2 focus:ring-[#ff7300]/20 resize-y min-h-[72px]"
                              : "border border-slate-200 hover:border-[#ff7300] resize-none min-h-[42px] cursor-text"
                          }`}
                        />
                        </div>

                        {/* Links detected in the draft */}
                        {commentLinksPreview.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {commentLinksPreview.map((l) => (
                              <a
                                key={l.href}
                                href={l.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 max-w-[260px] px-2.5 py-1 rounded-xl border border-orange-200 bg-orange-50 text-[11px] font-medium text-[#e06600] hover:bg-orange-100"
                                title={l.href}
                              >
                                <Link2 size={12} className="shrink-0" />
                                <span className="truncate">{l.label || prettyUrl(l.href)}</span>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Uploaded attachments preview for new comment */}
                        {commentAttachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {commentAttachments.map((att: any) => {
                              const isImg = getAttachmentKind(att) === "image";
                              const removeBtn = (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCommentAttachments((prev: any) =>
                                      prev.filter((a: any) => a.id !== att.id),
                                    )
                                  }
                                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                  title="Remove"
                                >
                                  <X size={11} />
                                </button>
                              );
                              return isImg ? (
                                <div
                                  key={att.id}
                                  className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0"
                                >
                                  <img
                                    src={att.previewUrl || getImageUrl(att.url)}
                                    alt={att.name}
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setViewAttachmentPreview?.({ id: att.id, name: att.name, url: att.previewUrl || att.url })}
                                    title="Click to preview"
                                  />
                                  {removeBtn}
                                </div>
                              ) : (
                                <div
                                  key={att.id}
                                  className="relative flex items-center gap-2 h-16 w-52 pl-3 pr-7 rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                                  title={att.name}
                                >
                                  <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                    <AttachmentKindIcon name={att.name} mime={att.mime} size={18} />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-[11px] font-semibold text-slate-800 truncate">{att.name}</span>
                                    <span className="block text-[10px] text-slate-400 uppercase">
                                      {(att.name?.split(".").pop() || "file")} {att.size ? `· ${formatFileSize(att.size)}` : ""}
                                    </span>
                                  </span>
                                  {removeBtn}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Uploading indicator */}
                        {isUploadingCommentPhoto && (
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-orange-600 font-medium">
                            <CircularProgress size={13} color="inherit" />
                            <span>
                              Uploading {commentUploadingCount > 1 ? `${commentUploadingCount} files` : "file"}...
                            </span>
                          </div>
                        )}

                        {/* Add-link mini form */}
                        {isCommentExpanded && isLinkFormOpen && (
                          <div className="mt-2 p-2.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                ref={linkUrlInputRef}
                                type="url"
                                value={linkUrl}
                                placeholder="Paste link — https://…"
                                onChange={(e) => {
                                  setLinkUrl(e.target.value);
                                  setLinkError("");
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") { e.preventDefault(); insertLink(); }
                                  if (e.key === "Escape") { e.preventDefault(); resetLinkForm(); }
                                }}
                                className="flex-1 min-w-0 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-[#ff7300]/20 outline-none"
                              />
                              <input
                                type="text"
                                value={linkLabel}
                                placeholder="Title (optional)"
                                onChange={(e) => setLinkLabel(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") { e.preventDefault(); insertLink(); }
                                  if (e.key === "Escape") { e.preventDefault(); resetLinkForm(); }
                                }}
                                className="sm:w-40 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-[#ff7300]/20 outline-none"
                              />
                            </div>
                            {linkError && <p className="text-[11px] text-red-500">{linkError}</p>}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={insertLink}
                                disabled={!linkUrl.trim()}
                                className="px-3 py-1.5 bg-[#ff7300] hover:bg-[#e06600] disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer"
                              >
                                Add link
                              </button>
                              <button
                                type="button"
                                onClick={resetLinkForm}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Toolbar row: Only show when clicked/active */}
                        {isCommentExpanded && (
                          <div className="flex items-center justify-between mt-2 animate-in fade-in duration-150">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleSubmitComment}
                                disabled={
                                  (!newCommentText.trim() &&
                                    commentAttachments.length === 0) ||
                                  isPostingComment ||
                                  isUploadingCommentPhoto
                                }
                                className="px-4 py-1.5 bg-[#ff7300] hover:bg-[#e06600] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                {isPostingComment ? (
                                  <CircularProgress size={13} color="inherit" />
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewCommentText("");
                                  setCommentAttachments([]);
                                  resetLinkForm();
                                  setIsCommentFocused(false);
                                }}
                                disabled={isPostingComment}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <span className="w-px h-5 bg-slate-200 mx-0.5" />
                              <button
                                type="button"
                                onClick={() => commentFileInputRef.current?.click()}
                                disabled={isPostingComment || isUploadingCommentPhoto}
                                title="Attach photos"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <ImageIcon size={13} className="text-slate-600" />
                                <span>Photo</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => commentDocInputRef.current?.click()}
                                disabled={isPostingComment || isUploadingCommentPhoto}
                                title="Attach files (PDF, Word, Excel, PPT, ZIP… up to 25 MB)"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <Paperclip size={13} className="text-slate-600 -rotate-45" />
                                <span>File</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsLinkFormOpen((v) => !v);
                                  setLinkError("");
                                  requestAnimationFrame(() => linkUrlInputRef.current?.focus());
                                }}
                                disabled={isPostingComment}
                                title="Add a link"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50 ${
                                  isLinkFormOpen ? "bg-orange-50 text-[#e06600]" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                              >
                                <Link2 size={13} />
                                <span>Link</span>
                              </button>
                              <input
                                ref={commentDocInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    handleUploadCommentPhotos(e.target.files);
                                    e.target.value = "";
                                  }
                                }}
                              />
                              <input
                                ref={commentFileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  if (
                                    e.target.files &&
                                    e.target.files.length > 0
                                  ) {
                                    handleUploadCommentPhotos(e.target.files);
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comments list */}
                    {isCommentsLoading ? (
                      <div className="flex justify-center py-4">
                        <CircularProgress
                          size={18}
                          className="text-[#ff7300]"
                        />
                      </div>
                    ) : taskCommentsList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2 text-center">
                        No comments yet.
                      </p>
                    ) : (
                      <div ref={commentsContainerRef} className="max-h-[320px] overflow-y-auto space-y-2.5 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                        {taskCommentsList.map((c: any) => (
                          <div
                            key={c.id}
                            className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {c.userLogo ? (
                                  <img
                                    src={c.userLogo}
                                    alt={c.user}
                                    className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                                  />
                                ) : (
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                    style={{ backgroundColor: getAvatarBg(c.user) }}
                                  >
                                    {getInitials(c.user)}
                                  </div>
                                )}
                                <span className="font-semibold text-slate-800 text-xs truncate">
                                  {c.user}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 shrink-0">
                                {c.time}
                              </span>
                            </div>

                            {c.text && (
                              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap break-words pl-8">
                                {renderCommentText(c.text)}
                              </p>
                            )}

                            {c.attachments && c.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100/80 pl-8">
                                {c.attachments.map((att: any) =>
                                  att.isImage ? (
                                    <button
                                      key={att.id}
                                      type="button"
                                      onClick={() =>
                                        setViewAttachmentPreview({
                                          id: att.id,
                                          name: att.name,
                                          url: att.url,
                                        })
                                      }
                                      className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-primary/50 transition-all cursor-pointer shadow-2xs shrink-0"
                                      title={att.name}
                                    >
                                      <img
                                        src={getImageUrl(att.url)}
                                        alt={att.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                    </button>
                                  ) : (
                                    <a
                                      key={att.id}
                                      href={getImageUrl(att.url)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={att.name}
                                      title={`Open ${att.name}`}
                                      className="group flex items-center gap-2 h-16 w-56 px-3 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-xs transition-all shrink-0"
                                    >
                                      <span className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                        <AttachmentKindIcon name={att.name} mime={att.mime} size={18} />
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className="block text-[11px] font-semibold text-slate-800 truncate group-hover:text-primary">
                                          {att.name}
                                        </span>
                                        <span className="block text-[10px] text-slate-400 uppercase">
                                          {(att.name?.split(".").pop() || "file")} {att.size ? `· ${formatFileSize(att.size)}` : ""}
                                        </span>
                                      </span>
                                      <span className="flex flex-col gap-1 text-slate-400 shrink-0">
                                        <ExternalLink size={12} className="group-hover:text-primary" />
                                        <Download size={12} className="group-hover:text-primary" />
                                      </span>
                                    </a>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={commentsEndRef} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {isAdmin && handleDeleteTask && (
                    confirmDelete ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-2xl">
                        <span className="text-xs font-semibold text-red-700">Delete this task?</span>
                        <button
                          type="button"
                          onClick={async () => {
                            await handleDeleteTask();
                            setConfirmDelete(false);
                          }}
                          disabled={isDeleting}
                          className="px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isDeleting ? <CircularProgress size={12} color="inherit" /> : "Yes, delete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          disabled={isDeleting}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-white rounded-xl cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition-all cursor-pointer"
                      >
                        Delete Task
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || isEditUploadingAttachments}
                    className="px-6 py-2.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating
                      ? "Updating..."
                      : isEditUploadingAttachments
                        ? "Uploading..."
                        : "Update Task"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTaskModal;
