import React from "react";
import dayjs from "dayjs";
import { getIstTodayDateString } from "../../../utils/istDateUtils";
import ThemedDatePicker from "../../../components/ThemedDatePicker";
import { shiftDayStr } from "../../../components/themedDates";

interface TaskDueDatePickerProps {
  value: string; // YYYY-MM-DD or ""
  onChange: (dateStr: string) => void;
  disabled?: boolean;
}

/** Due-date field for tasks: past days are blocked, with Today / Tomorrow / Clear. */
export const TaskDueDatePicker: React.FC<TaskDueDatePickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const todayStr = getIstTodayDateString();
  return (
    <ThemedDatePicker
      value={value}
      onChange={onChange}
      min={todayStr}
      disabled={disabled}
      placeholder="No due date"
      format={(d) => dayjs(d).format("DD MMM YYYY")}
      clearable
      shortcuts={[
        { label: "Today", day: todayStr },
        { label: "Tomorrow", day: shiftDayStr(todayStr, 1) },
      ]}
    />
  );
};

export default TaskDueDatePicker;
