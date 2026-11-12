/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from '../../state/baseApi';
import { endpoints } from "../../api/endpoints";
import { ApiMethodType } from '../../state/types';
import type { IImageUploadResponse } from './types';
import { compressFormDataImages } from '../../utils/compressImage';

export const sharedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<IImageUploadResponse, FormData>({
      // photos are compressed in the browser before being sent
      async queryFn(formData, _api, _extra, baseQuery) {
        const body = await compressFormDataImages(formData);
        const result = await baseQuery({
          url: endpoints.uploadFiles,
          method: ApiMethodType.post,
          body,
          formData: true,
        } as any);
        return result.error
          ? { error: result.error }
          : { data: result.data as IImageUploadResponse };
      },
    }),
    notifications: builder.query<any[], void>({
      query: () => ({
        url: endpoints.getNotifications,
        method: "GET",
        params: { limit: 50 },
      }),
      transformResponse: (res: any) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []),
    }),
    // Both mutations update the cached list right away (badge + drawer),
    // and roll back if the server call fails.
    markNotificationRead: builder.mutation<any, number | string>({
      query: (id) => ({
        url: endpoints.markNotificationRead(id),
        method: "PUT",
        body: {},
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          sharedApi.util.updateQueryData("notifications", undefined, (draft) => {
            const n = draft?.find((x: any) => String(x.id) === String(id));
            if (n) n.isRead = true;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    markAllNotificationsRead: builder.mutation<any, void>({
      query: () => ({
        url: endpoints.markAllNotificationsRead,
        method: "PUT",
        body: {},
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          sharedApi.util.updateQueryData("notifications", undefined, (draft) => {
            draft?.forEach((x: any) => {
              x.isRead = true;
            });
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useUploadFileMutation,
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = sharedApi;
