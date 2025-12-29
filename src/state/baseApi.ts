/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type BaseQueryApi,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
  type QueryReturnValue,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type IErrorResponse, transformErrorResponse } from "./types";
import type { RootState } from "./store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, api) => {
    const token = (api.getState() as RootState).auth?.user?.token;
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    if (api.endpoint !== "login") {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (api.endpoint === "uploadFile") {
      headers.delete("Content-Type");
      headers.delete("Accept");
    }

    // console.log(
    //   '############################## API DETAILS START######################################'
    // );
    // console.log('prepareHeaders', JSON.stringify(api));
    // console.log(
    //   '############################## API DETAILS END ######################################'
    // );
    // console.log(
    //   '############################## headers ######################################'
    // );
    // console.log('headers ------', JSON.stringify(headers));
    // console.log(
    //   '############################## headers end ######################################'
    // );
    return headers;
  },
});

const queryFetcher = async (
  args: FetchArgs,
  api: BaseQueryApi,
  extraOptions: any
): Promise<
  QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>
> => {
  // console.log(
  //   '\n############################## Request ######################################',
  //   '\n API ------',
  //   args.url,
  //   '\n Api request ------',
  //   JSON.stringify(args),
  //   '\napi name ------',
  //   JSON.stringify(api)
  // );
  // console.log(
  //   '\n############################## Request End ######################################'
  // );
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    // console.log(
    //   '############################## Error START ######################################'
    // );
    // console.log('Error ------', JSON.stringify(result.error));
    // console.log(
    //   '############################## Error End ######################################'
    // );
    if (result.error.status === "FETCH_ERROR") {
      return {
        error: {
          message: "Your internet is a little wonky right now",
          statusCode: 0,
        } as any,
      };
    } else {
      const transformedError = transformErrorResponse(
        result?.error as IErrorResponse
      );
      return { error: transformedError as any };
    }
  }

  // console.log(
  //   '\n############################## Result START ######################################'
  // );
  // console.log(JSON.stringify(result));
  // console.log(
  //   '\n############################## Result End ######################################'
  // );
  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: queryFetcher as any,
  endpoints: () => ({}),
});
