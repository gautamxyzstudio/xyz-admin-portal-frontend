import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout/index.jsx";
import DashboardNavbar from "../../../../examples/Navbars/DashboardNavbar/index.jsx";
import MDBox from "../../../../components/MDBox/MDBox";
import Grid from "@mui/material/Grid";
import MDTypography from "../../../../components/MDTypography";
import MDButton from "../../../../components/MDButton/MDButton";
import DataTable from "../../../../shared/components/datatable/DataTable";
import { Card, Icon } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  useDeleteHolidayMutation,
  useGetHolidaysQuery,
} from "../../holydayListApi";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { userInState } from "../../../auth/authSlice";
import type { GridColDef } from "@mui/x-data-grid";

const HolydayList = () => {
  const user = useSelector(userInState);

  const { setIsLoading } = useLoadingWrapper();
  const { data: holidaysResponse, isFetching: isLoading } =
    useGetHolidaysQuery();
  const holidays = holidaysResponse?.data || [];

  const [deleteHoliday] = useDeleteHolidayMutation();
  const navigate = useNavigate();

  const deleteHolidayHandler = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteHoliday(id).unwrap();
      toast.success("Holiday deleted successfully");
    } catch (error) {
      toast.error((error as any)?.message ?? "Something went wrong");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const actionColumn: GridColDef = {
    field: "action",
    headerName: "Action",
    flex: 0.8,
    minWidth: 120,
    renderCell: (params) => (
      <div className="flex flex-row gap-x-3">
        {(user?.user_type === "Admin" || user?.user_type === "Hr") && (
          <MDButton
            variant="text"
            color="info"
            onClick={() => {
              navigate(`/holidays/edit/${params.row.id}`, {
                state: {
                  holiday: params.row,
                },
              });
            }}
          >
            <Icon>edit</Icon>&nbsp;edit
          </MDButton>
        )}
        {(user?.user_type === "Admin" || user?.user_type === "Hr") && (
          <MDButton
            variant="text"
            color="dark"
            onClick={() => {
              deleteHolidayHandler(params.row.id);
            }}
          >
            <Icon>delete</Icon>&nbsp;delete
          </MDButton>
        )}
      </div>
    ),
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Holiday Name",
      width: 350,
      renderCell: (params) => (
        <MDTypography
          display="block"
          variant="body2"
          color="text"
          fontWeight="medium"
        >
          {params.row.attributes?.Name || params.row.Name}
        </MDTypography>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 250,
      renderCell: (params) => {
        const rawDate = params.row.attributes?.date || params.row.date;
        const formattedDate = dayjs(rawDate).isValid()
          ? dayjs(rawDate).format("DD/MM/YYYY")
          : "Invalid date";

        return (
          <MDTypography
            display="block"
            variant="body2"
            color="text"
            fontWeight="medium"
          >
            {formattedDate}
          </MDTypography>
        );
      },
    },
    {
      field: "day",
      headerName: "Day",
      width: 250,
      renderCell: (params) => (
        <MDTypography
          display="block"
          variant="body2"
          color="text"
          fontWeight="medium"
        >
          {dayjs(params.row.attributes?.date || params.row.date).format("dddd")}
        </MDTypography>
      ),
    },
  ];

  // Conditionally add the action column
  if (user?.user_type === "Admin" || user?.user_type === "Hr") {
    columns.push(actionColumn);
  }

  return (
    <>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
    
        </Grid>
        <Card>
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
            <MDTypography variant="h5" color="white">
              Holiday List
            </MDTypography>
            {(user?.user_type === "Admin" || user?.user_type === "Hr") && (
              <MDButton
                variant="contained"
                color="orange"
                onClick={() => navigate("/holidays/add")}
              >
                Add Holiday
              </MDButton>
            )}
          </MDBox>

          <div className="h-[70vh] mt-4 w-full">
            <DataTable
              columns={columns}
              rows={holidays}
              isDataEmpty={holidays.length === 0}
              emptyViewTitle="No Holidays Found"
              emptyViewSubTitle="Please add a holiday to the system"
              isLoading={isLoading}
              withPagination={false}
              tableHeightPercent={100}
            />
          </div>
        </Card>
      </MDBox>
    </>
  );
};

export default HolydayList;
