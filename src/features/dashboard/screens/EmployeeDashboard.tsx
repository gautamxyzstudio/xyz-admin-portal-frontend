/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import MarkAttendance from "../components/markAttendace/MarkAttendance";
import UpComingHolidays from "../components/upcommingHolidays/UpComingHolidays";
import LeaveAnalytics from "../components/leaveAnalytics/LeaveAnalytics";
import { Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { userDetailsInState, userInState } from "../../auth/authSlice";
import {
  useCheckInMutation,
  useCheckOutMutation,
  useGetTodayAttendanceQuery,
} from "../dashboardApi";
import { dateToTimeString, formatDateToMMDDYYYY } from "../../../utils/utils";
import { toast } from "react-toastify";
import { useLoadingWrapper } from "../../../wrappers/loadingWrapper/LoadingWrapper.context";
import {
  checkIn,
  checkOut,
  selectAttendanceId,
  selectCheckInTime,
  selectCheckOutTime,
  setAttendanceId,
} from "../dashboardSlice";
import { useGetUserLeavesQuery } from "../../leaves/leavesApi";
import { useUserDetailsQuery } from "../../auth/authApi";

const EmployeeDashboard = () => {
  const user = useSelector(userDetailsInState);
  const { setIsLoading } = useLoadingWrapper();
  const userBasic = useSelector(userInState);
  const { data: attendance, isLoading } = useGetTodayAttendanceQuery({
    id: userBasic?.id ?? 0,
  });

  const userDetails = useSelector(userInState);

  useUserDetailsQuery(
    { id: userDetails?.id ?? 0 },
    {
      refetchOnMountOrArgChange: true,
      skip: !userDetails?.id,
    }
  );

  const [checkInRequest] = useCheckInMutation();
  const [checkOutRequest] = useCheckOutMutation();
  const dispatch = useDispatch();
  const checkInTime = useSelector(selectCheckInTime);
  const checkOutTime = useSelector(selectCheckOutTime);
  const attendanceId = useSelector(selectAttendanceId);

  useEffect(() => {
    if (attendance) {
      if (attendance.in) {
        dispatch(checkIn(attendance.in));
      }
      if (attendance.out) {
        dispatch(checkOut(attendance.out));
      }
      if (attendance.id) {
        dispatch(setAttendanceId(attendance.id));
      }
    }
  }, [attendance]);

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading]);
  const { data: leaves } = useGetUserLeavesQuery();
  if (!user || user.name === undefined) return null;
  if (!userBasic || userBasic.id === undefined) return null;
  if (!userDetails || userDetails.id === undefined) return null;

  const onCheckIn = async (time: Date) => {
    setIsLoading(true);
    const checkInTime = dateToTimeString(time);
    try {
      const res = await checkInRequest({
        data: {
          in: checkInTime,
          out: "",
          date: formatDateToMMDDYYYY(new Date()),
          user: userBasic.id,
        },
      }).unwrap();
      console.log(res, "Ressponse");
      dispatch(checkIn(checkInTime));
      dispatch(setAttendanceId(res.id));
    } catch (error) {
      toast.error((error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  const onCheckOut = async (time: Date) => {
    setIsLoading(true);
    const checkOutTime = dateToTimeString(time);
    try {
      if (attendanceId == null) return;
      await checkOutRequest({
        data: {
          out: checkOutTime,
          id: attendanceId,
        },
      }).unwrap();
      dispatch(checkOut(checkOutTime));
    } catch (error) {
      toast.error((error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome back, {user.name}
      </Typography>
      <div className="flex justify-between flex-row  gap-x my-8 gap-y-8">
        <UpComingHolidays />
        <MarkAttendance
          inTime={checkInTime ?? null}
          outTime={checkOutTime ?? null}
          handleCheckIn={onCheckIn}
          handleCheckOut={onCheckOut}
        />
      </div>
      <LeaveAnalytics leaves={leaves} />
    </div>
  );
};

export default EmployeeDashboard;
