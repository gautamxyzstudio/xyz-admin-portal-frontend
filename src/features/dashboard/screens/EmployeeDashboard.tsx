/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import MarkAttendance from "../components/markAttendance/MarkAttendance";
import UpComingHolidays from "../components/upComingHolidays/UpComingHolidays";
import LeaveAnalytics from "../components/leaveAnalytics/LeaveAnalytics";
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
import { Icons } from "../../../assets/myAssets/exporter";

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
    <div className="w-full flex flex-col gap-y-5">
      <div className="w-full h-auto flex flex-row gap-x-5 items-start">
        <div className="w-[72%] flex flex-col gap-y-5">
          <div className="w-full relative overflow-clip rounded-2xl bg-primary flex items-center justify-between py-4.5 pr-5">
            <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-36.25 -top-39 opacity-20" />
            <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-32.25 -top-35 opacity-10 " />
            <div className="flex flex-col gap-y-2 ml-8 text-background">
              <h2 className="text-[32px] leading-10 font-semibold">
                Hey! {user.name}
              </h2>
              <p className="text-white text-base opacity-80">
                Check your Attendance
              </p>
            </div>

            <img
              alt="people group"
              src={Icons.GROUP_PEOPLE}
              className="w-33 h-31.5 object-contain"
            />
          </div>
          <UpComingHolidays />
        </div>
        <MarkAttendance
          inTime={checkInTime ?? null}
          outTime={checkOutTime ?? null}
          handleCheckIn={onCheckIn}
          handleCheckOut={onCheckOut}
        />
      </div>
      <div className="w-full h-auto flex flex-row gap-x-5 items-start">
        <LeaveAnalytics leaves={leaves} />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
