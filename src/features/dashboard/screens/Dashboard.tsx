import { useSelector } from 'react-redux';
import { userInState } from '../../auth/authSlice';
import DashboardLayout from '../../../examples/LayoutContainers/DashboardLayout/index.jsx';
import EmployeeDashboard from './EmployeeDashboard';
import HrDashboard from './HrDashboard';

const Dashboard = () => {
  const user = useSelector(userInState);
  return (
    <>
      {user?.user_type === 'Employee' ||
      user?.user_type === 'Manager' ||
      user?.user_type === 'Seo' ? (
        <EmployeeDashboard />
      ) : (
        <HrDashboard />
      )}
    </>
  );
};

export default Dashboard;
