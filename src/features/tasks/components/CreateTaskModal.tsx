/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface Props { [key: string]: any }
const CreateTaskModal: React.FC<Props> = (props) => {
  const { Check, ChevronDown, CircularProgress, STATUS_OPTIONS, Search, TaskAttachmentUpload, X, assigneeSearchQuery, attachments, estimatedHours, estimatedMinutes, extractEmployeePhotoUrl, filteredProjectEmployees, getAvatarBg, getInitials, handleCreateTaskSubmit, isAddModalOpen, isAdmin, isAssigneeDropdownOpen, isCreating, isProjectsLoading, isUploadingAttachments, modalTargetStatus, projectAssignedEmployees, projectName, renderCreatePriorityDropdown, selectedEmployeeObj, setAssigneeSearchQuery, setAttachments, setEstimatedHours, setEstimatedMinutes, setIsAddModalOpen, setIsAssigneeDropdownOpen, setIsCreatePriorityDropdownOpen, setIsUploadingAttachments, setModalTargetStatus, setTaskForm, taskForm } = props;
  return (
    <>
{/* Modal: Create Task (Closes on backdrop click) */}
      {isAddModalOpen && (
        <div
          onClick={() => {
            setIsAddModalOpen(false);
            setIsCreatePriorityDropdownOpen(false);
          }}
          className="fixed inset-0 z-99 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto scrollbar-hide animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Create Task in {projectName}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsCreatePriorityDropdownOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Task Title"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Description"
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#fafafa] border border-slate-200/90 rounded-2xl text-xs text-slate-800 outline-none focus:border-primary focus:bg-white resize-none transition-all shadow-2xs"
                />
              </div>

              {/* Status Segmented Pills */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map((opt: any) => {
                    const isSelected = modalTargetStatus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setModalTargetStatus(opt.id)}
                        className={`w-full py-2 px-1 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${isSelected
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
                          setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)
                        }
                        className={`w-full h-[46px] px-3.5 bg-[#fafafa] border rounded-2xl text-xs text-left outline-none transition-all shadow-2xs flex items-center justify-between gap-2 cursor-pointer ${isAssigneeDropdownOpen
                            ? "border-primary bg-white ring-2 ring-orange-500/10"
                            : "border-slate-200/90 hover:border-slate-300"
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {selectedEmployeeObj ? (
                            <>
                              {(() => {
                                const photoUrl =
                                  extractEmployeePhotoUrl(selectedEmployeeObj);
                                const displayName =
                                  selectedEmployeeObj.name ||
                                  selectedEmployeeObj.username ||
                                  "Employee";
                                if (photoUrl) {
                                  return (
                                    <img
                                      src={photoUrl}
                                      alt=""
                                      className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                                      onError={(e) => {
                                        (
                                          e.currentTarget as HTMLElement
                                        ).style.display = "none";
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
                                {selectedEmployeeObj.name ||
                                  selectedEmployeeObj.username}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-400">
                              Select Assignee
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isAssigneeDropdownOpen ? "rotate-180 text-primary" : ""
                            }`}
                        />
                      </button>

                      {/* Rich Popover Dropdown */}
                      {isAssigneeDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsAssigneeDropdownOpen(false)}
                          />
                          <div className="absolute top-full mt-1.5 left-0 w-full z-50 bg-white border border-slate-200/90 shadow-xl rounded-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                            {projectAssignedEmployees.length > 5 && (
                              <div className="p-2 border-b border-slate-100">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200/70">
                                  <Search
                                    size={13}
                                    className="text-slate-400 shrink-0"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Search project member..."
                                    value={assigneeSearchQuery}
                                    onChange={(e) =>
                                      setAssigneeSearchQuery(e.target.value)
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
                                  <CircularProgress
                                    size={14}
                                    className="text-primary"
                                  />
                                  <span>Loading project members...</span>
                                </div>
                              ) : filteredProjectEmployees.length === 0 ? (
                                <div className="px-3.5 py-3 text-center text-xs text-slate-400">
                                  {assigneeSearchQuery.trim()
                                    ? "No employees found"
                                    : "No employees assigned to this project"}
                                </div>
                              ) : (
                                filteredProjectEmployees.map((emp: any) => {
                                  const isSelected =
                                    String(taskForm.assignedTo) ===
                                    String(emp.id);
                                  const photoUrl = extractEmployeePhotoUrl(emp);
                                  const displayName =
                                    emp.name || emp.username || "Employee";

                                  return (
                                    <div
                                      key={emp.id}
                                      onClick={() => {
                                        setTaskForm({
                                          ...taskForm,
                                          assignedTo: emp.id,
                                        });
                                        setIsAssigneeDropdownOpen(false);
                                        setAssigneeSearchQuery("");
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
                                              (
                                                e.currentTarget as HTMLElement
                                              ).style.display = "none";
                                            }}
                                          />
                                        ) : (
                                          <div
                                            className="w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[9px] shrink-0"
                                            style={{
                                              backgroundColor:
                                                getAvatarBg(displayName),
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
                                        <Check
                                          size={14}
                                          className="text-primary shrink-0"
                                        />
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

                  {renderCreatePriorityDropdown()}
                </div>
              ) : (
                renderCreatePriorityDropdown()
              )}

              {/* Estimated Time (Hours & Minutes) */}
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
                      value={estimatedHours}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        setEstimatedHours(clean.slice(0, 2));
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
                      value={estimatedMinutes}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        if (!clean) {
                          setEstimatedMinutes("");
                        } else if (Number(clean) > 59) {
                          setEstimatedMinutes("59");
                        } else {
                          setEstimatedMinutes(clean.slice(0, 2));
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

              {/* Attachments Option */}
              <TaskAttachmentUpload
                attachments={attachments}
                onChange={setAttachments}
                onUploadingChange={setIsUploadingAttachments}
                disabled={isCreating}
              />

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsCreatePriorityDropdownOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUploadingAttachments}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-white shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating
                    ? "Creating..."
                    : isUploadingAttachments
                      ? "Uploading attachments..."
                      : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTaskModal;