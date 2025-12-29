/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import  dayjs from 'dayjs';

const PickerInput = ({
  value,
  setValue,
  label,
  errorMessage,
  slotProps,
  shouldDisableDate,
  disablePast = false,
}: {
  value: dayjs.Dayjs | null;
  setValue: (value: dayjs.Dayjs) => void;
  label: string;
  errorMessage?: string;
  slotProps?: any;
  shouldDisableDate?: (date: dayjs.Dayjs) => boolean;
  disablePast?: boolean;
}) => {
  const isWeekend = (date: dayjs.Dayjs) => {
    const day = date.day();
    return day === 0 || day === 6;
  };

  const customShouldDisableDate = (date: dayjs.Dayjs) => {
    const isWeekendDate = isWeekend(date);
    const isCustomDisabled = shouldDisableDate
      ? shouldDisableDate(date)
      : false;
    return isWeekendDate || isCustomDisabled;
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        format="DD/MM/YYYY"
        disablePast={disablePast}
        shouldDisableDate={customShouldDisableDate}
        slotProps={{
          textField: {
            error: !!errorMessage,
            helperText: errorMessage,
            ...slotProps?.textField,
          },
        }}
        onChange={(newValue) => {
          if (newValue) setValue(newValue);
        }}
      />
      {errorMessage && (
        <p className="text-xs mt-1 text-red-700">{errorMessage}</p>
      )}
    </LocalizationProvider>
  );
};

export default PickerInput;
