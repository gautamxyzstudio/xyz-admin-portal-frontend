/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiendpoint } from "../../api/endpoint";
import { baseApi } from "../../state/baseApi";

import type {
  GetProjectsResponse,
  ProjectUI,
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
    getProjects: builder.query<ProjectUI[], void>({
      query: () => ({
        url: apiendpoint.getProjects,
        method: "GET",
      }),
      transformResponse: (response: GetProjectsResponse): ProjectUI[] => {
        return response.data.map((item) => ({
          id: item.id,
          title: item.attributes.title,

          users:
            item.attributes.users_permissions_users?.data?.map((user) => ({
              id: user.id,
              username: user.attributes.username,
            })) || [],

          logoUrl:
            item.attributes.logo?.data?.attributes?.url,
        }));
      },
      providesTags: ["Projects"],
    }),

    /* ===============================
       ADD PROJECT
    ================================ */
    addProject: builder.mutation<void, ProjectPayload>({
      query: (data) => ({
        url: apiendpoint.postProjects,
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
        url: apiendpoint.updateProject(id),
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
        url: apiendpoint.deleteProject(id),
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
