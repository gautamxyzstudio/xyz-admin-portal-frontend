/* eslint-disable @typescript-eslint/no-explicit-any */
import { endpoints } from "../../api/endpoints";
import { baseApi } from "../../state/baseApi";
import { ApiMethodType } from "../../state/types";

export type TaskStatus = "in-progress" | "planned" | "blocked" | "completed";

export interface ITaskItem {
  id: string | number;
  title: string;
  description?: string;
  status: TaskStatus;
  estimatedMinutes?: number;
  date: string;
  task_created_by?: string | null;
}

export interface ITaskAssignedToday {
  id: number;
  date: string;
  employee: string;
  task_items: ITaskItem[];
}

export interface ICreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  date: string;
  estimatedMinutes?: number;
}

export interface IUpdateTaskPayload {
  id: string | number;
  body: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    estimatedMinutes?: number;
    date?: string;
  };
}

export const enhancedTaskApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Tasks"],
});

export const taskApi = enhancedTaskApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Today Tasks (Flattens task_items automatically)
    getTodayTasks: builder.query<ITaskItem[], void>({
      query: () => ({
        url: endpoints.getTodayTasks,
        method: ApiMethodType.get,
      }),
      transformResponse: (response: ITaskAssignedToday[]) => {
        if (!Array.isArray(response)) return [];
        return response.flatMap((item) => item.task_items || []);
      },
      providesTags: ["Tasks"],
    }),

    // 2. Create Task
    createTask: builder.mutation<any, ICreateTaskPayload>({
      query: (data) => ({
        url: endpoints.createTask,
        method: ApiMethodType.post,
        body: { data },
      }),
      invalidatesTags: ["Tasks"],
    }),

    // 3. Update Task
    updateTask: builder.mutation<any, IUpdateTaskPayload>({
      query: ({ id, body }) => ({
        url: endpoints.updateTask(id),
        method: ApiMethodType.PUT,
        body: { data: body },
      }),
      invalidatesTags: ["Tasks"],
    }),

    // 4. Delete Task
    deleteTask: builder.mutation<any, string | number>({
      query: (id) => ({
        url: endpoints.deleteTask(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetTodayTasksQuery,
  useLazyGetTodayTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;