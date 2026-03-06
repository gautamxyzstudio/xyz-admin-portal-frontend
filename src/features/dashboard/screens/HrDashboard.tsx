/* eslint-disable @typescript-eslint/no-explicit-any */
import { userDetailsInState, userInState } from "../../auth/authSlice";
import { Icons } from "../../../assets/myAssets/exporter";
import CustomButton from "../../../components/CustomButton/CustomButton";
import StatCard from "../../../shared/components/StatCard/StatCard";
import LeaveRequest from "../components/leaveRequests/LeaveRequest";
import AttendanceTable from "../components/AttendanceTable/AttendanceTable";
import { useEffect, useState } from "react";
import axios from "axios";
import { endpoints } from "../../../api/endpoints";
import { useAppSelector } from "../../../state/store";
import { useLoadingWrapper } from "../../../wrappers/loadingWrapper/LoadingWrapper.context";
import AnnouncementDialog from "../../announcements/components/AnnouncementDialog/AnnouncementDialog";
import AnnouncementList from "../components/announcementList/AnnouncementList";
import { Link } from "react-router";
import StatusDetailsDialog from "../../../components/StatusDetailsDialog/StatusDetailsDialog";
import { useSelector } from "react-redux";

interface DashboardStats {
  totalEmployees: number;
  presentEmployees: number;
  employeesOnLeave: number;
  absentEmployees: number;
}

const HrDashboard = () => {
  const userDetail = useAppSelector(userDetailsInState);
  const userBasic = useSelector(userInState);
  const { setIsLoading } = useLoadingWrapper();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Dialog details state with Loading
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    title: "",
    data: [] as any[],
    isLoading: false,
  });

   useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(endpoints.getDashboardStats, {
          headers: {
            Authorization: `Bearer ${userBasic?.token}`,
          },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Stats API error", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userBasic?.token) {
      fetchStats();
    }
  }, [setIsLoading, userBasic?.token]);

   const handleCardClick = async (type: "present" | "leave" | "absent") => {
    let title = "";
    let url = "";

    if (type === "present") {
      title = "Today's Present Employees";
      url = endpoints.getPresentEmployees;
    } else if (type === "leave") {
      title = "Employees on Leave";
      url = endpoints.getLeaveEmployees;
    } else if (type === "absent") {
      title = "Today's Absent Employees";
      url = endpoints.getAbsentEmployees;
    }

     setStatusDialog({ open: true, title, data: [], isLoading: true });

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${userBasic?.token}`,
        },
      });
    
      setStatusDialog((prev) => ({
        ...prev,
        data: res.data || [],
        isLoading: false,
      }));
    } catch (error) {
      console.error(`Error fetching ${type} list:`, error);
      setStatusDialog((prev) => ({ ...prev, isLoading: false }));
    }
  };

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
        <Link to="/employees" className="flex-1">
          <StatCard
            title="Total Employee"
            value={stats.totalEmployees.toString()}
            iconSrc={Icons.TOTAL_EMP}
            iconBgColor="bg-[#49B6791A]"
          />
        </Link>

        <div
          className="flex-1 cursor-pointer"
          onClick={() => handleCardClick("present")}
        >
          <StatCard
            title="Today Present"
            value={stats.presentEmployees.toString()}
            iconSrc={Icons.PRESENTS_EMP}
            iconBgColor="bg-[#2F4CBA1A]"
          />
        </div>

        <div
          className="flex-1 cursor-pointer"
          onClick={() => handleCardClick("leave")}
        >
          <StatCard
            title="Today Leaves"
            value={stats.employeesOnLeave.toString()}
            iconSrc={Icons.TOTAL_LEAVE}
            iconBgColor="bg-[#6CADDD1A]"
          />
        </div>

        <div
          className="flex-1 cursor-pointer"
          onClick={() => handleCardClick("absent")}
        >
          <StatCard
            title="Today Absent"
            value={stats.absentEmployees.toString()}
            iconSrc={Icons.TODAY_ABSENT}
            iconBgColor="bg-[#FF00001A]"
          />
        </div>
      </div>

      <div className="w-full h-full flex flex-row gap-x-5 items-start">
        <LeaveRequest />
        <AnnouncementList customHeight="h-100" />
      </div>
      <AttendanceTable />

      <AnnouncementDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />

      {/* Status Details Popup */}
      <StatusDetailsDialog
        open={statusDialog.open}
        onClose={() => setStatusDialog((prev) => ({ ...prev, open: false }))}
        title={statusDialog.title}
        data={statusDialog.data}
        isLoading={statusDialog.isLoading}
      />
    </div>
  );
};

export default HrDashboard;