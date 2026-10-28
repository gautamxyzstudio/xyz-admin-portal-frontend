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
  attachments?: any;
}

export interface IProjectTaskItem {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  estimatedMinutes?: number;
  priority?: "low" | "medium" | "high";
  createdAt?: string;
  updatedAt?: string;
  project?: {
    id: number;
    title: string;
  };
  Task_assigned_to?: string | null;
  task_created_by?: string | null;
  assigned_to?: {
    id: number;
    username: string;
    photo?: string | null;
  } | null;
  taskHistory?: any[];
  attachments?: any;
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
  date?: string;
  estimatedMinutes?: number;
  project?: number | string;
  assignedTo?: number | string;
  priority?: "low" | "medium" | "high";
  attachments?: number[];
}

export interface IUpdateTaskPayload {
  id: string | number;
  body: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    estimatedMinutes?: number;
    date?: string;
    priority?: "low" | "medium" | "high";
    assignedTo?: number | string;
    attachments?: number[];
  };
}

export interface ITaskCommentItem {
  id: number;
  comment: string;
  attachments?: string[] | any[];
  addedBy?: {
    id: number;
    username: string;
    logo?: string | null;
  } | null;
  createdAt: string;
}

export interface ICreateTaskCommentPayload {
  comment: string;
  task_item: number | string;
  attachments?: number[];
}

export const enhancedTaskApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Tasks", "TaskComments"],
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

    // 2. Get Project Tasks
    getProjectTasks: builder.query<
      IProjectTaskItem[],
      { project: string; status?: string }
    >({
      query: ({ project, status }) => {
        const params: Record<string, string> = { project };
        if (status) params.status = status;
        return {
          url: endpoints.projectTasks,
          method: ApiMethodType.get,
          params,
        };
      },
      transformResponse: (response: any): IProjectTaskItem[] => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ["Tasks"],
    }),

    // 3. Create Task
    createTask: builder.mutation<any, ICreateTaskPayload>({
      query: (data) => ({
        url: endpoints.createTask,
        method: ApiMethodType.post,
        body: { data },
      }),
      invalidatesTags: ["Tasks"],
    }),

    // 4. Update Task
    updateTask: builder.mutation<any, IUpdateTaskPayload>({
      query: ({ id, body }) => ({
        url: endpoints.updateTask(id),
        method: ApiMethodType.PUT,
        body: { data: body },
      }),
      invalidatesTags: ["Tasks"],
    }),

    // 5. Delete Task
    deleteTask: builder.mutation<any, string | number>({
      query: (id) => ({
        url: endpoints.deleteTask(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ["Tasks"],
    }),

    // 6. Create Task Comment
    createTaskComment: builder.mutation<any, ICreateTaskCommentPayload>({
      query: (data) => ({
        url: endpoints.taskComments,
        method: ApiMethodType.post,
        body: {
          data: {
            comment: data.comment,
            task_item: Number(data.task_item) || data.task_item,
            attachments: data.attachments ?? [],
          },
        },
      }),
      invalidatesTags: ["Tasks", "TaskComments"],
    }),

    // 7. Get Task Comments
    getTaskComments: builder.query<ITaskCommentItem[], number | string>({
      query: (taskId) => ({
        url: endpoints.taskComments,
        method: ApiMethodType.get,
        params: {
          taskItem: taskId,
        },
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ["TaskComments"],
    }),
  }),
});

export const {
  useGetTodayTasksQuery,
  useLazyGetTodayTasksQuery,
  useGetProjectTasksQuery,
  useLazyGetProjectTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCreateTaskCommentMutation,
  useGetTaskCommentsQuery,
  useLazyGetTaskCommentsQuery,
} = taskApi;
