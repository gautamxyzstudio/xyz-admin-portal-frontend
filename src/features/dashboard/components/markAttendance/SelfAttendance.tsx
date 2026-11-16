/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import MarkAttendance from "./MarkAttendance";
import { userInState } from "../../../auth/authSlice";
import {
  useCheckInMutation,
  useCheckOutMutation,
  useGetTodayAttendanceQuery,
} from "../../dashboardApi";
import {
  checkIn,
  checkOut,
  selectAttendanceId,
  selectCheckInTime,
  selectCheckOutTime,
  setAttendanceId,
} from "../../dashboardSlice";
import { dateToTimeString, formatDateToMMDDYYYY } from "../../../../utils/utils";
import { useLoadingWrapper } from "../../../../wrappers/loadingWrapper/LoadingWrapper.context";

/**
 * Check-in / check-out card for the logged-in user's own attendance.
 * Same behaviour as the Employee dashboard, reusable on other dashboards (HR).
 */
const SelfAttendance = () => {
  const userBasic = useSelector(userInState);
  const dispatch = useDispatch();
  const { setIsLoading } = useLoadingWrapper();

  const { data: attendance, refetch } = useGetTodayAttendanceQuery(
    { id: userBasic?.id ?? 0 },
    {
      skip: !userBasic?.id,
      pollingInterval: 60000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const [checkInRequest] = useCheckInMutation();
  const [checkOutRequest] = useCheckOutMutation();
  const checkInTime = useSelector(selectCheckInTime);
  const checkOutTime = useSelector(selectCheckOutTime);
  const attendanceId = useSelector(selectAttendanceId);

  useEffect(() => {
    if (!attendance) return;
    if (attendance.in) dispatch(checkIn(attendance.in));
    if (attendance.out) dispatch(checkOut(attendance.out));
    if (attendance.id) dispatch(setAttendanceId(attendance.id));
  }, [attendance]);

  if (!userBasic?.id) return null;

  const onCheckIn = async (time: Date) => {
    setIsLoading(true);
    const inTime = dateToTimeString(time);
    try {
      const res = await checkInRequest({
        data: {
          in: inTime,
          out: "",
          date: formatDateToMMDDYYYY(new Date()),
          user: userBasic.id,
          checkin_started_at: dayjs().format(),
        },
      }).unwrap();
      await refetch();
      dispatch(checkIn(inTime));
      dispatch(setAttendanceId(res.id));
    } catch (error) {
      toast.error((error as any)?.data?.error?.message || (error as any)?.message || "Check-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onCheckOut = async (time: Date) => {
    setIsLoading(true);
    const outTime = dateToTimeString(time);
    try {
      if (attendanceId == null) return;
      await checkOutRequest({ data: { out: outTime, id: attendanceId } }).unwrap();
      await refetch();
      dispatch(checkOut(outTime));
    } catch (error) {
      toast.error((error as any)?.data?.error?.message || (error as any)?.message || "Check-out failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MarkAttendance
      inTime={checkInTime ?? null}
      outTime={checkOutTime ?? null}
      isCheckedIn={attendance?.is_checked_in ?? false}
      attendanceSeconds={attendance?.attendance_seconds ?? 0}
      checkinStartedAt={attendance?.checkin_started_at ?? null}
      handleCheckIn={onCheckIn}
      handleCheckOut={onCheckOut}
    />
  );
};

export default SelfAttendance;
