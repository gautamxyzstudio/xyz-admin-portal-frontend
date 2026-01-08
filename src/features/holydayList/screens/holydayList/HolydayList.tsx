/* eslint-disable @typescript-eslint/no-explicit-any */
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

import type { IHoliday } from "../../holydayList.types";

import EditHolidayDialog from "../editHoliday/EditHolidayDialog.js";

import AddHolidayDialog from "../addHoliday/AddHolidayDialog.js";

const HolidayList = () => {
  const user = useSelector(userInState);

  const { data, isFetching } = useGetHolidaysQuery();
  const holidays = data?.data || [];

  /* =====================
      DIALOG STATE
  ====================== */
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<IHoliday | null>(null);

  const handleOpenAdd = () => setOpenAddDialog(true);
  const handleCloseAdd = () => setOpenAddDialog(false);

  const handleOpenEdit = (holiday: IHoliday) => {
    setSelectedHoliday(holiday);
    setOpenEditDialog(true);
  };
  const handleCloseEdit = () => {
    setSelectedHoliday(null);
    setOpenEditDialog(false);
  };

  /* =====================
      TABLE COLUMNS
  ====================== */
  const columns = useMemo(() => {
    const cols: any[] = [
      {
        field: "name",
        headerName: "Holiday Name",
        width: 220,
        renderCell: ({ row }: any) => row?.attributes?.Name || row?.Name || "-",
      },
      {
        field: "date",
        headerName: "Date",
        width: 180,

        renderCell: ({ row }: any) =>
          dayjs(row?.attributes?.date || row?.date).format("DD/MM/YYYY"),
      },
      {
        field: "day",
        headerName: "Day",
        width: 180,
        renderCell: ({ row }: any) =>
          dayjs(row?.attributes?.date || row?.date).format("dddd"),
      },
    ];

    if (user?.user_type === "Admin" || user?.user_type === "Hr") {
      cols.push({
        field: "action",
        headerName: "Action",
        width: 100,

        renderCell: ({ row }: any) => (
          <button onClick={() => handleOpenEdit(row)}>
            <img src={Icons.EDIT} alt="edit" />
          </button>
        ),
      });
    }

    return cols;
  }, [user]);

  return (
    <CustomBox customClasses="p-5 h-full space-y-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Holiday List</h2>

        {(user?.user_type === "Admin" || user?.user_type === "Hr") && (
          <CustomButton
            label="Add Holiday"
            icon={<TbPlus size={22} />}
            onClick={handleOpenAdd}
          />
        )}
      </div>

      {/* Table */}
      <CustomDataTable
        rows={holidays}
        columns={columns}
        isLoading={isFetching}
        withPagination={false}
        className="bg-red"
      />

      {/* Add Holiday Dialog */}
      {/* {openAddDialog && (
        <Dialog
          open={openAddDialog}
          onClose={handleCloseAdd}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className="flex justify-between items-center">
            Add Holiday
            <IconButton onClick={handleCloseAdd}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <LinearGradient />
          <DialogContent>
            <AddHolidayForm onClose={handleCloseAdd} />
          </DialogContent>
        </Dialog>
      )} */}

      <AddHolidayDialog open={openAddDialog} onClose={handleCloseAdd} />

      {/* Edit Holiday Dialog */}
      {selectedHoliday && (
        <EditHolidayDialog
          holiday={selectedHoliday}
          open={openEditDialog}
          onClose={handleCloseEdit}
        />
      )}
    </CustomBox>
  );
};

export default HolidayList;
