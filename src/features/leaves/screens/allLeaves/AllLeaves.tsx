import { useEffect, useState, useCallback } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import { TextField, InputAdornment, Pagination } from "@mui/material";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable.js";
import CustomBox from "../../../../components/CustomBox/CustomBox.js";
import { useLeavesData } from "../../hooks/useLeavesData.js";
import LeaveRequestsHr from "../leaveRequestsHr/LeaveRequestsHr.js";
import { ImSearch } from "react-icons/im";
import CustomButton from "../../../../components/CustomButton/CustomButton.js";
import dayjs from "dayjs";
import { getLeaveCategoryTitle } from "../../utils.js";
import { getLeaveStatusColor } from "../../../../utils/utils.js";
import { useDebounce } from "../../../../hooks/useDebounce.js";
import LeaveDetailsDialog from "../../components/leaveDetailsDialog/leaveDetailsDialog.js";

const AllLeaves = () => {
  const {
    leavesData,
    page,
    totalPages,
    isFetching,
    isLoading,
    fetchError,
    fetchLeaves,
    clearFetchError,
  } = useLeavesData();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [leaveId, setLeaveId] = useState<string | null>(null);

  // Load current data on mount
  useEffect(() => {
    fetchLeaves({
      page: 1,
      username: debouncedSearch.trim() || undefined,
    }).catch(() => {});
  }, [debouncedSearch, fetchLeaves]);

  // Pagination
  const handlePageChange = useCallback(
    async (newPage: number) => {
      await fetchLeaves({
        page: newPage,
        username: debouncedSearch.trim() || undefined,
      }).catch(() => {});
    },
    [fetchLeaves, debouncedSearch]
  );

  const columns: GridColDef[] = [
    {
      field: "startDate",
      headerName: "Start Date",
      width: 100,
      renderCell: (params) => dayjs(params.row.start_date).format("DD/MM/YYYY"),
    },
    {
      field: "user",
      headerName: "Employee Name",
      width: 160,
      renderCell: (params) => params.row.user.username,
    },
    {
      field: "title",
      headerName: "Title",
      width: 200,
      renderCell: (params) => params.row.title,
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      width: 130,
      renderCell: (params) => getLeaveCategoryTitle(params.row.leave_category),
    },
    {
      field: "status",
      headerName: "Status",
      width: 80,
      renderCell: (params) => {
        return (
          <span
            className={`${getLeaveStatusColor(
              params.row.status
            )} py-1.25 px-3.75 rounded-3xl text-xs`}
          >
            {params.row.status}
          </span>
        );
      },
    },
  ];

  // Check if data has been loaded but is empty

  const refetchLeaves = useCallback(() => {
    fetchLeaves({
      page,
      username: debouncedSearch.trim() || undefined,
    }).catch(() => {});
  }, [fetchLeaves, page, debouncedSearch]);

  useEffect(() => {
    refetchLeaves();
  }, [debouncedSearch, refetchLeaves]);

  const hasLoadedEmptyData =
    !isFetching && leavesData && leavesData.length === 0;

  return (
    <div className="w-full h-full flex flex-col gap-y-6.5">
      <LeaveRequestsHr onLeaveActionSuccess={refetchLeaves} />
      <CustomBox customClasses="w-full h-full flex flex-col gap-y-5 p-5">
        <div className="w-full flex flex-row items-center-safe justify-between">
          <h2 className="text-2xl font-semibold">Leaves History</h2>
          <TextField
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by employee name, email, or leave title..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ImSearch size={20} className="text-primary" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 350 }}
          />
        </div>
        <div className="w-full h-100 flex flex-col gap-y-3">
          <CustomDataTable
            columns={columns}
            rows={leavesData}
            isLoading={isLoading || isFetching}
            isDataEmpty={leavesData.length === 0}
            onRowClick={(item) => {
              console.log(item)
              setLeaveId(item.id.toLocaleString());
              setOpenModal(true);
            }}
            emptyViewTitle={
              fetchError
                ? "Error loading data"
                : hasLoadedEmptyData
                ? "No leaves found"
                : "Loading..."
            }
            emptyViewSubTitle={
              fetchError
                ? "Please try refreshing the page or contact support"
                : hasLoadedEmptyData
                ? "There are currently no leaves to display"
                : "Please wait while we fetch the data"
            }
            withPagination={false}
          />
          <div className="w-full flex justify-center">
            {fetchError ? (
              <CustomButton
                label="Retry"
                disabled={isFetching}
                onClick={() => {
                  clearFetchError();
                  fetchLeaves({
                    page: 1,
                    username: debouncedSearch.trim() || undefined,
                  }).catch(() => {
                    // Error is already handled in fetchLeaves
                  });
                }}
              />
            ) : (
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, page) => {
                  handlePageChange(page);
                }}
              />
            )}
          </div>
        </div>
      </CustomBox>

      {/* Leave Details Dialog */}
      {leaveId && (
        <LeaveDetailsDialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          leaveId={leaveId}
        />
      )}
    </div>
  );
};

export default AllLeaves;
