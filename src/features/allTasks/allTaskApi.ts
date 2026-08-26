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

export interface IEmployeeTaskContainer {
  id: number;
  date: string;
  employee: string | null;
  employee_id?: number | null;
  profile_photo?: string | null;
  task_items: ITaskItem[];
}

export interface IActiveEmployee {
  id: number;
  username: string;
  email?: string;
  name?: string;
  profile_photo?: {
    url?: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
    };
  } | string | null;
  [key: string]: any;
}

export interface ITaskFilterParams {
  startDate?: string;
  endDate?: string;
  employeeId?: number | string;
}

export interface ICreateAdminTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  date: string;
  estimatedMinutes?: number;
  employeeId?: number | string;
}

export interface IUpdateAdminTaskPayload {
  id: string | number;
  body: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    estimatedMinutes?: number;
    date?: string;
  };
}

export const enhancedAllTasksApi = baseApi.enhanceEndpoints({
  addTagTypes: ["AllTasks", "Employees"],
});

export const allTasksApi = enhancedAllTasksApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get All Tasks with Date Range Filters
    getAllTasks: builder.query<IEmployeeTaskContainer[], ITaskFilterParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params?.startDate && params?.endDate) {
          if (params.startDate === params.endDate) {
            queryParams.append("filters[date][$eq]", params.startDate);
          } else {
            queryParams.append("filters[date][$gte]", params.startDate);
            queryParams.append("filters[date][$lte]", params.endDate);
          }
        } else if (params?.startDate) {
          queryParams.append("filters[date][$gte]", params.startDate);
        } else if (params?.endDate) {
          queryParams.append("filters[date][$lte]", params.endDate);
        }

        if (params?.employeeId) {
          queryParams.append("filters[Employee_task][id][$eq]", String(params.employeeId));
        }

        const queryString = queryParams.toString();
        const baseEndpoint = endpoints.getAllTasks;
        const separator = baseEndpoint.includes("?") ? "&" : "?";

        return {
          url: queryString ? `${baseEndpoint}${separator}${queryString}` : baseEndpoint,
          method: ApiMethodType.get,
        };
      },
      providesTags: ["AllTasks"],
    }),

    // 2. Fetch Active Employees using endpoints.activeEmployees
    getActiveEmployees: builder.query<IActiveEmployee[], void>({
      query: () => ({
        url: endpoints.activeEmployees,
        method: ApiMethodType.get,
      }),
      providesTags: ["Employees"],
    }),

    // 3. Create / Assign Task
    createAdminTask: builder.mutation<any, ICreateAdminTaskPayload>({
      query: ({ employeeId, ...taskData }) => ({
        url: endpoints.createTask,
        method: ApiMethodType.post,
        body: {
          data: {
            ...taskData,
            ...(employeeId ? { Employee_task: employeeId } : {}),
          },
        },
      }),
      invalidatesTags: ["AllTasks"],
    }),

    // 4. Update Task
    updateAdminTask: builder.mutation<any, IUpdateAdminTaskPayload>({
      query: ({ id, body }) => ({
        url: endpoints.updateTask(id),
        method: ApiMethodType.PUT,
        body: { data: body },
      }),
      invalidatesTags: ["AllTasks"],
    }),

    // 5. Delete Task
    deleteAdminTask: builder.mutation<any, string | number>({
      query: (id) => ({
        url: endpoints.deleteTask(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ["AllTasks"],
    }),
  }),
});

export const {
  useGetAllTasksQuery,
  useLazyGetAllTasksQuery,
  useGetActiveEmployeesQuery,
  useLazyGetActiveEmployeesQuery,
  useCreateAdminTaskMutation,
  useUpdateAdminTaskMutation,
  useDeleteAdminTaskMutation,
} = allTasksApi;