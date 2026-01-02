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
import CustomDataTable from "../../../shared/components/customDataTable/CustomDataTable.js";

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
      {/* <Box pt={3} pb={3}> */}
      {/* <Box
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
        </Box> */}
      <div>
        <div className="h-[70vh]  mt-4  w-full">
          <CustomDataTable
            columns={columns}
            rows={attendanceList}
            isDataEmpty={attendanceList.length === 0}
            emptyViewTitle="No Attendance Found"
            emptyViewSubTitle="Please check in and check out to see your attendance"
            isLoading={isLoading}
            withPagination={false}
          />
        </div>
      </div>
    </>
  );
};

export default AttendanceEmployee;
