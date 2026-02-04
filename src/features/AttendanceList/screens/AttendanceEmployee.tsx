import { userInState } from "../../auth/authSlice.js";
import { useSelector } from "react-redux";
import { convertTo12HourFormat } from "../../../utils/utils.js";
import { useMemo, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import { useGetAttendanceListQuery } from "../attendanceApi.js";
import CustomDataTable from "../../../shared/components/customDataTable/CustomDataTable.js";
import CustomBox from "../../../components/CustomBox/CustomBox.js";
import dayjs, { Dayjs } from "dayjs";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { SxProps, Theme } from "@mui/material";

const AttendanceEmployee = () => {
  const user = useSelector(userInState);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const queryArgs = useMemo(
    () => ({
      id: user?.id ?? 0,
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
    }),
    [user?.id, startDate, endDate],
  );
  const {
    data = [],
    isLoading,
    isFetching,
  } = useGetAttendanceListQuery(queryArgs, {
    skip: !user?.id,
    refetchOnMountOrArgChange: true,
  });

  if (!user || user.id === undefined) return null;

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      width: 160,
      renderCell: (params) => {
        return <>{dayjs(params.row.Date).format("DD/MM/YYYY")}</>;
      },
    },
    {
      field: "in",
      headerName: "Check In",
      width: 160,
      renderCell: (params) => convertTo12HourFormat(params?.row?.in),
    },
    {
      field: "out",
      headerName: "Check Out ",
      width: 160,
      renderCell: (params) => convertTo12HourFormat(params?.row?.out),
    },
  ];
  const Calendar = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g opacity="0.5">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.20039 2.4C6.88213 2.4 6.57691 2.52643 6.35186 2.75147C6.12682 2.97652 6.00039 3.28174 6.00039 3.6V4.8H4.80039C4.16387 4.8 3.55342 5.05286 3.10333 5.50295C2.65325 5.95303 2.40039 6.56348 2.40039 7.2V19.2C2.40039 19.8365 2.65325 20.447 3.10333 20.8971C3.55342 21.3471 4.16387 21.6 4.80039 21.6H19.2004C19.8369 21.6 20.4474 21.3471 20.8974 20.8971C21.3475 20.447 21.6004 19.8365 21.6004 19.2V7.2C21.6004 6.56348 21.3475 5.95303 20.8974 5.50295C20.4474 5.05286 19.8369 4.8 19.2004 4.8H18.0004V3.6C18.0004 3.28174 17.874 2.97652 17.6489 2.75147C17.4239 2.52643 17.1187 2.4 16.8004 2.4C16.4821 2.4 16.1769 2.52643 15.9519 2.75147C15.7268 2.97652 15.6004 3.28174 15.6004 3.6V4.8H8.40039V3.6C8.40039 3.28174 8.27396 2.97652 8.04892 2.75147C7.82387 2.52643 7.51865 2.4 7.20039 2.4ZM7.20039 8.4C6.88213 8.4 6.57691 8.52643 6.35186 8.75147C6.12682 8.97652 6.00039 9.28174 6.00039 9.6C6.00039 9.91826 6.12682 10.2235 6.35186 10.4485C6.57691 10.6736 6.88213 10.8 7.20039 10.8H16.8004C17.1187 10.8 17.4239 10.6736 17.6489 10.4485C17.874 10.2235 18.0004 9.91826 18.0004 9.6C18.0004 9.28174 17.874 8.97652 17.6489 8.75147C17.4239 8.52643 17.1187 8.4 16.8004 8.4H7.20039Z"
          fill="#0D0701"
        />
      </g>
    </svg>
  );
  return (
    <CustomBox customClasses="w-full h-full p-5 pb-2 flex flex-col gap-y-6">
      <div className="w-full flex flex-row items-center-safe justify-between">
        <h2 className="text-2xl font-semibold">Attendance</h2>
        <div className="flex flex-row flex-nowrap items-center gap-x-1 text-primary text-base font-semibold">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label="Start date"
              value={dayjs(startDate, "DD/MM/YYYY", true)}
              format="DD/MM/YYYY"
              disableFuture
              onChange={(newValue) => setStartDate(newValue)}
              slots={{ openPickerIcon: Calendar }}
              sx={pickerStyles}
              slotProps={{
                textField: {
                  inputProps: {
                    readOnly: true, 
                  },
                },
              }}
            />
            to
            <DesktopDatePicker
              label="End date"
              value={dayjs(endDate, "DD/MM/YYYY", true)}
              format="DD/MM/YYYY"
              disableFuture
              onChange={(newValue) => setEndDate(newValue)}
              slots={{ openPickerIcon: Calendar }}
              sx={pickerStyles}
            />
          </LocalizationProvider>
        </div>
      </div>

      <div className="h-full w-full">
        <CustomDataTable
          columns={columns}
          rows={data}
          isDataEmpty={data.length === 0}
          emptyViewTitle="No Attendance Found"
          emptyViewSubTitle="Please check in and check out to see your attendance"
          isLoading={isLoading || isFetching}
          withPagination={false}
        />
      </div>
    </CustomBox>
  );
};

export default AttendanceEmployee;

const pickerStyles: SxProps<Theme> = {
  "& .MuiPickersInputBase-sectionsContainer": {
    width: "fit-content",
    padding: "12px 0",
  },
  "& .MuiPickersOutlinedInput-root": {
    borderRadius: "40px",
  },
  "& .MuiInputAdornment-root": {
    margin: 0,
  },
  "& .MuiPickersInputBase-sectionContent": {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "14px",
  },
  "& .MuiInputLabel-root": {
    transform: "translate(14px, 12px) scale(1)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    transform: " translate(14px, -9px) scale(0.75)",
  },
  "& .MuiInputLabel-root.MuiFormLabel-filled": {
    transform: " translate(14px, -9px) scale(0.75)",
  },
};
