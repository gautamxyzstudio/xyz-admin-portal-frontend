import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { useGetHolidaysQuery } from "../../holydayListApi";
import { userInState } from "../../../auth/authSlice";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import { Icons } from "../../../../assets/myAssets/exporter";
import { TbPlus } from "react-icons/tb";
import HolidayForm from "../../components/HolidayForm/HolidayForm.js";
import type { GridColDef } from "@mui/x-data-grid";

const HolidayList = () => {
  const user = useSelector(userInState);
  const { data, isLoading } = useGetHolidaysQuery();
  const holidays = data || [];

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<number | null>(null);

  const handleAddHoliday = () => {
    setSelectedHoliday(null); // ✅ IMPORTANT
    setOpenAddDialog(true);
  };

  const handleEditHoliday = (id: number) => {
    setSelectedHoliday(id);
    setOpenAddDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setSelectedHoliday(null); // ✅ CLEAN RESET
  };

  const columns = useMemo(() => {
    const cols: GridColDef[] = [
      {
        field: "name",
        headerName: "Holiday Name",
        width: 220,
      },
      {
        field: "date",
        headerName: "Date",
        width: 180,
        renderCell: (params) =>
          dayjs(params.row?.date).format("DD/MM/YYYY"),
      },
      {
        field: "day",
        headerName: "Day",
        width: 180,
        renderCell: (params) =>
          dayjs(params.row?.date).format("dddd"),
      },
    ];

    if (user?.user_type === "Admin" || user?.user_type === "Hr") {
      cols.push({
        field: "action",
        headerName: "Action",
        width: 100,
        renderCell: (params) => (
          <button onClick={() => handleEditHoliday(params.row.id)}>
            <img src={Icons.EDIT} alt="edit" />
          </button>
        ),
      });
    }

    return cols;
  }, [user]);

  return (
    <CustomBox customClasses="p-5 h-full space-y-6 flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Holiday List</h2>

        {(user?.user_type === "Admin" || user?.user_type === "Hr") && (
          <CustomButton
            label="Add Holiday"
            icon={<TbPlus size={22} />}
            onClick={handleAddHoliday}
          />
        )}
      </div>

      <CustomDataTable
        rows={holidays}
        columns={columns}
        isLoading={isLoading}
        withPagination={false}
        isDataEmpty={holidays.length === 0}
        emptyViewTitle="No holiday found"
        emptyViewSubTitle="There are not any holiday"
      />

      <HolidayForm
        open={openAddDialog}
        holidayId={selectedHoliday}
        onClose={handleCloseDialog}
      />
    </CustomBox>
  );
};


export default HolidayList;
