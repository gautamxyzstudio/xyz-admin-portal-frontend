import React, { useState, useMemo } from "react";
import {
  Search,
  FolderKanban,
  RotateCcw,
  X,
  ChevronRight,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import { useGetTaskBoardProjectsQuery } from "../taskBoardApi";
import { getImageUrl } from "../../../utils/utils";
import type { ITaskBoardProject } from "../taskBoard.types";

const TaskBoard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [failedLogos, setFailedLogos] = useState<Record<number, boolean>>({});

  const handleLogoError = (id: number) => {
    setFailedLogos((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  // Fetch projects from /api/task-board
  const {
    data: projects = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTaskBoardProjectsQuery();

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
            {!isLoading && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-20 text-primary">
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "Project" : "Projects"}
              </span>
            )}
          </div>
          <p className="text-sm text-black-50 mt-1">
            Select a project to view and manage tasks
          </p>
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
              placeholder="Search projects..."
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
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Projects"
            className="p-2.5 bg-white border border-black-20 rounded-xl text-black-50 hover:text-primary hover:border-primary transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw
              size={16}
              className={isFetching ? "animate-spin text-primary" : ""}
            />
          </button>
        </div>
      </div>

      {/* Projects Grid Content - Scrollable Only */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-6 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
              const inProgressCount =
                Number(project.in_progress_tasks_count) || 0;
              const logoSrc = project.logo_url
                ? getImageUrl(project.logo_url)
                : null;

              const hasValidLogo = logoSrc && !failedLogos[project.id];

              return (
                <div
                  key={project.id}
                  className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex items-center justify-between gap-3.5 cursor-pointer min-h-[82px]"
                >
                  {/* Left Section: Logo + (Project Name & In-Progress below it) */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Project Logo / Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                      {hasValidLogo ? (
                        <img
                          src={logoSrc}
                          alt={project.title}
                          className="w-full h-full object-contain"
                          onError={() => handleLogoError(project.id)}
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-primary-20 flex items-center justify-center text-primary font-bold text-base">
                          {project.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Right side of logo: Full Title on top, In-Progress status below */}
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <h4
                        title={project.title}
                        className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors leading-snug break-words"
                      >
                        {project.title}
                      </h4>

                      {/* In-Progress Task Status below project name */}
                      <div className="mt-1.5 flex items-center">
                        <span
                          title={`${inProgressCount} in-progress task${
                            inProgressCount === 1 ? "" : "s"
                          }`}
                          className="inline-flex items-center gap-1.5 text-xs text-gray-400"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                          <span>{inProgressCount} in progress</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subtle navigation indicator on hover */}
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;

