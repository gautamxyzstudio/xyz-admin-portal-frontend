import { useState, useCallback } from 'react';

interface FilterConfig {
  minDate?: string;
  maxDate?: string;
  currentYear?: number;
}

/**
 * Custom hook for managing filter state
 */
export const useFilterState = (config?: FilterConfig) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateError, setDateError] = useState('');

  // Get current year's January 1st and today's date
  const currentYear = config?.currentYear || new Date().getFullYear();
  const minDate = config?.minDate || `${currentYear}-01-01`;
  const maxDate = config?.maxDate || new Date().toISOString().split('T')[0];

  const validateDates = useCallback(() => {
    if (!startDate || !endDate) {
      setDateError('Please select both start and end dates');
      return false;
    }

    if (startDate < minDate) {
      setDateError(`Start date cannot be before January 1st, ${currentYear}`);
      return false;
    }

    if (endDate > maxDate) {
      setDateError('End date cannot be after today');
      return false;
    }

    if (startDate > endDate) {
      setDateError('Start date cannot be after end date');
      return false;
    }

    setDateError('');
    return true;
  }, [startDate, endDate, minDate, maxDate, currentYear]);

  const clearFilters = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setDateError('');
  }, []);

  const clearDateError = useCallback(() => {
    setDateError('');
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
