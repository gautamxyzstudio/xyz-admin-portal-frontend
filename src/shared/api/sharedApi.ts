/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from '../../state/baseApi';
import { endpoints } from "../../api/endpoints";
import { ApiMethodType } from '../../state/types';
import type { IImageUploadResponse } from './types';

export const sharedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<IImageUploadResponse, FormData>({
      query: (formData: FormData) => ({
        url: endpoints.uploadFiles,
        method: ApiMethodType.post,
        body: formData,
        formData: true,
      }),
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
