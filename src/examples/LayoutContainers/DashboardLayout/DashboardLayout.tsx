import type React from "react";
import TopBar from "../../Topbar/TopBar";
import SideNav from "../../Sidenav/SideNav";
import CelebrationOverlay from "../../../components/Celebration/CelebrationOverlay";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-5 w-full h-full flex flex-row items-start gap-x-5 flex-nowrap max-w-screen-2xl mx-auto">
      <SideNav />
      <div className="w-[82.5%] h-full flex flex-col gap-y-5">
        <TopBar />
        <div className="w-full h-full overflow-y-scroll overflow-clip scrollbar-hide">{children}</div>
      </div>
      {/* birthday / joining / anniversary celebration, once a day */}
      <CelebrationOverlay />
    </div>
  );
};

export default DashboardLayout;
