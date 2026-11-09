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
    notifications : builder.query<any, void>({
      query: () => ({
        url: endpoints.getNotifications,
        method: "GET",
      }),
  }),
})

});

export const { useUploadFileMutation, useNotificationsQuery } = sharedApi;
