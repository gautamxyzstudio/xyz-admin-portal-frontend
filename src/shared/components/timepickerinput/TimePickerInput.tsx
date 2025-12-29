import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const TimePickerInput = ({
  value,
  setValue,
  label,
  errorMessage,
  minTime,
}: {
  value: dayjs.Dayjs;
  setValue: (value: dayjs.Dayjs) => void;
  label: string;
  errorMessage?: string;
  minTime?: dayjs.Dayjs;
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MobileTimePicker
        label={label}
        value={value}
        minTime={minTime}
        slotProps={{
          textField: {
            error: !!errorMessage,
            helperText: errorMessage,
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

export default TimePickerInput;
