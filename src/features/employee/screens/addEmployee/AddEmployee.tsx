/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout/index.jsx";
import DashboardNavbar from "../../../../examples/Navbars/DashboardNavbar/index.jsx";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context.js";
import AddEmployeeForm from "../../components/addEmployeeForm/AddEmployeeForm";
import type { AddEmployeeFormData } from "../../components/addEmployeeForm/AddEmployeeForm.types";
import {
  useAddEmployeeDetailsMutation,
  useRegisterEmployeeMutation,
} from "../../employeeApis";
import type { IAddEmployeeArgs, IRegisterUserArgs } from "../../types";
import { useNavigate } from "react-router-dom";
const AddEmployee = () => {
  const { setIsLoading } = useLoadingWrapper();

  const [registerUser] = useRegisterEmployeeMutation();
  const navigation = useNavigate();
  const [addEmployeeDetails] = useAddEmployeeDetailsMutation();

  const createUserHandler = async (data: AddEmployeeFormData) => {
    try {
      setIsLoading(true);
      const registerResponse = await registerUserHandler({
        username: data.name,
        email: data.email,
        user_type: data.role,
        password: data.password,
        leave_balance: Number(data.leaveBalance),
        daily_attendances: [],
        unpaid_leave_balance: 0,
        role: data.role,
      });
      if (registerResponse) {
        const addEmployeeDetailsResponse = await addEmployeeDetailsHandler({
          name: data.name,
          designation: data.designation,
          empCode: data.employeeCode,
          phoneNumber: data.phone,
          email: data.email,
          joiningDate: data.joiningDate,
          Photo: [data.avatar],
          status: data.status === "active" ? true : false,
          user_detail: registerResponse.toString(),
        });
        if (addEmployeeDetailsResponse) {
          navigation("/employees");
        }
      }
    } catch (error) {
      toast.error((error as any)?.message ?? "Something went wrong");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEmployeeDetailsHandler = async (data: IAddEmployeeArgs) => {
    try {
      const response = await addEmployeeDetails(data).unwrap();
      if (response) {
        return response;
      }
    } catch (error) {
      toast.error((error as any)?.message ?? "Something went wrong");
    }
  };

  const registerUserHandler = async (data: IRegisterUserArgs) => {
    try {
      const response = await registerUser(data).unwrap();
      return response?.user?.id;
    } catch (error) {
      throw new Error("Failed to register user", error as any);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <AddEmployeeForm onPressSubmit={createUserHandler} />
    </>
  );
};

export default AddEmployee;
