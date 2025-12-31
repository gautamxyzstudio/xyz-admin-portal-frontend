import { userInState } from "../../auth/authSlice.js";
import { useSelector } from "react-redux";

import type { IAttendance } from "../../dashboard/types.js";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import { convertTo12HourFormat } from "../../../utils/utils.js";
import { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import { useGetAttendanceListQuery } from "../attendanceApi.js";
import { Typography } from "@mui/material";
import DataTable from "../../../shared/components/datatable/DataTable.js";

const AttendanceEmployee = () => {
  const user = useSelector(userInState);
  const [attendanceList, setAttendanceList] = useState<IAttendance[]>([]);
  const { data, isLoading } = useGetAttendanceListQuery({ id: user?.id ?? 0 });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAttendanceList(data);
    }
  }, [data]);
  if (!user || user.id === undefined) return null;

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      width: 160,
      renderCell: (params) => {
        return <Typography>{params.row.Date}</Typography>;
      },
    },
    {
      field: "in",
      headerName: "Check In",
      width: 160,
      renderCell: (params) => {
        return (
          <div className="flex   ">
            <MeetingRoomIcon sx={{ color: "green" }} fontSize="small" />
            <Typography align="center">
              {convertTo12HourFormat(params?.row?.in) ?? "In Time Missing"}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "out",
      headerName: "Check Out ",
      width: 160,
      renderCell: (params) => {
        return (
          <div className="flex  ">
            <DoorFrontIcon sx={{ color: "red" }} fontSize="small" />
            <Typography align="center">
              {convertTo12HourFormat(params?.row?.out) ?? "Out Time Missing"}
            </Typography>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="  mt-4  w-full mb-1">
        <div className="p-5 bg-white rounded-2xl">
          <p className="text-black mb-7 text-2xl font-semibold leading-8">
            Attendence
          </p>
          <DataTable
            rows={attendanceList}
            columns={columns}
            isDataEmpty={attendanceList.length === 0}
            tableHeight={365}
            withPagination={false}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default AttendanceEmployee;
