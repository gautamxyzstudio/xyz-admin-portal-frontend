/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import { useGetHolidaysQuery } from "../../holydayListApi";
import { userInState } from "../../../auth/authSlice";

import CustomBox from "../../../../components/CustomBox/CustomBox";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import CustomButton from "../../../../components/CustomButton/CustomButton";

import { Icons } from "../../../../assets/myAssets/exporter";
import { TbPlus } from "react-icons/tb";
import AddHolidayForm from "../../components/addHolidayForm/AddHolidayForm";

const HolydayList = () => {
  const user = useSelector(userInState);
  const navigate = useNavigate();

  const { data, isFetching } = useGetHolidaysQuery();
  const holidays = data?.data || [];

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const columns = useMemo(() => {
    const cols: any[] = [
      {
        field: "name",
        headerName: "Holiday Name",
        width: 220,
        renderCell: ({ row }: any) =>
          row?.attributes?.Name || row?.Name || "-",
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
          <button
            onClick={() =>
              navigate(`/holidays/edit/${row.id}`, {
                state: { holiday: row },
              })
            }
          >
            <img src={Icons.EDIT} alt="edit" />
          </button>
        ),
      });
    }

    return cols;
  }, [user, navigate]);

  return (
    <CustomBox customClasses="p-5 h-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Holiday List</h2>

        {(user?.user_type === "Admin" || user?.user_type === "Hr") && (
          <CustomButton
            label="Add Holiday"
            icon={<TbPlus size={22} />}
            onClick={() => setOpenAddDialog(true)}
          />
        )}
      </div>

      {/* Table */}
      <CustomDataTable
        rows={holidays}
        columns={columns}
        isLoading={isFetching}
        withPagination={false}
      />

      {/* Dialog */}
      {openAddDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-120 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Holiday</h3>
              <button
                onClick={() => setOpenAddDialog(false)}
                className="text-xl text-gray-500"
              >
                ✕
              </button>
            </div>

            <AddHolidayForm onClose={() => setOpenAddDialog(false)} />
          </div>
        </div>
      )}
    </CustomBox>
  );
};

export default HolydayList;
