/* eslint-disable react-hooks/rules-of-hooks */
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar/index.jsx";
import { userInState } from "../../auth/authSlice.js";
import { useSelector } from "react-redux";
import DataTable from "../../../shared/components/dataTable/DataTable.js";
import type { IAttendance } from "../../dashboard/types.js";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import { convertTo12HourFormat } from "../../../utils/utils.js";
import { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import { useGetAttendanceListQuery } from "../attendanceApi.js";
import { Typography, Box } from "@mui/material";

const AttendanceEmployee = () => {
  const user = useSelector(userInState);
  const [attendanceList, setAttendanceList] = useState<IAttendance[]>([]);
  const { data, isLoading } = useGetAttendanceListQuery({ id: user?.id ?? 0 });

  useEffect(() => {
    if (data) {
      setAttendanceList(data);
    }
  }, [data]);
  if (!user || user.id === undefined) return null;

  const columns: GridColDef[] = [
    {
      field: "in",
      headerName: "In Time",
      width: 160,
      renderCell: (params) => {
        return (
          <div className="flex items-center justify-center">
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
      headerName: "Out Time",
      width: 160,
      renderCell: (params) => {
        return (
          <div className="flex items-center justify-center">
            <DoorFrontIcon sx={{ color: "red" }} fontSize="small" />
            <Typography align="center">
              {convertTo12HourFormat(params?.row?.out) ?? "Out Time Missing"}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "date",
      headerName: "Date",
      width: 160,
      renderCell: (params) => {
        return <Typography align="center">{params.row.Date}</Typography>;
      },
    },
  ];

  return (
    <>
      <DashboardNavbar />
      <Box pt={3} pb={3}>
        <Box
          mx={2}
          mt={-3}
          py={3}
          px={2}
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
          variant="gradient"
          bgColor="warning"
          borderRadius="lg"
          coloredShadow="dark"
        >
          <Typography variant="h6" color="white">
            Attendance List
          </Typography>
        </Box>
        <div>
          <div className="h-[70vh]  mt-4  w-full">
            <DataTable
              columns={columns}
              rows={attendanceList}
              isDataEmpty={attendanceList.length === 0}
              emptyViewTitle="No Attendance Found"
              emptyViewSubTitle="Please check in and check out to see your attendance"
              isLoading={isLoading}
              withPagination={false}
              tableHeightPercent={100}
            />
          </div>
        </div>
      </Box>
    </>
  );
};

export default AttendanceEmployee;
