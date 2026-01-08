import dayjs, { Dayjs } from "dayjs";
import { useState, useCallback } from "react";

interface FilterConfig {
  minDate?: string;
  maxDate?: string;
  currentYear?: number;
}

/**
 * Custom hook for managing filter state
 */
export const useFilterState = (config?: FilterConfig) => {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateError, setDateError] = useState("");

// Get current year's January 1st and today's date
const currentYear = config?.currentYear ?? dayjs().year();

const minDate =
  config?.minDate
    ? dayjs(config.minDate)
    : dayjs(`${currentYear}-01-01`);

const maxDate =
  config?.maxDate
    ? dayjs(config.maxDate)
    : dayjs(); // today

const validateDates = useCallback(() => {
  if (!startDate || !endDate) {
    setDateError("Please select both start and end dates");
    return false;
  }

  if (startDate.isBefore(minDate)) {
    setDateError(`Start date cannot be before January 1st, ${currentYear}`);
    return false;
  }

  if (endDate.isAfter(maxDate)) {
    setDateError("End date cannot be after today");
    return false;
  }

  if (startDate.isAfter(endDate)) {
    setDateError("Start date cannot be after end date");
    return false;
  }

  setDateError("");
  return true;
}, [startDate, endDate, minDate, maxDate, currentYear]);


  const clearFilters = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setSearchQuery("");
    setDateError("");
  }, []);

  const clearDateError = useCallback(() => {
    setDateError("");
  }, []);

  const getFilterParams = useCallback(
    () => ({
      startDate,
      endDate,
      search: searchQuery,
    }),
    [startDate, endDate, searchQuery]
  );

  const hasActiveFilters = useCallback(() => {
    return !!(startDate || endDate || searchQuery.trim());
  }, [startDate, endDate, searchQuery]);

  return {
    // State
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    dateError,
    setDateError,

    // Configuration
    minDate,
    maxDate,
    currentYear,

    // Methods
    validateDates,
    clearFilters,
    clearDateError,
    getFilterParams,
    hasActiveFilters,
  };
};
