/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from '../../state/baseApi';
import { ApiMethodType } from '../../state/types';
import  type { IHolidayRequest } from './holydayList.types';
import { apiendpoint } from '../../api/endpoint';

export const enhancedHolidayListApi = baseApi.enhanceEndpoints({
  addTagTypes: ['Holiday'],
});

export const holidayListApi = enhancedHolidayListApi.injectEndpoints({
  endpoints: (builder) => ({
    getHolidays: builder.query<any, void>({
      query: () => ({
        url: apiendpoint.getHolidays,
        method: ApiMethodType.get,
      }),
      providesTags: ['Holiday'],
    }),
    deleteHoliday: builder.mutation<any, number>({
      query: (id) => ({
        url: apiendpoint.deleteHoliday(id),
        method: ApiMethodType.delete,
      }),
      invalidatesTags: ['Holiday'],
    }),
    postHoliday: builder.mutation<any, IHolidayRequest>({
      query: (data) => ({
        url: apiendpoint.postHoliday,
        method: ApiMethodType.post,
        body: data,
      }),
      invalidatesTags: ['Holiday'],
    }),
    patchHoliday: builder.mutation<any, { id: number; data: IHolidayRequest }>({
      query: ({ id, data }) => ({
        url: apiendpoint.patchHoliday(id),
        method: ApiMethodType.PUT,
        body: data,
      }),
      invalidatesTags: ['Holiday'],
    }),
  }),
});

export const {
  useGetHolidaysQuery,
  useDeleteHolidayMutation,
  usePostHolidayMutation,
  usePatchHolidayMutation,
} = holidayListApi;
