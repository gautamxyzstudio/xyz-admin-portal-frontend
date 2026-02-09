/* eslint-disable @typescript-eslint/no-explicit-any */
import { endpoints } from "../../api/endpoints";
import { baseApi } from "../../state/baseApi";

import type {
  ProjectPayload,
  UpdateProjectArgs,
} from "./projects.types";

export const enhancedProjectsApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Projects"],
});

export const projectsApi = enhancedProjectsApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ===============================
       GET PROJECTS
    ================================ */
    getProjects: builder.query<any, void>({
      query: () => ({
        url: endpoints.getProjects,
        method: "GET",
      }),
      providesTags: ["Projects"],
    }),

    /* ===============================
       ADD PROJECT
    ================================ */
    addProject: builder.mutation<void, ProjectPayload>({
      query: (data) => ({
        url: endpoints.postProjects,
        method: "POST",
        body: {
          data,
        },
      }),
      invalidatesTags: ["Projects"],
    }),

    /* ===============================
       UPDATE PROJECT
    ================================ */
    updateProject: builder.mutation<void, UpdateProjectArgs>({
      query: ({ id, data }) => ({
        url: endpoints.updateProject(id),
        method: "PUT",
        body: {
          data,
        },
      }),
      invalidatesTags: ["Projects"],
    }),

    /* ===============================
       DELETE PROJECT
    ================================ */
    deleteProject: builder.mutation<void, number>({
      query: (id) => ({
        url: endpoints.deleteProject(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
