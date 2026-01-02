import { useSelector } from 'react-redux';
import { userInState } from '../../auth/authSlice';
import AttendanceEmployee from './AttendanceEmployee';
import AttendanceAdmin from './AttendanceAdmin';

const AttendanceList = () => {
  const user = useSelector(userInState);

  return (
    <>
      {user?.user_type === 'Admin' || user?.user_type === 'Hr' ? (
        <AttendanceAdmin />
      ) : (
        <AttendanceEmployee />
      )}
    </>
  );
};

export default AttendanceList;
