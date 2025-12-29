/* eslint-disable react-hooks/rules-of-hooks */
import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout/index.jsx";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar/index.jsx";
import MDBox from "../../../components/MDBox/MDBox.js";
import { userInState } from "../../auth/authSlice.js";
import { useSelector } from "react-redux";
import MDTypography from "../../../components/MDTypography/index.js";
import DataTable from "../../../shared/components/datatable/DataTable.js";
import type { IAttendance } from "../../dashboard/types.js";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import { convertTo12HourFormat } from "../../../utils/utils.js";
import { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import { useGetAttendanceListQuery } from "../attendanceApi.js";

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
            <MDTypography align="center">
              {convertTo12HourFormat(params?.row?.in) ?? "In Time Missing"}
            </MDTypography>
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
            <MDTypography align="center">
              {convertTo12HourFormat(params?.row?.out) ?? "Out Time Missing"}
            </MDTypography>
          </div>
        );
      },
    },
    {
      field: "date",
      headerName: "Date",
      width: 160,
      renderCell: (params) => {
        return <MDTypography align="center">{params.row.Date}</MDTypography>;
      },
    },
  ];

  return (
    <>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <MDBox
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
          <MDTypography variant="h6" color="white">
            Attendance List
          </MDTypography>
        </MDBox>
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
      </MDBox>
    </>
  );
};

export default AttendanceEmployee;
