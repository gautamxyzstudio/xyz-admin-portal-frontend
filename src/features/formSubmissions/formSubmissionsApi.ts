/* eslint-disable @typescript-eslint/no-explicit-any */
import { endpoints } from "../../api/endpoints";
import { baseApi } from "../../state/baseApi";
import { ApiMethodType } from "../../state/types";
import type {
  IFormSubmissionReader,
  IFormSubmissionsQuery,
  IFormSubmissionsResponse,
} from "./formSubmissions.types";

const enhanced = baseApi.enhanceEndpoints({ addTagTypes: ["FormSubmissions"] });

export const formSubmissionsApi = enhanced.injectEndpoints({
  endpoints: (builder) => ({
    getFormSubmissions: builder.query<IFormSubmissionsResponse, IFormSubmissionsQuery | void>({
      query: (arg) => {
        const params: Record<string, string | number> = {};
        if (arg?.page) params.page = arg.page;
        if (arg?.pageSize) params.pageSize = arg.pageSize;
        if (arg?.search) params.search = arg.search;
        if (arg?.formType) params.formType = arg.formType;
        if (arg?.status && arg.status !== "all") params.status = arg.status;
        return { url: endpoints.formSubmissions, method: ApiMethodType.get, params };
      },
      transformResponse: (res: any): IFormSubmissionsResponse => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: {
          pagination: res?.meta?.pagination ?? { page: 1, pageSize: 20, pageCount: 1, total: 0 },
          unreadCount: Number(res?.meta?.unreadCount ?? 0),
          formTypes: Array.isArray(res?.meta?.formTypes) ? res.meta.formTypes : [],
        },
      }),
      providesTags: ["FormSubmissions"],
    }),

    /** sidebar badge */
    getFormSubmissionsUnreadCount: builder.query<number, void>({
      query: () => ({ url: endpoints.formSubmissionsUnreadCount, method: ApiMethodType.get }),
      transformResponse: (res: any) => Number(res?.count ?? 0),
      providesTags: ["FormSubmissions"],
    }),

    markFormSubmissionRead: builder.mutation<
      { id: number; readBy: IFormSubmissionReader[] },
      number | string
    >({
      query: (id) => ({ url: endpoints.formSubmissionRead(id), method: ApiMethodType.PUT }),
      invalidatesTags: ["FormSubmissions"],
    }),
  }),
});

export const {
  useGetFormSubmissionsQuery,
  useGetFormSubmissionsUnreadCountQuery,
  useMarkFormSubmissionReadMutation,
} = formSubmissionsApi;
