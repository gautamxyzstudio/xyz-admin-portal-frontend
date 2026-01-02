import dayjs from "dayjs";
import { Icons } from "../../../../assets/myAssets/exporter";
import StatCard from "../../../../shared/components/StatCard/StatCard";
import type { ILeave } from "../../../leaves/leaves.types";
import { getLeaveStatusColor } from "../../../../utils/utils";
import type { ProcessedHoliday } from "../../screens/EmployeeDashboard";

const InformationCards = ({
  recentLeave,
  leaveBalance,
  upComingHolidays,
}: {
  recentLeave: ILeave;
  leaveBalance: string;
   upComingHolidays: ProcessedHoliday
}) => {
  // console.log(upComingHolidays.date, "HOlidays")
  return (
    <div className="flex w-full flex-row flex-nowrap gap-x-5">
      <StatCard
        dashboard
        title={"Upcoming Holiday"}
        value={dayjs(upComingHolidays?.date).format('DD/MM/YYYY')}
        iconSrc={Icons.UPCOMING_HOLIDAY}
        iconBgColor="bg-lightGreen"
        subTitle={upComingHolidays?.name}
        subTitleBgColor="bg-primary-20"
        subTitleColor="text-primary"
      />

      <StatCard
        dashboard
        title={"Leaves Balance"}
        value={leaveBalance}
        iconSrc={Icons.LEAVE_BALANCE}
        iconBgColor="bg-[#2F4CBA1A]"
        subTitle="Available Leaves"
        subTitleBgColor="bg-background"
        subTitleColor="text-black-50"
      />
      <StatCard
        dashboard
        title={"Apply Leaves"}
        value={dayjs(recentLeave.start_date).format("DD/MM/YYYY")}
        iconSrc={Icons.TOTAL_LEAVE}
        iconBgColor="bg-[#6CADDD1A]"
        subTitle={recentLeave.status}
        subTitleColor={getLeaveStatusColor(recentLeave.status)}
      />
    </div>
  );
};

export default InformationCards;
