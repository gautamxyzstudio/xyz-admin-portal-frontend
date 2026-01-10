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
import { TbPlus } from "react-icons/tb";
import dayjs from "dayjs";

const EmployeeList = () => {
  const user = useSelector(userInState);
  const employeeList = useSelector(employeeListInState);

  const navigate = useNavigate();
  const { setIsLoading } = useLoadingWrapper();

  const { isLoading } = useGetEmployeeListQuery({
    user_type: user ? user.user_type : "",
  });

  const [deleteUser] = useDeleteUserMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  if (!user) return null;

  const filteredEmployeeList = employeeList.filter(
    (employee) => employee.id !== user?.id
  );
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
        <div className="flex w-full justify-center gap-3">
          {(user.user_type === "Admin" || user.user_type === "Hr") && (
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
    <CustomBox customClasses="p-6 w-full h-full overflow-scroll scroll-hide">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center ">
        <h2 className="text-black text-lg font-semibold">Employee </h2>

        {(user.user_type === "Admin" || user.user_type === "Hr") && (
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
          isLoading={isLoading}
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
