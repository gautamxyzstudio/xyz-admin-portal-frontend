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
        sx={{ width: "100%" }}
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
    </LocalizationProvider>
  );
};

export default TimePickerInput;
