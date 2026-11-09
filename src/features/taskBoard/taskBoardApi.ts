/* eslint-disable @typescript-eslint/no-explicit-any */
import { endpoints } from "../../api/endpoints";
import { baseApi } from "../../state/baseApi";
import { ApiMethodType } from "../../state/types";
import type {
  ITaskBoardProject,
  ITaskBoardEmployeesResponse,
} from "./taskBoard.types";

export const enhancedTaskBoardApi = baseApi.enhanceEndpoints({
  addTagTypes: ["TaskBoard", "Tasks", "AllTasks", "TaskOvertimes"],
});

export const taskBoardApi = enhancedTaskBoardApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaskBoardProjects: builder.query<
      ITaskBoardProject[],
      { username?: string } | void
    >({
      query: (arg) => ({
        url: endpoints.taskBoard,
        method: ApiMethodType.get,
        params: arg?.username ? { username: arg.username } : undefined,
      }),
      transformResponse: (response: any): ITaskBoardProject[] => {
        if (Array.isArray(response)) {
          return response;
        }
        if (Array.isArray(response?.projects)) {
          return response.projects;
        }
        if (Array.isArray(response?.data)) {
          return response.data;
        }
        return [];
      },
      // refresh whenever any task is created / edited / moved / deleted
      providesTags: ["TaskBoard", "Tasks", "AllTasks"],
    }),
    getTaskBoardEmployees: builder.query<
      ITaskBoardEmployeesResponse,
      { projectId?: number; status?: string } | void
    >({
      query: (arg) => {
        const params: Record<string, string | number> = {};
        if (arg?.projectId) params.projectId = arg.projectId;
        if (arg?.status) params.status = arg.status;
        return {
          url: endpoints.taskBoardEmployees,
          method: ApiMethodType.get,
          params: Object.keys(params).length ? params : undefined,
        };
      },
      transformResponse: (response: any): ITaskBoardEmployeesResponse => ({
        isElevatedUser: !!response?.isElevatedUser,
        employees: Array.isArray(response?.employees) ? response.employees : [],
      }),
      providesTags: ["TaskBoard", "Tasks", "AllTasks", "TaskOvertimes"],
    }),
  }),
});

export const {
  useGetTaskBoardProjectsQuery,
  useGetTaskBoardEmployeesQuery,
} = taskBoardApi;
