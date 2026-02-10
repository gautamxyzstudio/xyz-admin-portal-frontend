import React from "react";
import CustomBox from "../../../../components/CustomBox/CustomBox";
import { Link } from "react-router";
import { ChevronLeft } from "@mui/icons-material";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable";
import type { GridColDef } from "@mui/x-data-grid";
import { useGetAllLeaveBalanceQuery } from "../../leavesApi";

const LeaveBalances = () => {
  const { data = [], isLoading } = useGetAllLeaveBalanceQuery(undefined, {
    refetchOnFocus: true,
  });

  console.log(isLoading);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Employee Name",
      width: 150,
      renderCell: (params) => (
        <span className="font-semibold">{params.row.user.username}</span>
      ),
    },
    {
      field: "cl_balance",
      headerName: "Casual Leaves",
      width: 150,
      renderCell: (params) => params.row.cl_balance,
    },
    {
      field: "el_balance",
      headerName: "Annual/Earned Leaves",
      width: 150,
      renderCell: (params) => params.row.el_balance,
    },
    {
      field: "sl_balance",
      headerName: "Sick/Medical Leaves",
      width: 150,
      renderCell: (params) => params.row.sl_balance,
    },
    {
      field: "unpaid_balance",
      headerName: "Unpaid Leaves",
      width: 150,
      renderCell: (params) => params.row.unpaid_balance,
    },
  ];

  return (
    <React.Fragment>
      <Link
        to="/all-leaves"
        className="w-full flex flex-row items-center-safe hover:underline hover:text-primary group mb-4 hover:font-semibold"
      >
        <ChevronLeft />
        <span>Back to All Leaves</span>
      </Link>
      <CustomBox customClasses="w-full h-auto flex flex-col gap-y-5 px-5 py-6">
        <h2 className="text-2xl font-semibold">Leaves Balance List</h2>
        <div className="w-full h-[60dvh]">
          <CustomDataTable
            columns={columns}
            rows={data}
            isLoading={isLoading}
            isDataEmpty={data?.length === 0}
            emptyViewTitle="No Leave Balance Found"
            emptyViewSubTitle=""
            withPagination={false}
          />
        </div>
      </CustomBox>
    </React.Fragment>
  );
};

export default LeaveBalances;
