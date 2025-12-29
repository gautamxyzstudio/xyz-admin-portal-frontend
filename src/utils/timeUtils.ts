/**
 * Utility functions for time formatting
 */

/**
 * Converts API time format (HH:mm:ss.SSS) to input format (HH:mm)
 * @param time - Time string in various formats
 * @returns Formatted time string for input fields
 */
export const formatTimeForInput = (time: string): string => {
  if (!time) return '';

  // Remove milliseconds and seconds if present
  return time.split('.')[0].split(':').slice(0, 2).join(':');
};

/**
 * Ensures time is in HH:mm:ss.SSS format for API calls
 * @param time - Time string in various formats
 * @returns Formatted time string for API
 */
export const formatTimeForAPI = (time: string): string => {
  if (!time) return '';

  // If time is already in HH:mm:ss format, add .000 for milliseconds
  if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return `${time}.000`;
  }

  // If time is in HH:mm format, add :00.000 for seconds and milliseconds
  if (time.match(/^\d{2}:\d{2}$/)) {
    return `${time}:00.000`;
  }

  // If already in correct format, return as is
  if (time.match(/^\d{2}:\d{2}:\d{2}\.\d{3}$/)) {
    return time;
  }

  // Default fallback
  return `${time}:00.000`;
};

/**
 * Validates time format
 * @param time - Time string to validate
 * @returns Boolean indicating if time is valid
 */
export const isValidTimeFormat = (time: string): boolean => {
  if (!time) return false;

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Converts time to 12-hour format for display
 * @param time - Time string in 24-hour format
 * @returns Time string in 12-hour format
 */
export const convertTo12HourFormat = (time: string): string => {
  if (!time) return '';

  // Extract hours and minutes
  const [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) return '';

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${period}`;
};
