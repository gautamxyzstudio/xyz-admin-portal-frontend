import { baseApi } from "../../state/baseApi";
import { ApiMethodType } from "../../state/types";
import type {
  IHolidayResponse,
  IHoliday,
  IHolidayFlat,
  IHolidayApiResponse,
} from "./holydayList.types";
import type { IHolidayRequest } from "./holydayList.types";
import { endpoints } from "../../api/endpoints";

export const enhancedHolidayListApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Holiday"],
});

export const holidayListApi = enhancedHolidayListApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all holidays (FLATTENED)
    getHolidays: builder.query<IHolidayFlat[], void>({
      query: () => ({
        url: endpoints.getHolidays,
        method: ApiMethodType.get,
      }),
      providesTags: ["Holiday"],
      transformResponse: (response: IHolidayResponse): IHolidayFlat[] => {
        return response.data.map((item) => ({
          id: item.id,
          name: item.attributes.Name,
          date: item.attributes.date,
        }));
      },
    }),

    getHolidayById: builder.query<IHolidayFlat, number>({
      query: (id: number) => ({
        url: endpoints.getHolidayById(id),
        method: ApiMethodType.get,
      }),
      providesTags: (_result, _error, id) => [{ type: "Holiday", id }],
      transformResponse: (response: IHolidayApiResponse): IHolidayFlat => {
        return {                                                                                     
          id: response.data.id,
          name: response.data.attributes.Name,
          date: response.data.attributes.date,
        };
      },
    }),

    // ✅ Delete holiday
    deleteHoliday: builder.mutation<void, number>({
      query: (id) => ({
        url: endpoints.deleteHoliday(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ["Holiday"],
    }),

    // ✅ Create holiday
    postHoliday: builder.mutation<IHoliday, IHolidayRequest>({
      query: (data) => ({
        url: endpoints.postHoliday,
        method: ApiMethodType.post,
        body: data,
      }),
      invalidatesTags: ["Holiday"],
    }),

    // ✅ Update holiday
    patchHoliday: builder.mutation<
      IHoliday,
      { id: number; data: IHolidayRequest }
    >({
      query: ({ id, data }) => ({
        url: endpoints.patchHoliday(id),
        method: ApiMethodType.PUT,
        body: data,
      }),
      invalidatesTags: ["Holiday"],
    }),
  }),
});

export const {
  useGetHolidaysQuery,
  useDeleteHolidayMutation,
  usePostHolidayMutation,
  usePatchHolidayMutation,
  useGetHolidayByIdQuery,
  useLazyGetHolidayByIdQuery,
} = holidayListApi;
