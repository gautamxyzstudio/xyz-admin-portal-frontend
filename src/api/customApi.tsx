/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer } from "react";
import type { IUserMutationArgs, IUserMutationState } from "./types";
import axios, { AxiosError } from "axios";

export const useMutation = () => {
  const [state, updateState] = useReducer(
    (prev: IUserMutationState, next: IUserMutationState) => {
      return { ...prev, ...next };
    },
    { data: null, error: null }
  );

  const makeRequest = async (args: IUserMutationArgs) => {
    const data = args.body;
    const headers = args.token
      ? {
          Authorization: `Bearer ${args.token}`,
        }
      : {};
    const config = { headers };
    try {
      updateState({ isLoading: true });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout Error")), 5000)
      );
      const result: any = await Promise.race([
        args.type === "get"
          ? axios[args.type](args.url, config)
          : axios[args.type](args.url, data, config),
        timeoutPromise,
      ]);

      if (result.data) {
        updateState({ data: result.data, isSuccess: true });
        return result.data;
      } else {
        const error = {
          statusCode: result.data?.status ?? 0,
          message: result.data?.message ?? "Something went wrong",
        };
        updateState({
          error: error,
          isError: true,
        });
        throw error;
      }
    } catch (error) {
      const customError = error as AxiosError;
      console.log("====================================");
      console.log(JSON.stringify(error));
      console.log("====================================");
      const filteredError = {
        statusCode: customError.response?.status ?? 0,
        message: customError.message ?? "Something went wrong",
      };
      updateState({
        error: filteredError,
        isError: true,
      });
      throw filteredError;
    } finally {
      updateState({
        isLoading: false,
      });
    }
  };

  return {
    isLoading: state.isLoading,
    isError: state.isError,
    isSuccess: state.isSuccess,
    data: state.data,
    error: state.error,
    makeRequest,
  };
};
