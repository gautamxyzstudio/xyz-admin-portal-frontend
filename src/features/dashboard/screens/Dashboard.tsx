import { useSelector } from "react-redux";
import { userInState } from "../../auth/authSlice";
import EmployeeDashboard from "./EmployeeDashboard";
import HrDashboard from "./HrDashboard";

const Dashboard = () => {
  const user = useSelector(userInState);
  return (
    <>
      {user?.user_type === "Employee" ? (
        <EmployeeDashboard />
      ) : (
        <HrDashboard />
      )}
    </>
  );
};

export default Dashboard;
