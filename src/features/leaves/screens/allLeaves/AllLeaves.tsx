/* eslint-disable react-hooks/exhaustive-deps */
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

  // Load current data on mount
  useEffect(() => {
    fetchLeaves(
      {
        page: 1,
        search: searchQuery,
      },
      false
    ).catch(() => {
      // Error is already handled in fetchLeaves
    }); // Don't show loading on initial load
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handleSearchKeyPress = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        await fetchLeaves(
          {
            page: 1,

            search: searchQuery,
          },
          true
        ).catch(() => {
          // Error is already handled in fetchLeaves
        });
      }
    },
    [searchQuery]
  );

  const handlePageChange = useCallback(
    async (newPage: number) => {
      await fetchLeaves(
        {
          page: newPage,
          search: searchQuery,
        },
        true
      ).catch(() => {
        // Error is already handled in fetchLeaves
      }); // Show loading for pagination
    },
    [fetchLeaves, searchQuery]
  );

  const columns: GridColDef[] = [
    {
      field: "startDate",
      headerName: "Start Date",
      width: 100,
      renderCell: (params) =>
        dayjs(params.row.start_date).format("DD/MM/YYYY"),
    },
    {
      field: "user",
      headerName: "Employee Name",
      width: 160,
      renderCell: (params) =>
        params.row.user.username,
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
      renderCell: (params) =>
        getLeaveCategoryTitle(params.row.leave_category),
    },
    {
      field: "status",
      headerName: "Status",
      width: 80,
      renderCell: (params) => {
        return (
          <span
            className={`${getLeaveStatusColor(params.row.status)} py-1.25 px-3.75 rounded-3xl text-xs`}
          >
            {params.row.status}
          </span>
        );
      },
    },
  ];

  // Check if data has been loaded but is empty

  const hasLoadedEmptyData =
    !isFetching && leavesData && leavesData.length === 0;

  return (
    <div className="w-full h-full flex flex-col gap-y-6.5">
      <LeaveRequestsHr />
      <CustomBox customClasses="w-full h-full flex flex-col gap-y-5 p-5">
        <div className="w-full flex flex-row items-center-safe justify-between">
          <h2 className="text-2xl font-semibold">Leaves History</h2>
          <TextField
            label="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
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
                  fetchLeaves(
                    {
                      page: 1,
                      search: searchQuery,
                    },
                    true
                  ).catch(() => {
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
    </div>
  );
};

export default AllLeaves;
