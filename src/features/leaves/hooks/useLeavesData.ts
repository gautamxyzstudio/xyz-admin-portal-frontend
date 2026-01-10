/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import type { ILeave } from "../leaves.types";
// import { useLoadingWrapper } from "../../../wrappers/loadingWrapper/LoadingWrapper.context";
import { toast } from "react-toastify";
import { useLazyGetAllUserLeavesQuery } from "../leavesApi";

// Custom hook for leaves data management
export const useLeavesData = () => {
  const [getAllLeaves, { isFetching, isLoading }] = useLazyGetAllUserLeavesQuery();
  const [leavesData, setLeavesData] = useState<ILeave[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fetchError, setFetchError] = useState<string>("");

  const fetchLeaves = useCallback(
  async (
    params: {
      page: number;
      username?: string;
    },
  ) => {
    

    try {
      setFetchError("");

      const response = await getAllLeaves({
        page: params.page,
        username: params.username?.trim() || undefined,
      }).unwrap();

      setLeavesData(response.data);
      setTotalPages(response.pagination?.pageCount || 0);
      setPage(response.pagination?.page || params.page);

      return response;
    } catch (error: any) {
      setLeavesData([]);
      const errorMessage =
        error?.data?.message ||
        error?.error ||
        "Failed to fetch leaves. Please try again.";
      setFetchError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } 
  },
  [getAllLeaves]
);


  const clearFetchError = useCallback(() => {
    setFetchError("");
  }, []);

  return {
    leavesData,
    page,
    totalPages,
    isFetching,
    isLoading,
    fetchError,
    fetchLeaves,
    clearFetchError,
  };
};
