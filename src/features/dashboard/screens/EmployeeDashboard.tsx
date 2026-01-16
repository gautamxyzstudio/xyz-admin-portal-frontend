/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from "react";
import MarkAttendance from "../components/markAttendance/MarkAttendance";
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
import {
  useGeLeaveBalanceQuery,
  useGetUserLeavesQuery,
} from "../../leaves/leavesApi";
import { useUserDetailsQuery } from "../../auth/authApi";
import { Icons } from "../../../assets/myAssets/exporter";
import InformationCards from "../components/informationCards/InformationCards";
import StatCardSkeleton from "../../../shared/components/StatCard/StatCardSkeleton";
import { useGetHolidaysQuery } from "../../holydayList/holydayListApi";
import dayjs from "dayjs";
import AnnouncementList from "../components/announcementList/AnnouncementList";

export interface ProcessedHoliday {
  id: number | string;
  name: string;
  date: Date;
  formattedDate: string;
}

const EmployeeDashboard = () => {
  const user = useSelector(userDetailsInState);
  const { setIsLoading } = useLoadingWrapper();
  const userBasic = useSelector(userInState);
  const {
    data: attendance,
    isLoading,
    refetch,
  } = useGetTodayAttendanceQuery(
    {
      id: userBasic?.id ?? 0,
    },
    {
      skip: !userBasic?.id,
      pollingInterval: 180000, // ✅ 3 minutes
      refetchOnFocus: true, // browser tab focus
      refetchOnReconnect: true,
    }
  );
  const [checkInRequest] = useCheckInMutation();
  const [checkOutRequest] = useCheckOutMutation();
  const dispatch = useDispatch();
  const checkInTime = useSelector(selectCheckInTime);
  const checkOutTime = useSelector(selectCheckOutTime);
  const attendanceId = useSelector(selectAttendanceId);
  const { data: leaves, isLoading: loading } = useGetUserLeavesQuery();
  const { data: leaveBalance } = useGeLeaveBalanceQuery();
  const { data: holidays } = useGetHolidaysQuery();

  useUserDetailsQuery(
    { id: userBasic?.id ?? 0 },
    {
      refetchOnMountOrArgChange: true,
      skip: !userBasic?.id,
    }
  );

  useEffect(() => {
    if (attendance) {
      console.log(attendance);
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
    if (attendance) {
      console.log("🔄 Attendance synced from backend:", {
        id: attendance.id,
        in: attendance.in,
        out: attendance.out,
        isCheckedIn: attendance.is_checked_in,
        attendanceSeconds: attendance.attendance_seconds,
        checkinStartedAt: attendance.checkin_started_at,
        syncedAt: new Date().toLocaleTimeString(),
      });
    }
  }, [attendance]);

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading]);

  // upComing Holiday
  const processedHolidays = useMemo<ProcessedHoliday[]>(() => {
    if (!holidays) return [];

    const today = dayjs();
    today.startOf("day").valueOf(); // normalize

    return (
      holidays
        .map((holiday: any) => ({
          id: holiday.id,
          name: holiday.name,
          date: holiday.date, // string or ISO
          formattedDate: dayjs(holiday.date).format("MMMM DD, YYYY"),
        }))
        // ✅ keep only today & future holidays
        .filter(
          (holiday: ProcessedHoliday) =>
            dayjs(holiday.date).startOf("day").valueOf() >=
            today.startOf("day").valueOf()
        )
        // ✅ nearest first (earliest date first)
        .sort(
          (a: ProcessedHoliday, b: ProcessedHoliday) =>
            dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
        )
    );
  }, [holidays]);

  if (!user || user.name === undefined) return null;
  if (!userBasic || userBasic.id === undefined) return null;

  const onCheckIn = async (time: Date) => {
    console.log(dayjs().format());
    setIsLoading(true);
    const checkInTime = dateToTimeString(time);
    try {
      const res = await checkInRequest({
        data: {
          in: checkInTime,
          out: "",
          date: formatDateToMMDDYYYY(new Date()),
          user: userBasic.id,
          checkin_started_at: dayjs().format(),
        },
      }).unwrap();
      await refetch(); // ✅ force sync
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
      await refetch(); // ✅ force sync
      dispatch(checkOut(checkOutTime));
    } catch (error) {
      toast.error((error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  const recentHoliday = processedHolidays[0] ?? null;

  const totalLeaveBalance =
    leaveBalance?.el_balance +
    leaveBalance?.cl_balance +
    leaveBalance?.sl_balance;

  const recentLeave = leaves?.data?.[0] ?? null;
  return (
    <div className="w-full h-full flex flex-col gap-y-5">
      <div className="w-full h-auto flex flex-row gap-x-5 items-start justify-between">
        <div className="w-[71%] flex flex-col gap-y-5">
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
          {loading ? (
            <div className="flex w-full flex-row flex-nowrap gap-x-5">
              {[1, 2, 3].map((_, idx) => (
                <StatCardSkeleton key={idx} dashboard />
              ))}
            </div>
          ) : (
            <InformationCards
              upComingHolidays={recentHoliday}
              leaveBalance={totalLeaveBalance.toLocaleString()}
              recentLeave={recentLeave}
            />
          )}
        </div>
        <MarkAttendance
          inTime={checkInTime ?? null}
          outTime={checkOutTime ?? null}
          isCheckedIn={attendance?.is_checked_in ?? false}
          attendanceSeconds={attendance?.attendance_seconds ?? 0}
          checkinStartedAt={attendance?.checkin_started_at ?? null}
          handleCheckIn={onCheckIn}
          handleCheckOut={onCheckOut}
        />
      </div>
      <div className="w-full h-full flex flex-row gap-x-5 items-start">
        <LeaveAnalytics leaves={leaves} isLoading={loading} />
        <AnnouncementList customHeight="h-100" />
      </div>
    </div>
  );
};

export default EmployeeDashboard;