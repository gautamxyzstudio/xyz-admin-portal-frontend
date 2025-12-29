/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { toast } from "react-toastify";

/**
 * Custom hook for common API operations
 */
export const useApiOperations = () => {
  /**
   * Executes an API operation with loading state and error handling
   * @param operation - Async function to execute
   * @param loadingSetter - Function to set loading state
   * @param successMessage - Optional success message
   * @param errorMessage - Optional error message
   * @returns Promise with the operation result
   */
  const executeWithLoading = useCallback(
    async <T>(
      operation: () => Promise<T>,
      loadingSetter: (loading: boolean) => void,
      successMessage?: string,
      errorMessage?: string
    ): Promise<T | undefined> => {
      loadingSetter(true);

      try {
        const result = await operation();

        if (successMessage) {
          toast.success(successMessage);
        }

        return result;
      } catch (error: any) {
        const message =
          errorMessage || error?.message || "Something went wrong";
        toast.error(message);
        throw error;
      } finally {
        loadingSetter(false);
      }
    },
    []
  );

  /**
   * Executes an API operation with retry logic
   * @param operation - Async function to execute
   * @param maxRetries - Maximum number of retries
   * @param delay - Delay between retries in milliseconds
   * @returns Promise with the operation result
   */
  const executeWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      maxRetries: number = 3,
      delay: number = 1000
    ): Promise<T> => {
      let lastError: any;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error;

          if (attempt === maxRetries) {
            throw error;
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }

      throw lastError;
    },
    []
  );

  /**
   * Handles API errors with specific error messages
   * @param error - Error object
   * @param defaultMessage - Default error message
   * @returns Formatted error message
   */
  const handleApiError = useCallback(
    (error: any, defaultMessage: string = "Something went wrong"): string => {
      if (error?.status === 404) {
        return "Resource not found";
      } else if (error?.status === 403) {
        return "You are not authorized to perform this action";
      } else if (error?.status === 400) {
        return "Invalid request. Please check your input.";
      } else if (error?.status === 500) {
        return "Server error. Please try again later.";
      } else if (error?.data?.message) {
        return error.data.message;
      } else if (error?.message) {
        return error.message;
      }

      return defaultMessage;
    },
    []
  );

  return {
    executeWithLoading,
    executeWithRetry,
    handleApiError,
  };
};
