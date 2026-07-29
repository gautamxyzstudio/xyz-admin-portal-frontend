/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../state/baseApi";
import { endpoints } from "../../api/endpoints";
import type { ILoginRequest, ILoginResponse } from "./types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ILoginResponse, ILoginRequest>({
      query: (data) => ({ url: endpoints.login, method: "POST", body: data }),
    }),
    userDetails: builder.query<any, { id: number }>({
      query: ({ id }) => ({ url: endpoints.userDetails(id), method: "GET" }),
    }),
    changePassword: builder.mutation<
      any,
      { currentPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: endpoints.changePassword,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLazyUserDetailsQuery,
  useUserDetailsQuery,
  useChangePasswordMutation,
} = authApi;
