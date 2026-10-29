/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface Props { [key: string]: any }
const EditTaskModal: React.FC<Props> = (props) => {
  const { Check, ChevronDown, CircularProgress, Paperclip, STATUS_OPTIONS, Search, TaskAttachmentUpload, X, activityTab, commentAttachments, commentComposerRef, commentFileInputRef, completeHistory, currentUserName, currentUserPhoto, editAssigneeSearchQuery, editAttachments, editEstimatedHours, editEstimatedMinutes, editFilteredProjectEmployees, editSelectedEmployeeObj, editTaskForm, extractEmployeePhotoUrl, formatHistoryTime, getAvatarBg, getImageUrl, getInitials, handleAddComment, handleUpdateTaskSubmit, handleUploadCommentPhotos, isAdmin, isCommentExpanded, isCommentsLoading, isEditAssigneeDropdownOpen, isEditUploadingAttachments, isPostingComment, isProjectsLoading, isUpdating, isUploadingCommentPhoto, newCommentText, projectAssignedEmployees, selectedTask, setActivityTab, setCommentAttachments, setEditAssigneeSearchQuery, setEditAttachments, setEditEstimatedHours, setEditEstimatedMinutes, setEditTaskForm, setIsCommentFocused, setIsEditAssigneeDropdownOpen, setIsEditUploadingAttachments, setNewCommentText, setSelectedTask, setViewAttachmentPreview, taskCommentsList } = props;
  return (
    <>
{/* Modal: Edit Task */}
      {selectedTask && (
        <div className="fixed inset-0 z-99 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150">
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
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
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
                <textarea
                  rows={3}
                  value={editTaskForm.description}
                  onChange={(e) =>
                    setEditTaskForm({
                      ...editTaskForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white resize-y transition-all shadow-2xs leading-relaxed"
                  placeholder="Task details and notes..."
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
              {isAdmin ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                      Assignee <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIsEditAssigneeDropdownOpen(!isEditAssigneeDropdownOpen)
                        }
                        className={`w-full h-[46px] px-3.5 bg-[#fafafa] border rounded-2xl text-xs text-left outline-none transition-all shadow-2xs flex items-center justify-between gap-2 cursor-pointer hover:border-slate-300 ${isEditAssigneeDropdownOpen
                            ? "border-primary bg-white ring-2 ring-orange-500/10"
                            : "border-slate-200/90"
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {editSelectedEmployeeObj ? (
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
                          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isEditAssigneeDropdownOpen ? "rotate-180 text-primary" : ""
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
                          <div className="absolute top-full mt-1.5 left-0 w-full z-50 bg-white border border-slate-200/90 shadow-xl rounded-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                            {projectAssignedEmployees.length > 5 && (
                              <div className="p-2 border-b border-slate-100">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200/70">
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
                                    : "No employees assigned to this project"}
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
                                        setIsEditAssigneeDropdownOpen(false);
                                        setEditAssigneeSearchQuery("");
                                      }}
                                      className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${isSelected
                                          ? "bg-orange-50/90 text-primary font-semibold"
                                          : "text-slate-700 hover:bg-slate-50"
                                        }`}
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
                    <div className="relative">
                      <select
                        value={editTaskForm.priority}
                        onChange={(e) =>
                          setEditTaskForm({
                            ...editTaskForm,
                            priority: e.target.value as any,
                          })
                        }
                        className="w-full h-[46px] px-4 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white cursor-pointer appearance-none pr-9 transition-all shadow-2xs"
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
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={editTaskForm.priority}
                      onChange={(e) =>
                        setEditTaskForm({
                          ...editTaskForm,
                          priority: e.target.value as any,
                        })
                      }
                      className="w-full h-[46px] px-4 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white cursor-pointer appearance-none pr-9 transition-all shadow-2xs"
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
              )}

              {/* Estimated Time */}
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
                        <textarea
                          rows={isCommentExpanded ? 3 : 1}
                          placeholder="Add a comment..."
                          value={newCommentText}
                          onFocus={() => setIsCommentFocused(true)}
                          onClick={() => setIsCommentFocused(true)}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                              e.preventDefault();
                              handleAddComment();
                            }
                          }}
                          onPaste={(e) => {
                            const files = e.clipboardData?.files;
                            if (files && files.length > 0) {
                              handleUploadCommentPhotos(files);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const files = e.dataTransfer?.files;
                            if (files && files.length > 0) {
                              handleUploadCommentPhotos(files);
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          disabled={isPostingComment}
                          className={`w-full px-3.5 py-2.5 bg-white rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 outline-none leading-relaxed transition-all ${
                            isCommentExpanded
                              ? "border border-[#ff7300] focus:ring-2 focus:ring-[#ff7300]/20 resize-y min-h-[72px]"
                              : "border border-slate-200 hover:border-[#ff7300] resize-none min-h-[42px] cursor-text"
                          }`}
                        />

                        {/* Uploaded attachments preview for new comment */}
                        {commentAttachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {commentAttachments.map((att: any) => (
                              <div
                                key={att.id}
                                className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0"
                              >
                                <img
                                  src={att.previewUrl || getImageUrl(att.url)}
                                  alt={att.name}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCommentAttachments((prev: any) =>
                                      prev.filter((a: any) => a.id !== att.id),
                                    )
                                  }
                                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                  title="Remove photo"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Uploading indicator */}
                        {isUploadingCommentPhoto && (
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-orange-600 font-medium">
                            <CircularProgress size={13} color="inherit" />
                            <span>Uploading photo...</span>
                          </div>
                        )}

                        {/* Toolbar row: Only show when clicked/active */}
                        {isCommentExpanded && (
                          <div className="flex items-center justify-between mt-2 animate-in fade-in duration-150">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleAddComment}
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
                                  setIsCommentFocused(false);
                                }}
                                disabled={isPostingComment}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  commentFileInputRef.current?.click()
                                }
                                disabled={
                                  isPostingComment || isUploadingCommentPhoto
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Paperclip
                                  size={13}
                                  className="text-slate-600 -rotate-45"
                                />
                                <span>Photo</span>
                              </button>
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
                      <div className="max-h-60 overflow-y-auto space-y-2.5 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

                            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap pl-8">
                              {c.text}
                            </p>

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
                                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 hover:text-primary hover:border-primary/50 transition-colors shadow-2xs"
                                    >
                                      <Paperclip size={12} className="text-slate-400" />
                                      <span className="truncate max-w-[150px]">
                                        {att.name}
                                      </span>
                                    </a>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">

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
