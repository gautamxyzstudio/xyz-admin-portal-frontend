/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import EmptyScreenView from "../../../../shared/components/EmptyScreenView/EmptyScreenView";
import dayjs from "dayjs";
import { useLazyGetLatestActivityLogsQuery } from "../../dashboardApi";

interface IActivityLog {
  id: number;
  createdAt: string;
  title: string;
  description: string;
  user: {
    name: string;
  };
}

const ActivityLogs = () => {
  const [page] = useState(1);
  const [activityLogs, setActivityLogs] = useState<IActivityLog[]>([]);
  const [getLatestActivityLogs, { isFetching: isLoading, }] =
  useLazyGetLatestActivityLogsQuery();

const fetchActivityLogs = async () => {
  try {
    const res = await getLatestActivityLogs().unwrap();
    setActivityLogs(res.data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchActivityLogs();
}, []);

 const columns = [
  {
    field: "createdAt",
    headerName: "Created At",
    width: 150,
    renderCell: ({ row }: any) =>
      dayjs(row.attributes?.createdAt).format("DD/MM/YYYY"), // Date only
  },
  {
    field: "title",
    headerName: "Title",
    width: 220,
    renderCell: ({ row }: any) => row.attributes?.title || "-",
  },
 {
  field: "description",
  headerName: "Description",
  width: 450,
  renderCell: ({ row }: any) => row.attributes?.description || "-",
},
  {
    field: "user",
    headerName: "User",
    width: 180,
    renderCell: ({ row }: any) =>
      row.attributes?.users_permissions_user?.data?.attributes?.username || "-",
  },
];

  return (
    <div className="w-full h-100 bg-white rounded-xl flex flex-col mt-3">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-3 flex justify-between rounded-2xl">
        <h3 className="text-[24px] font-semibold text-black">
          Activity Logs
        </h3>

        <a
          href="/activity-logs"
          className="px-4 py-2 text-primary rounded-lg text-base font-bold cursor-pointer"
        >
          View All
        </a>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!isLoading && activityLogs.length === 0 ? (
          <EmptyScreenView
            isDataEmpty
            emptyViewTitle="No activity logs found"
            emptyViewSubTitle="Please check back later"
          />
        ) : (
          <CustomDataTable
            columns={columns}
            rows={activityLogs}
            isLoading={isLoading}
            withPagination
            page={page}
            onPressPageChange={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;