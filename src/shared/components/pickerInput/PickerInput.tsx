/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DatePicker,
  LocalizationProvider,
  type DatePickerProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";

interface PickerInputProps extends DatePickerProps {
  value: Dayjs | null;
  setValue: (value: Dayjs) => void;
  label: string;
  errorMessage?: string;
  slotProps?: any;
  shouldDisableDate?: (date: Dayjs) => boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
  disableWeekend?: boolean;
  disableTyping?: boolean;
  popperPlacement?:
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end";
}

const PickerInput = ({
  value,
  setValue,
  label,
  errorMessage,
  slotProps,
  shouldDisableDate,
  disableFuture = false,
  disablePast = false,
  disableWeekend = true,
  disableTyping = false,
  popperPlacement = "bottom-start",
  sx,
}: PickerInputProps) => {
  const isWeekend = (date: Dayjs) => {
    const day = date.day();
    return day === 0 || day === 6;
  };

  const customShouldDisableDate = (date: Dayjs) => {
    const isWeekendDate = disableWeekend ? isWeekend(date) : false;
    const isCustomDisabled = shouldDisableDate
      ? shouldDisableDate(date)
      : false;

    return isWeekendDate || isCustomDisabled;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="w-full max-w-full flex flex-col">
        <DatePicker
          sx={{ ...sx, width: "100%" }}
          label={label}
          value={value}
          format="DD/MM/YYYY"
          disablePast={disablePast}
          disableFuture={disableFuture}
          shouldDisableDate={customShouldDisableDate}
          slotProps={{
            textField: {
              error: !!errorMessage,
              helperText: errorMessage,

              ...(disableTyping && {
                onKeyDown: (e) => e.preventDefault(),
                onPaste: (e) => e.preventDefault(),
                inputProps: {
                  readOnly: true,
                  style: { cursor: "pointer" },
                },
              }),

              ...slotProps?.textField,
            },

            popper: {
              placement: popperPlacement,
              modifiers: [
                {
                  name: "flip",
                  enabled: false,
                },
              ],
            },
          }}
          onChange={(newValue) => {
            if (newValue) setValue(newValue);
          }}
        />
      </div>
    </LocalizationProvider>
  );
};

export default PickerInput;
