import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  FolderKanban,
  RotateCcw,
  X,
  ChevronRight,
  Users,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import { useGetTaskBoardProjectsQuery } from "../taskBoardApi";
import { getImageUrl } from "../../../utils/utils";
import type { ITaskBoardProject } from "../taskBoard.types";
import EmployeeTaskBoard from "../components/EmployeeTaskBoard";
import MyTasks from "../components/MyTasks";
import { useSelector } from "react-redux";
import { userInState, userDetailsInState } from "../../auth/authSlice";

const TaskBoard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(userInState);
  const userDetails = useSelector(userDetailsInState);
  const userRole = (currentUser?.user_type || userDetails?.role || "").toLowerCase();
  const showMyTasks = userRole === "hr";
  const [searchParams, setSearchParams] = useSearchParams();
  const view: "projects" | "employees" =
    searchParams.get("view") === "employees" ? "employees" : "projects";
  const setView = (v: "projects" | "employees") => {
    const next = new URLSearchParams(searchParams);
    if (v === "projects") next.delete("view");
    else next.set("view", v);
    setSearchParams(next, { replace: true });
    setSearchTerm("");
  };
  const [employeeRefreshKey, setEmployeeRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [failedLogos, setFailedLogos] = useState<Record<number, boolean>>({});
  const [loadedLogos, setLoadedLogos] = useState<Record<number, boolean>>({});

  const handleLogoLoad = (id: number) => {
    setLoadedLogos((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  const handleLogoError = (id: number) => {
    setFailedLogos((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    setLoadedLogos((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  // Fetch projects from /api/task-board
  const {
    data: projects = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTaskBoardProjectsQuery(undefined, {
    pollingInterval: 30_000, // pick up changes made by other people
    refetchOnFocus: true, // coming back to the browser tab
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true, // coming back from a project board
  });

  // Filter projects by search term
  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return projects;
    return projects.filter((p) => p.title.toLowerCase().includes(term));
  }, [projects, searchTerm]);

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden min-h-0 gap-5">
      {/* Top Header Section - Fixed / Non-scrolling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 pb-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-black-80 tracking-tight">
              Task Board
            </h1>
            {view === "projects" && !isLoading && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-20 text-primary">
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "Project" : "Projects"}
              </span>
            )}
          </div>
          <p className="text-sm text-black-50 mt-1">
            {view === "projects"
              ? "Select a project to view and manage tasks"
              : "See who is working on what — status, priority and time spent per employee"}
          </p>
          <div className="mt-3 inline-flex bg-white border border-black-20 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setView("projects")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                view === "projects" ? "bg-primary text-white" : "text-black-50 hover:text-black-80"
              }`}
            >
              <FolderKanban size={14} /> Projects
            </button>
            <button
              onClick={() => setView("employees")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                view === "employees" ? "bg-primary text-white" : "text-black-50 hover:text-black-80"
              }`}
            >
              <Users size={14} /> Employees
            </button>
          </div>
        </div>

        {/* Action Controls - Fixed */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-64 sm:w-80">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black-50"
              size={16}
            />
            <input
              type="text"
              placeholder={
                view === "projects"
                  ? "Search projects..."
                  : "Search employee, task or project..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-black-20 rounded-xl text-xs text-black-80 placeholder:text-black-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black-50 hover:text-black-80 cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() =>
              view === "projects"
                ? refetch()
                : setEmployeeRefreshKey((k) => k + 1)
            }
            disabled={view === "projects" && isFetching}
            title={view === "projects" ? "Refresh Projects" : "Refresh Employees"}
            className="p-2.5 bg-white border border-black-20 rounded-xl text-black-50 hover:text-primary hover:border-primary transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw
              size={16}
              className={isFetching ? "animate-spin text-primary" : ""}
            />
          </button>
        </div>
      </div>

      {view === "employees" ? (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-6 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <EmployeeTaskBoard searchTerm={searchTerm} refreshKey={employeeRefreshKey} />
        </div>
      ) : (
      /* Projects Grid Content - Scrollable Only */
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-6 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-5">
        {showMyTasks && <MyTasks />}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <CircularProgress size={36} sx={{ color: "#f17c04" }} />
            <p className="text-xs text-black-50 font-medium">
              Loading projects...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-8 text-center max-w-md mx-auto my-12">
            <p className="text-sm font-semibold text-red-700">
              Failed to load projects
            </p>
            <p className="text-xs text-red-500 mt-1">
              Could not retrieve task board projects from the server.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border border-dashed border-black-20 rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto text-black-50 mb-4">
              <FolderKanban size={32} />
            </div>
            <h3 className="text-base font-bold text-black-80">
              {searchTerm
                ? "No matching projects found"
                : "No projects available"}
            </h3>
            <p className="text-xs text-black-50 mt-1 max-w-xs mx-auto">
              {searchTerm
                ? `No projects matched "${searchTerm}". Try a different search query.`
                : `There are currently no projects available on your task board.`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-1.5 text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project: ITaskBoardProject) => {
              const inProgress = Number(project.in_progress_tasks_count) || 0;
              const planned = Number(project.planned_tasks_count) || 0;
              const blocked = Number(project.blocked_tasks_count) || 0;
              const completed = Number(project.completed_tasks_count) || 0;
              const total = inProgress + planned + blocked + completed;
              const donePct = total ? Math.round((completed / total) * 100) : 0;
              const logoSrc = project.logo_url ? getImageUrl(project.logo_url) : null;
              const hasValidLogo = logoSrc && !failedLogos[project.id];

              const stats: { label: string; value: number; color: string }[] = [
                { label: "Planned", value: planned, color: "text-sky-600" },
                { label: "In Progress", value: inProgress, color: "text-amber-600" },
                { label: "Blocked", value: blocked, color: "text-red-600" },
              ];

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/tasks?project=${encodeURIComponent(project.title)}`)}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer flex flex-col"
                >
                  {/* Top: logo + title */}
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                      {hasValidLogo ? (
                        <>
                          {!loadedLogos[project.id] && (
                            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center overflow-hidden z-1">
                              <span className="text-slate-300 font-bold text-sm select-none">
                                {project.title.charAt(0).toUpperCase()}
                              </span>
                              <div className="logo-shimmer-slide" />
                            </div>
                          )}
                          <img
                            src={logoSrc}
                            alt={project.title}
                            className={`w-full h-full object-contain transition-opacity duration-300 ${
                              loadedLogos[project.id] ? "opacity-100" : "opacity-0"
                            }`}
                            onLoad={() => handleLogoLoad(project.id)}
                            onError={() => handleLogoError(project.id)}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full rounded-lg bg-primary-20 flex items-center justify-center text-primary font-bold text-base">
                          {project.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4
                        title={project.title}
                        className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors truncate"
                      >
                        {project.title}
                      </h4>
                      <p className="text-[11px] text-black-50 mt-0.5">
                        {total} task{total === 1 ? "" : "s"} · {completed} done
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </div>

                  {/* Progress bar */}
                  <div className="px-4">
                    <div className="h-1 rounded-full bg-gray-100 overflow-hidden" title={`${donePct}% completed`}>
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${donePct}%` }} />
                    </div>
                  </div>

                  {/* Status counts */}
                  <div className="grid grid-cols-3 mt-3 border-t border-gray-100">
                    {stats.map((s, i) => (
                      <div
                        key={s.label}
                        className={`py-2.5 text-center ${i > 0 ? "border-l border-gray-100" : ""}`}
                      >
                        <p className={`text-base font-bold leading-none ${s.value ? s.color : "text-gray-300"}`}>
                          {s.value}
                        </p>
                        <p className="text-[10px] text-black-50 mt-1">{s.label}</p>
                      </div>
                    ))}
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
};

export default TaskBoard;

