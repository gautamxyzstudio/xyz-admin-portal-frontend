/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Icon, Typography } from "@mui/material";
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
import CustomBox from "../../../../components/CustomBox/CustomBox.js";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable.js";

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
          <Button
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
          </Button>
        )}
        {(user?.user_type === "Admin" || user?.user_type === "Hr") && (
          <Button
            variant="text"
            onClick={() => {
              deleteHolidayHandler(params.row.id);
            }}
          >
            <Icon>delete</Icon>&nbsp;delete
          </Button>
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
        <Typography
          display="block"
          variant="body2"
          color="text"
          fontWeight="medium"
        >
          {params.row.attributes?.Name || params.row.Name}
        </Typography>
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
          <Typography
            display="block"
            variant="body2"
            color="text"
            fontWeight="medium"
          >
            {formattedDate}
          </Typography>
        );
      },
    },
    {
      field: "day",
      headerName: "Day",
      width: 250,
      renderCell: (params) => (
        <Typography
          display="block"
          variant="body2"
          color="text"
          fontWeight="medium"
        >
          {dayjs(params.row.attributes?.date || params.row.date).format("dddd")}
        </Typography>
      ),
    },
  ];

  // Conditionally add the action column
  if (user?.user_type === "Admin" || user?.user_type === "Hr") {
    columns.push(actionColumn);
  }

  return (
    <CustomBox customClasses="p-5 h-full w-full flex flex-col space-y-7">
      <p className="text-black text-2xl font-semibold">
        Holiday List
      </p>
      <CustomDataTable
        customStyles="pb-10"
        rows={holidays}
        columns={columns}
        isDataEmpty={holidays.length === 0}
        tableHeight={365}
        withPagination={false}
        isLoading={isLoading}
      />
    </CustomBox>
  );
};

export default HolydayList;
