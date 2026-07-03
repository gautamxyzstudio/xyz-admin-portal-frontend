/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { GridColDef } from "@mui/x-data-grid";
import EmployeeTableRow from "../../components/employeeTableRow/EmployeeTableRow";
import {
  useDeleteEmployeeMutation,
  useDeleteUserMutation,
  useGetEmployeeListQuery,
} from "../../employeeApis";
import { userInState } from "../../../auth/authSlice";
import { employeeListInState } from "../../employeeSlice";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable.js";
import EmployeeDesignationRow from "../../components/employeeDesignationRow/EmployeeDesignationRow.js";
import EmployeeStatusRow from "../../components/employeestatusRow/EmployeeStatusRow.js";
import CustomBox from "../../../../components/CustomBox/CustomBox.js";
import { Icons } from "../../../../assets/myAssets/exporter.js";
import CustomButton from "../../../../components/CustomButton/CustomButton.js";
import { TbPlus, TbX } from "react-icons/tb";
import dayjs from "dayjs";
import { useState } from "react";
import { ImSearch } from "react-icons/im";

const EmployeeList = () => {
  const user = useSelector(userInState);
  const employeeList = useSelector(employeeListInState);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { setIsLoading } = useLoadingWrapper();

  const { data, isLoading, isFetching } = useGetEmployeeListQuery({
    user_type: user ? user.user_type : "",
    search: searchTerm,
  });

  const [deleteUser] = useDeleteUserMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  if (!user) return null;
  const filteredEmployeeList = data || employeeList;

  // console.log("Employee List Data:", filteredEmployeeList);

  const deleteUserHandler = async (id: string, detailsId: string) => {
    try {
      setIsLoading(true);
      const response = await deleteUser({ id }).unwrap();
      if (response) {
        await deleteEmployee({ id: detailsId }).unwrap();
      }
      toast.success("Employee deleted successfully");
    } catch (error) {
      toast.error((error as any)?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== Columns ===================== */
  const columns: GridColDef[] = [
    {
      field: "employeeCode",
      headerName: "Employee Code",
      width: 130,
      renderCell: (params) => (
        <span className="text-xs font-medium text-gray-700">
          {params.row.empCode}
        </span>
      ),
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      width: 290,
      renderCell: (params) => (
        <EmployeeTableRow
          image={params.row.image}
          name={params.row.name}
          email={params.row.email}
        />
      ),
    },
    {
      field: "designation",
      headerName: "Designation",
      width: 190,
      renderCell: (params) => (
        <EmployeeDesignationRow title={params.row.designation} />
      ),
    },
    {
      field: "joiningDate",
      headerName: "Joining Date",
      width: 120,
      renderCell: (params: any) => (
        <span className="text-xs font-medium text-gray-700">
          {params.row.joiningDate
            ? dayjs(params.row.joiningDate).format("DD/MM/YYYY")
            : "___"}
        </span>
      ),
    },

    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => <EmployeeStatusRow status={params.row.status} />,
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <div className="flex w-full gap-3">
          {(user.user_type === "Admin" ||
            user.user_type === "Hr" ||
            user?.user_type === "Management") && (
            <button
              className="text-blue-600 text-sm font-medium hover:underline"
              onClick={() =>
                navigate(`/employees/${params.row.name}`, {
                  state: { employee: params.row },
                })
              }
            >
              <img src={Icons.EDIT} alt="" />
            </button>
          )}

          {user.user_type === "Admin" && (
            <button
              className="text-red-600 text-sm font-medium hover:underline"
              onClick={() =>
                deleteUserHandler(params.row.id, params.row.details_id)
              }
            >
              🗑 Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <CustomBox customClasses="p-6 w-full h-full overflow-scroll scrollbar-hide">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center ">
        <div className="flex flex-row gap-2 items-center ">
          <h2 className="text-black text-2xl font-semibold">Employee </h2>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by employee name or code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-76 pl-10 pr-8 py-2 text-sm rounded-2xl border border-gray-200 
                           focus:outline-none focus:ring-2 focus:ring-indigo-100
                           placeholder:text-gray-400"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              <ImSearch size={20} className="text-primary" />
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <TbX size={18} />
              </button>
            )}
          </div>
        </div>

        {(user.user_type === "Admin" ||
          user.user_type === "Hr" ||
          user?.user_type === "Management") && (
          <CustomButton
            onClick={() => navigate("/employees/register")}
            customStyles="text-sm"
            label="Add New Employee"
            icon={<TbPlus size={22} />}
            buttonStyle="primary"
          />
        )}
      </div>

      {/* ===== Table ===== */}
      <div className="h-full mt-6 ">
        <CustomDataTable
          columns={columns}
          rows={filteredEmployeeList}
          isLoading={isLoading || isFetching}
          withPagination={false}
          isDataEmpty={filteredEmployeeList.length === 0}
          emptyViewTitle="No Employee Found"
          emptyViewSubTitle="Please add an employee to the system"
        />
      </div>
    </CustomBox>
  );
};

export default EmployeeList;
