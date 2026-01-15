import { TbPlus } from "react-icons/tb";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import AnnouncementDialog from "../../components/AnnouncementDialog/AnnouncementDialog";
import { useState } from "react";
import { useGetAnnouncementsQuery } from "../../announcementsApi";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import type { GridColDef } from "@mui/x-data-grid";
import { Icons } from "../../../../assets/myAssets/exporter";
import dayjs from "dayjs";
import { MdBlock } from "react-icons/md";

const AnnouncementsList = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [announcementId, setAnnouncementId] = useState<number | null>(null);
  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAnnouncementsQuery();

  const handleSuccess = () => {
    refetch();
    setOpenDialog(false);
  };

  const dangerTitles = [
    "Happy Birthday!",
    "Work Anniversary",
    "New Employee Joined",
  ];

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Announcement title",
      width: 200,
      renderCell: (params) => params.row.title,
    },
    {
      field: "date",
      headerName: "Announcement Date",
      width: 200,
      renderCell: (params) => dayjs(params.row.date).format("DD/MM/YYYY"),
    },
    {
      field: "day",
      headerName: "Announcement Day",
      width: 200,
      renderCell: (params) => dayjs(params.row.date).format("ddd"),
    },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      renderCell: (params) => {
        const isDanger = dangerTitles.includes(params.row.title);

        if (isDanger) {
          return (
            <button
              disabled
              className="px-1 py-1 text-sm rounded p-1 bg-background text-black-50 cursor-not-allowed"
            >
              <MdBlock size={20} />
            </button>
          );
        }

        return (
          <button
            className="rounded p-1 bg-background cursor-pointer"
            onClick={() => {
              setAnnouncementId(params.row.id);
              setOpenDialog(true);
            }}
          >
            <img src={Icons.EDIT} alt="edit" />
          </button>
        );
      },
    },
  ];

  return (
    <CustomBox customClasses="w-full h-full flex flex-col gap-y-4.5 px-5 py-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Announcement</h2>

        <CustomButton
          label="Add Announcement"
          icon={<TbPlus size={22} />}
          onClick={() => {
            setAnnouncementId(null);
            setOpenDialog(true);
          }}
        />
      </div>
      <CustomDataTable
        rows={data}
        columns={columns}
        isLoading={isLoading || isFetching}
        withPagination={false}
        isDataEmpty={data?.length === 0}
        emptyViewTitle="No Announcement found"
        emptyViewSubTitle="There are not any Announcement"
      />
      <AnnouncementDialog
        open={openDialog}
        onSuccess={handleSuccess}
        announcementId={announcementId}
        onClose={() => {
          setOpenDialog(false);
          setAnnouncementId(null);
        }}
      />
    </CustomBox>
  );
};

export default AnnouncementsList;
