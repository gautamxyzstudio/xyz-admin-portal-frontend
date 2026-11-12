/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  FolderKanban,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
  useAddProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from "../projectsApi";
import type { ProjectPayload } from "../projects.types";
import { confirmDelete } from "../../../utils/confirmDelete";
import { userInState, userDetailsInState } from "../../auth/authSlice";
import { employeeListInState } from "../../employee/employeeSlice";
import { useGetEmployeeListQuery } from "../../employee/employeeApis";
import { useUploadFileMutation } from "../../../shared/api/sharedApi";
import { useGetTaskBoardProjectsQuery } from "../../taskBoard/taskBoardApi";
import ThemedDropdown from "../../../components/ThemedDropdown";
import { PersonCell } from "../../../components/ThemedTable";
import { getImageUrl } from "../../../utils/utils";

/* ---------- small pieces ---------- */

const AVATAR_BG = ["#F17C04", "#0EA5E9", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B", "#14B8A6", "#EC4899"];
const colorFor = (s: string) => AVATAR_BG[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_BG.length];
const initials = (s: string) =>
  s
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const Avatar: React.FC<{ name: string; photo?: string | null; size?: number; ring?: boolean }> = ({
  name,
  photo,
  size = 32,
  ring = false,
}) => {
  const [failed, setFailed] = useState(false);
  const src = photo ? getImageUrl(photo) : "";
  const cls = `rounded-full shrink-0 ${ring ? "ring-2 ring-white" : ""}`;
  return src && !failed ? (
    <img
      src={src}
      alt={name}
      title={name}
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className={`${cls} object-cover`}
    />
  ) : (
    <span
      title={name}
      style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.36 }}
      className={`${cls} grid place-items-center text-white font-semibold`}
    >
      {initials(name)}
    </span>
  );
};

const ProjectLogo: React.FC<{ title: string; url?: string | null; size?: number }> = ({ title, url, size = 44 }) => {
  const [failed, setFailed] = useState(false);
  const src = url ? getImageUrl(url) : "";
  return src && !failed ? (
    <img
      src={src}
      alt={title}
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className="rounded-xl object-contain bg-white border border-gray-100 p-1 shrink-0"
    />
  ) : (
    <span
      style={{ width: size, height: size, background: `${colorFor(title)}1A`, color: colorFor(title) }}
      className="grid place-items-center rounded-xl font-bold text-sm shrink-0"
    >
      {initials(title)}
    </span>
  );
};

const emptyForm = {
  members: [] as { id: number; name: string; photo?: string }[],
  project: "",
  projectDescription: "",
  logo: null as number | null,
  logoPreview: "",
};

/* ---------- page ---------- */

const Projects = () => {
  const navigate = useNavigate();
  const user = useSelector(userInState);
  const userDetails = useSelector(userDetailsInState);
  const employeeList = useSelector(employeeListInState);

  const userRole = (user?.user_type || userDetails?.role || "").toLowerCase();
  const isAdmin = ["admin", "hr", "management"].includes(userRole);

  useGetEmployeeListQuery({ user_type: user ? user.user_type : "" }, { skip: !isAdmin });
  const { data: projects, isLoading } = useGetProjectsQuery(undefined, { skip: !isAdmin });
  const { data: boardProjects = [] } = useGetTaskBoardProjectsQuery(undefined, { skip: !isAdmin });

  const [addProject, { isLoading: isAdding }] = useAddProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const saving = isAdding || isUpdating;

  const teamOptions = useMemo(
    () =>
      (employeeList || []).filter(
        (e: any) => e.id !== user?.id && e.role !== "Management" && e.status === true,
      ),
    [employeeList, user?.id],
  );

  // task counts per project from the Task Board
  const counts = useMemo(() => {
    const m = new Map<number, { planned: number; progress: number; blocked: number; done: number }>();
    for (const p of boardProjects as any[])
      m.set(Number(p.id), {
        planned: Number(p.planned_tasks_count || 0),
        progress: Number(p.in_progress_tasks_count || 0),
        blocked: Number(p.blocked_tasks_count || 0),
        done: Number(p.completed_tasks_count || 0),
      });
    return m;
  }, [boardProjects]);

  const list: any[] = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (projects?.projects || []).filter(
      (p: any) =>
        !term ||
        p?.title?.toLowerCase().includes(term) ||
        (p.users_permissions_users || []).some((u: any) => u?.username?.toLowerCase().includes(term)),
    );
  }, [projects, searchTerm]);

  const totalMembers = useMemo(() => {
    const ids = new Set<number>();
    (projects?.projects || []).forEach((p: any) => (p.users_permissions_users || []).forEach((u: any) => ids.add(u.id)));
    return ids.size;
  }, [projects]);

  if (!user) return null;

  /* ---------- handlers ---------- */

  const addMember = (id: number) => {
    const emp: any = teamOptions.find((e: any) => e.id === id);
    if (!emp || formData.members.some((m) => m.id === id)) return;
    setFormData((f) => ({ ...f, members: [...f.members, { id, name: emp.name, photo: emp.image }] }));
  };

  // removes by id, so a removed member is really dropped on save
  const removeMember = (id: number) => setFormData((f) => ({ ...f, members: f.members.filter((m) => m.id !== id) }));

  const handleEdit = (item: any) => {
    setIsEditing(item.id);
    setTouched(false);
    setError("");
    setFormData({
      members: (item.users_permissions_users || []).map((u: any) => ({
        id: u.id,
        name: teamOptions.find((e: any) => e.id === u.id)?.name || u.username,
        photo: u?.photo?.url,
      })),
      project: item.title || "",
      projectDescription: item.description || "",
      logo: item.logo?.id || null,
      logoPreview: item.logo?.url || "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetForm = () => {
    setIsEditing(null);
    setTouched(false);
    setError("");
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!formData.project.trim() || formData.members.length === 0) return;

    const payload: ProjectPayload = {
      title: formData.project.trim(),
      users_permissions_users: formData.members.map((m) => m.id),
      description: formData.projectDescription,
      logo: formData.logo,
    };

    try {
      setError("");
      if (isEditing) await updateProject({ id: isEditing, data: payload }).unwrap();
      else await addProject(payload).unwrap();
      resetForm();
    } catch (err: any) {
      console.error("Project save failed", err);
      setError(err?.data?.error?.message || "Couldn't save the project. Please try again.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFormData((prev) => ({ ...prev, logoPreview: URL.createObjectURL(file) }));
    const form = new FormData();
    form.append("files", file);
    try {
      const response = await uploadFile(form).unwrap();
      if (response?.length) setFormData((prev) => ({ ...prev, logo: response[0].id }));
    } catch (err) {
      console.error("Upload failed", err);
      setFormData((prev) => ({ ...prev, logoPreview: "", logo: null }));
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!(await confirmDelete({ itemName: "this project" }))) return;
    try {
      await deleteProject(id).unwrap();
      if (isEditing === id) resetForm();
    } catch (err) {
      console.error("Project delete failed", err);
    }
  };

  const nameError = touched && !formData.project.trim();
  const teamError = touched && formData.members.length === 0;

  /* ---------- UI ---------- */
  return (
    <div className="w-full flex flex-col gap-4 pb-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-black-80">Projects</h1>
          <p className="text-xs text-black-50 mt-0.5">Create projects, assign the team and keep an eye on progress</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-100 text-xs text-black-50">
            <FolderKanban size={14} className="text-primary" />
            <b className="text-black-80">{projects?.projects?.length ?? 0}</b> projects
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-100 text-xs text-black-50">
            <Users size={14} className="text-primary" />
            <b className="text-black-80">{totalMembers}</b> people assigned
          </span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-start">
        {/* ===== form ===== */}
        <div
          ref={formRef}
          className={`proj-form w-full xl:w-[360px] shrink-0 xl:sticky xl:top-0 bg-white rounded-2xl border p-5 transition-colors ${
            isEditing ? "border-primary-50 shadow-[0_10px_30px_-18px_var(--primary)]" : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary-20 text-primary">
                {isEditing ? <Pencil size={16} /> : <Plus size={18} />}
              </span>
              <div>
                <h2 className="text-base font-semibold text-black-80">{isEditing ? "Edit project" : "New project"}</h2>
                <p className="text-[11px] text-black-50">{isEditing ? "Update details and team" : "Name it and pick the team"}</p>
              </div>
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-black-50 hover:text-primary hover:bg-primary-20 transition-colors cursor-pointer"
              >
                <X size={13} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* logo + name */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload project logo"
                className="proj-logo group relative grid place-items-center w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 bg-[#fafafa] hover:border-primary hover:bg-primary-20/40 transition-colors overflow-hidden shrink-0 cursor-pointer"
              >
                {formData.logoPreview ? (
                  <>
                    <img src={formData.logoPreview.startsWith("blob:") ? formData.logoPreview : getImageUrl(formData.logoPreview)} alt="" className="w-full h-full object-contain p-1.5" />
                    <span className="absolute inset-0 grid place-items-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImagePlus size={16} />
                    </span>
                  </>
                ) : (
                  <ImagePlus size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                )}
                {isUploading && (
                  <span className="absolute inset-0 grid place-items-center bg-white/70">
                    <Loader2 size={18} className="animate-spin text-primary" />
                  </span>
                )}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

              <label className="flex-1 flex flex-col gap-1.5 min-w-0">
                <span className="text-xs font-semibold text-black-80">
                  Project name <span className="text-rose-500">*</span>
                </span>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="e.g. Mozart"
                  className={`proj-input h-11 px-3.5 rounded-xl border bg-[#fafafa] text-sm outline-none transition-all ${
                    nameError ? "border-rose-400" : "border-gray-200"
                  }`}
                />
                {nameError && <span className="text-[11px] text-rose-500">Give the project a name</span>}
              </label>
            </div>

            {/* team */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-black-80">
                Team members <span className="text-rose-500">*</span>
              </span>
              <ThemedDropdown<number>
                value={null}
                onChange={addMember}
                variant="field"
                error={teamError}
                placeholder={formData.members.length ? "Add another member…" : "Select team members…"}
                searchPlaceholder="Search employee…"
                ariaLabel="Add team member"
                options={teamOptions
                  .filter((e: any) => !formData.members.some((m) => m.id === e.id))
                  .map((e: any) => ({
                    value: e.id,
                    searchText: `${e.name} ${e.designation || ""}`,
                    label: <PersonCell name={e.name} photo={e.image} sub={e.designation} />,
                  }))}
              />
              {teamError && <span className="text-[11px] text-rose-500">Pick at least one person</span>}
              {formData.members.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.members.map((m) => (
                    <span
                      key={m.id}
                      className="proj-chip inline-flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full bg-primary-20/60 text-xs font-medium text-black-80"
                    >
                      <Avatar name={m.name} photo={m.photo} size={20} />
                      {m.name}
                      <button
                        type="button"
                        onClick={() => removeMember(m.id)}
                        aria-label={`Remove ${m.name}`}
                        className="grid place-items-center w-4 h-4 rounded-full text-black-50 hover:text-white hover:bg-rose-500 transition-colors cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* description */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-black-80">
                Description <span className="font-normal text-black-50">(optional)</span>
              </span>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                placeholder="What is this project about?"
                rows={3}
                className="proj-input px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#fafafa] text-sm outline-none transition-all resize-none"
              />
            </label>

            {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={saving || isUploading}
              className="h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:brightness-105 active:scale-[0.98] disabled:opacity-60 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : isEditing ? <Check size={16} /> : <Plus size={16} />}
              {isEditing ? "Save changes" : "Create project"}
            </button>
          </form>
        </div>

        {/* ===== projects ===== */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-black-80">
              Active projects <span className="text-sm font-normal text-black-50">({list.length})</span>
            </h2>
            <label className="att-search group flex items-center gap-2 w-full sm:w-64 h-10 px-3 rounded-xl border border-gray-200 bg-[#fafafa] transition-all">
              <Search size={15} className="text-gray-400 group-focus-within:text-primary shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find project or member…"
                className="w-full bg-transparent outline-none text-sm text-black-80 placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="text-gray-400 hover:text-primary cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </label>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-44 rounded-2xl border border-gray-100 animate-pulse bg-gray-50" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary-20 text-primary mb-3">
                <FolderKanban size={22} />
              </span>
              <p className="text-sm font-semibold text-black-80">
                {searchTerm ? "No projects match your search" : "No projects yet"}
              </p>
              <p className="text-xs text-black-50 mt-1">
                {searchTerm ? "Try another name." : "Create your first project with the form."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
              {list.map((item: any, i: number) => {
                const members: any[] = item.users_permissions_users || [];
                const c = counts.get(Number(item.id)) || { planned: 0, progress: 0, blocked: 0, done: 0 };
                const total = c.planned + c.progress + c.blocked + c.done;
                const pct = total ? Math.round((c.done / total) * 100) : 0;
                const editing = isEditing === item.id;
                return (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
                    className={`proj-card group relative flex flex-col gap-3 p-4 rounded-2xl border bg-white transition-all ${
                      editing ? "border-primary ring-2 ring-primary-20" : "border-gray-100 hover:border-primary-50"
                    }`}
                  >
                    {/* top */}
                    <div className="flex items-start gap-3">
                      <ProjectLogo title={item.title || "?"} url={item.logo?.url} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-black-80 truncate" title={item.title}>
                          {item.title}
                        </p>
                        <p className="text-xs text-black-50 line-clamp-2 min-h-[2rem]">
                          {item.description || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          title="Edit"
                          aria-label={`Edit ${item.title}`}
                          className="grid place-items-center w-8 h-8 rounded-lg text-gray-500 hover:text-primary hover:bg-primary-20 transition-colors cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(item.id)}
                          title="Delete"
                          aria-label={`Delete ${item.title}`}
                          className="grid place-items-center w-8 h-8 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* progress */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-black-50 mb-1">
                        <span>
                          {total ? (
                            <>
                              <b className="text-black-80">{c.done}</b>/{total} tasks done
                            </>
                          ) : (
                            "No tasks yet"
                          )}
                        </span>
                        {total > 0 && <span className="font-semibold text-black-80">{pct}%</span>}
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                        {total > 0 && (
                          <>
                            <span className="att-bar h-full bg-emerald-500" style={{ width: `${(c.done / total) * 100}%` }} />
                            <span className="att-bar h-full bg-amber-400" style={{ width: `${(c.progress / total) * 100}%` }} />
                            <span className="att-bar h-full bg-rose-400" style={{ width: `${(c.blocked / total) * 100}%` }} />
                          </>
                        )}
                      </div>
                      {total > 0 && (
                        <div className="flex gap-3 mt-1.5 text-[10.5px] text-black-50">
                          <span><i className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />{c.progress} in progress</span>
                          <span><i className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 mr-1" />{c.planned} planned</span>
                          {c.blocked > 0 && (
                            <span><i className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-1" />{c.blocked} blocked</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* bottom */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 mt-auto">
                      {members.length ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex -space-x-2">
                            {members.slice(0, 4).map((m: any) => (
                              <Avatar key={m.id} name={m.username || "?"} photo={m?.photo?.url} size={28} ring />
                            ))}
                            {members.length > 4 && (
                              <span className="grid place-items-center w-7 h-7 rounded-full ring-2 ring-white bg-gray-100 text-[10px] font-semibold text-black-80">
                                +{members.length - 4}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-black-50 truncate">
                            {members.length} {members.length === 1 ? "member" : "members"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-orange-500">No team assigned</span>
                      )}
                      <button
                        onClick={() => navigate(`/tasks?project=${encodeURIComponent(item.title)}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary-20 transition-colors cursor-pointer shrink-0"
                      >
                        Open board <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
