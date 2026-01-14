import { userDetailsInState } from "../../auth/authSlice";
import { Icons } from "../../../assets/myAssets/exporter";
import CustomButton from "../../../components/CustomButton/CustomButton";
import StatCard from "../../../shared/components/StatCard/StatCard";
import LeaveRequest from "../components/leaveRequests/LeaveRequest";
import AttendanceTable from "../components/AttendanceTable/AttendanceTable";
import { useEffect, useState } from "react";
import axios from "axios";
import { apiendpoint } from "../../../api/endpoint";
import { useAppSelector } from "../../../state/store";
import { useLoadingWrapper } from "../../../wrappers/loadingWrapper/LoadingWrapper.context";
import AnnouncementDialog from "../../announcements/components/AnnouncementDialog/AnnouncementDialog";
import AnnouncementList from "../components/announcementList/AnnouncementList";

interface DashboardStats {
  totalEmployees: number;
  presentEmployees: number;
  employeesOnLeave: number;
  absentEmployees: number;
}

const HrDashboard = () => {
  const userDetail = useAppSelector(userDetailsInState);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { setIsLoading } = useLoadingWrapper();

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(apiendpoint.getDashboardStats);
        setStats(res.data);
      } catch (error) {
        console.error("Stats API error", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [setIsLoading]);

  if (!stats) return null;

  return (
    <div className="w-full h-auto flex flex-col gap-y-5">
      {/* HEADER */}
      <div className="w-full relative overflow-clip rounded-2xl bg-primary flex items-center justify-between py-11 px-8">
        <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-36.25 -top-39 opacity-20" />
        <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-32.25 -top-35 opacity-10" />
        <div className="flex flex-col gap-y-2 text-background z-10">
          <h2 className="text-[32px] leading-10 font-semibold">
            Hey! {userDetail?.name}
          </h2>
          <p className="text-white text-base opacity-80">
            Track attendance & activity
          </p>
        </div>
        <div className="w-65.75 h-65.75 bg-white rounded-full absolute -right-36.25 -top-39 opacity-20" />
        <div className="w-65.75 h-65.75 bg-white rounded-full absolute -right-32.25 -top-35 opacity-10" />
        <CustomButton
          label="Add Announcements"
          icon={<img src={Icons.PLUS_ICON} alt="plus icon" />}
          customStyles="bg-white text-primary z-10 border-none!"
          buttonStyle="primaryOutline"
          onClick={() => setOpenDialog(true)}
        />
      </div>

      {/* STATS */}
      <div className="w-full flex gap-x-5">
        <StatCard
          title="Total Employee"
          value={stats.totalEmployees.toString()}
          iconSrc={Icons.TOTAL_EMP}
          iconBgColor="bg-[#49B6791A]"
        />
        <StatCard
          title="Today Present"
          value={stats.presentEmployees.toString()}
          iconSrc={Icons.PRESENTS_EMP}
          iconBgColor="bg-[#2F4CBA1A]"
        />
        <StatCard
          title="Today Leaves"
          value={stats.employeesOnLeave.toString()}
          iconSrc={Icons.TOTAL_LEAVE}
          iconBgColor="bg-[#6CADDD1A]"
        />
        <StatCard
          title="Today Absent"
          value={stats.absentEmployees.toString()}
          iconSrc={Icons.TODAY_ABSENT}
          iconBgColor="bg-[#FF00001A]"
        />
      </div>
      <div className="w-full h-full flex flex-row gap-x-5 items-start">
        <LeaveRequest  />
        <AnnouncementList customHeight="h-100" />
      </div>
      <AttendanceTable />
      <AnnouncementDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </div>
  );
};

export default HrDashboard;
