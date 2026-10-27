/* eslint-disable @typescript-eslint/no-explicit-any */
import { endpoints } from "../../api/endpoints";
import { baseApi } from "../../state/baseApi";
import { ApiMethodType } from "../../state/types";
import type { ITaskBoardProject } from "./taskBoard.types";

export const enhancedTaskBoardApi = baseApi.enhanceEndpoints({
  addTagTypes: ["TaskBoard"],
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
      providesTags: ["TaskBoard"],
    }),
  }),
});

export const { useGetTaskBoardProjectsQuery } = taskBoardApi;
