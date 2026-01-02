/* eslint-disable @typescript-eslint/no-explicit-any */
import MDBox from "../../../../components/MDBox/MDBox";
import Grid from "@mui/material/Grid";
import MDTypography from "../../../../components/MDTypography";
import MDButton from "../../../../components/MDButton/MDButton";
import EmployeeTableRow from "../../components/employeeTableRow/EmployeeTableRow";
import EmployeeDesignationRow from "../../components/employeeDesignationRow/EmployeeDesignationRow";
import EmployeeStatusRow from "../../components/employeestatusRow/EmployeeStatusRow";
import { Icon } from "@mui/material";
import {
  useDeleteEmployeeMutation,
  useDeleteUserMutation,
  useGetEmployeeListQuery,
} from "../../employeeApis";
import { userInState } from "../../../auth/authSlice";
import { useSelector } from "react-redux";
import { employeeListInState } from "../../employeeSlice";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import { toast } from "react-toastify";
import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import CustomDataTable from "../../../../shared/components/customDataTable/CustomDataTable.js";

const EmployeeList = () => {
  const user = useSelector(userInState);
  const navigate = useNavigate();
  const { setIsLoading } = useLoadingWrapper();
  const { isLoading } = useGetEmployeeListQuery({
    user_type: user ? user.user_type : "",
  });
  const [deleteUser] = useDeleteUserMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const employeeList = useSelector(employeeListInState);

  if (!user) return null; // or handle as appropriate
  // Filter out the current user from the employee list
  const filteredEmployeeList = employeeList?.filter(
    (employee) => employee.id !== user?.id
  );

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
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "employeeCode",
      headerName: "Employee Code",
      width: 160,
      renderCell: (params) => (
        <MDTypography
          display="block"
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          {params.row.empCode}
        </MDTypography>
      ),
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      width: 260,
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
      width: 150,
      renderCell: (params) => (
        <EmployeeDesignationRow title={params.row.designation} />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => <EmployeeStatusRow status={params.row.status} />,
    },
    {
      field: "joiningDate",
      headerName: "Joining Date",
      width: 200,
      renderCell: (params) => (
        <MDTypography
          display="block"
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          {params.row.joiningDate}
        </MDTypography>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <div className="flex flex-row gap-x-3">
          {(user.user_type === "Admin" || user.user_type === "Hr") && (
            <MDButton
              variant="text"
              color="info"
              onClick={() => {
                navigate(`/employees/${params.row.name}`, {
                  state: {
                    employee: params.row,
                  },
                });
              }}
            >
              <Icon>edit</Icon>&nbsp;edit
            </MDButton>
          )}

          {user.user_type === "Admin" && (
            <MDButton
              variant="text"
              color="dark"
              onClick={() => {
                deleteUserHandler(params?.row?.id, params?.row?.details_id);
              }}
            >
              <Icon>delete</Icon>&nbsp;delete
            </MDButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <div className="w-full">
            <div>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
                variant="gradient"
                bgColor="warning"
                borderRadius="lg"
                coloredShadow="dark"
              >
                <MDTypography variant="h6" color="white">
                  Employee List
                </MDTypography>
                {(user.user_type === "Admin" || user.user_type === "Hr") && (
                  <MDButton
                    variant="contained"
                    color="orange"
                    onClick={() => navigate("/employees/register")}
                  >
                    Add Employee
                  </MDButton>
                )}
              </MDBox>

              <div className="h-[70vh]  mt-4  w-full">
                <CustomDataTable
                  columns={columns}
                  rows={filteredEmployeeList}
                  isDataEmpty={filteredEmployeeList.length === 0}
                  emptyViewTitle="No Employee Found"
                  emptyViewSubTitle="Please add an employee to the system"
                  isLoading={isLoading}
                  withPagination={false}
                />
              </div>
            </div>
          </div>
        </Grid>
      </MDBox>
    </>
  );
};

export default EmployeeList;
