import { useSelector } from "react-redux";
import { userDetailsInState } from "../../auth/authSlice";

import { Icons } from "../../../assets/myAssets/exporter";
import CustomButton from "../../../components/CustomButton/CustomButton";
import StatCard from "../../../shared/components/StatCard/StatCard";
import LeaveRequest from "../components/leaveRequests/LeaveRequest";
import AttendanceTable from "../components/AttendanceTable/AttendanceTable";

const HrDashboard = () => {
  const user = useSelector(userDetailsInState);

  return (
    <div className="h-[70vh]">
      {/* ================= HEADER ================= */}
      <div className="w-full relative overflow-clip rounded-2xl bg-primary flex items-center justify-between py-11 px-8">
        <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-36.25 -top-39 opacity-20" />
        <div className="w-65.75 h-65.75 bg-white rounded-full absolute -left-32.25 -top-35 opacity-10" />

        <div className="flex flex-col gap-y-2 text-background z-10">
          <h2 className="text-[32px] leading-10 font-semibold">
            Hey! {user?.name}
          </h2>
          <p className="text-white text-base opacity-80">
            Check your Attendance
          </p>
        </div>

        <div className="w-65.75 h-65.75 bg-white rounded-full absolute -right-36.25 -top-39 opacity-20" />
        <div className="w-65.75 h-65.75 bg-white rounded-full absolute -right-32.25 -top-35 opacity-10" />

        <CustomButton
          label="Add Announcements"
          icon={<img src={Icons.PLUS_ICON} alt="plus icon" />}
          customStyles="bg-white text-primary z-10 border-none!"
          buttonStyle="primaryOutline"
        />
      </div>

      {/* ================= STATS ================= */}
      <div className="flex gap-5 mt-5">
        <StatCard
          title="Total Employee"
          value="4"
          iconSrc={Icons.TOTAL_EMP}
          iconBgColor="bg-[#49B6791A]"
        />
        <StatCard
          title="Today Presents"
          value="4"
          iconSrc={Icons.PRESENTS_EMP}
          iconBgColor="bg-[#2F4CBA1A]"
        />
        <StatCard
          title="Today Leaves"
          value="4"
          iconSrc={Icons.TOTAL_LEAVE}
          iconBgColor="bg-[#6CADDD1A]"
        />
        <StatCard
          title="Today Absent"
          value="4"
          iconSrc={Icons.TODAYABSENT}
          iconBgColor="bg-[#FF00001A]"
        />
      </div>
      <div className="flex gap-5 flex-col">
        <AttendanceTable />
        <LeaveRequest />
      </div>
    </div>
  );
};

export default HrDashboard;
