import { endpoints } from "../../api/endpoints";
import { baseApi } from "../../state/baseApi";
import { ApiMethodType } from "../../state/types";
import type { IGetHandbookListResponse } from "./types";

export const enhancedEmployeeApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Handbook"],
});

export const employeeApis = enhancedEmployeeApi.injectEndpoints({
  endpoints: (builder) => ({
    addHandbook: builder.mutation<IGetHandbookListResponse, File>({
      query: (file) => {
        const formData = new FormData();

        formData.append("hand_book_file", file);

        return {
          url: endpoints.employeeHandbook,
          method: ApiMethodType.post,
          body: formData,
        };
      },
      invalidatesTags: ["Handbook"],
    }),

    getHandbookList: builder.query<IGetHandbookListResponse, void>({
      query: () => endpoints.employeeHandbook,
      providesTags: ["Handbook"],
    }),

    updateHandbook: builder.mutation<
      IGetHandbookListResponse,
      {
        id: string;
        file: File;
      }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();

        formData.append("hand_book_file", file);

        return {
          url: endpoints.updateEmployeeHandbook(id),
          method: ApiMethodType.PUT,
          body: formData,
        };
      },

      invalidatesTags: ["Handbook"],
    }),

    deleteHandbook: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: endpoints.updateEmployeeHandbook(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ["Handbook"],
    }),
  }),
});

export const {
  useAddHandbookMutation,
  useGetHandbookListQuery,
  useUpdateHandbookMutation,
  useDeleteHandbookMutation,
} = employeeApis;
