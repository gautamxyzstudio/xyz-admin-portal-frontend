import type React from "react";
import TopBar from "../examples/Navbars/Topbar/TopBar";
import SideNav from "../examples/Sidenav/SideNav";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-5 w-full h-full flex flex-row items-start gap-x-6 flex-nowrap">
      <SideNav />
      <div className="w-full flex flex-col gap-y-5">
        <TopBar />
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
