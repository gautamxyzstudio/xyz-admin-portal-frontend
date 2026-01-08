/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";

interface PickerInputProps {
  value: Dayjs | null;
  setValue: (value: Dayjs) => void;
  label: string;
  errorMessage?: string;
  slotProps?: any;
  shouldDisableDate?: (date: Dayjs) => boolean;
  disablePast?: boolean;
  disableFuture?: Dayjs;
}

const PickerInput = ({
  value,
  setValue,
  label,
  errorMessage,
  slotProps,
  shouldDisableDate,
  disablePast = false,
}: PickerInputProps) => {
  const isWeekend = (date: Dayjs) => {
    const day = date.day();
    return day === 0 || day === 6;
  };

  const customShouldDisableDate = (date: Dayjs) => {
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
        disableFuture
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
