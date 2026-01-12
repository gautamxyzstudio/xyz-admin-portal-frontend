/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLeaveStatusColor } from "../../../../utils/utils";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import EmptyScreenView from "../../../../shared/components/EmptyScreenView/EmptyScreenView";
import type { GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Link } from "react-router";
import { getLeaveCategoryTitle } from "../../../leaves/utils";

const LeaveAnalytics = ({
  leaves,
  isLoading,
}: {
  leaves: any;
  isLoading: boolean;
}) => {
  // Get recent leaves (last 5)
  const recentLeaves = leaves?.data?.slice(0, 5) || [];

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      width: 180,
      renderCell: (params) => params?.row?.title || "N/A",
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      width: 120,
      renderCell: (params) =>
        params?.row?.leave_category
          ? getLeaveCategoryTitle(params.row.leave_category)
          : "N/A",
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 120,
      renderCell: (params) =>
        params?.row?.start_date
          ? dayjs(params.row.start_date).format("DD/MM/YYYY")
          : "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
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

  return (
    <CustomBox customClasses="h-full w-[58%] p-5 flex flex-col space-y-4">
      <div className="w-full h-auto flex flex-row flex-nowrap justify-between items-center-safe">
        <span className="text-black font-semibold text-2xl">Recent Leaves</span>
        <Link
          to={"/leaves"}
          title="View All"
          className="hover:bg-primary/90 bg-primary-20 text-primary px-5 py-1.5 text-sm font-medium hover:text-white rounded-full transition duration-300 ease-in-out"
        >
          View All
        </Link>
      </div>

      {!isLoading && (!leaves?.data || leaves?.data.length === 0) ? (
        <EmptyScreenView
          isDataEmpty={true}
          emptyViewTitle="No Leave Found"
          emptyViewSubTitle="Please request a leave"
        />
      ) : (
        <div className="w-full h-full">
          <CustomDataTable
            columns={columns}
            rows={recentLeaves}
            isDataEmpty={leaves?.data.length === 0}
            emptyViewTitle="No Leave Found"
            emptyViewSubTitle="Please request a leave"
            isLoading={isLoading}
            withPagination={false}
          />
        </div>
      )}
    </CustomBox>
  );
};

export default LeaveAnalytics;
