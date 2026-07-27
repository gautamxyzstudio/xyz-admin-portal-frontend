import { useEffect, useMemo, useState } from "react";
import { Pagination } from "@mui/material";
import dayjs from "dayjs";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import { useLazyGetAllActivityLogsQuery } from "../../dashboardApi";

const PAGE_SIZE = 10;

const ViewAllActivityLogs = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const [getAllActivityLogs, { isFetching: isLoading }] =
  useLazyGetAllActivityLogsQuery();

  const fetchActivityLogs = async () => {
    try {
      const res = await getAllActivityLogs().unwrap();
   

      const formattedRows = res.data.map((item: any) => ({
        id: item.id,
        createdAt: item.attributes?.createdAt,
        title: item.attributes?.title,
        description: item.attributes?.description,
        user:
          item.attributes?.users_permissions_user?.data?.attributes?.username ||
          "-",
      }));

      setRows(formattedRows);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const columns = useMemo(
    () => [
      {
        field: "createdAt",
        headerName: "Created At",
        width: 140,
        renderCell: ({ row }: any) =>
          dayjs(row.createdAt).format("DD/MM/YYYY"),
      },
      {
        field: "title",
        headerName: "Title",
        width: 180,
      },
      {
        field: "description",
        headerName: "Description",
        width: 450,
      },
      {
        field: "user",
        headerName: "User",
        width: 180,
      },
    ],
    []
  );

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

 return (
  <div className="w-full flex flex-col gap-6">
    <h2 className="text-3xl font-semibold">Activity Logs</h2>

    <div className="bg-white rounded-xl p-6">
      <div className="h-[500px] overflow-y-auto">
        <CustomDataTable
          rows={paginatedRows}
          columns={columns}
          tableHeight={450}
          isLoading={isLoading}
          withPagination={false}
          isDataEmpty={!isLoading && paginatedRows.length === 0}
          emptyViewTitle="No activity logs found"
          emptyViewSubTitle="There are no activity logs available."
        />
      </div>

      {/* Pagination */}
      {rows.length > PAGE_SIZE && (
        <div className="flex justify-center mt-6">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 500,
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                backgroundColor: "#FF7300",
                color: "#fff",
              },
            }}
          />
        </div>
      )}
    </div>
  </div>
);
};

export default ViewAllActivityLogs;