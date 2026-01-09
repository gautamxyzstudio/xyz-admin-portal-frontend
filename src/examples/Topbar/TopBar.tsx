import { useSelector } from "react-redux";
import { Icons } from "../../assets/myAssets/exporter";
import CustomBox from "../../components/CustomBox/CustomBox";
import { userDetailsInState } from "../../features/auth/authSlice";
import { useNavigate } from "react-router";
import { useState } from "react";
import DrawerNotification from "../../components/DrawerNotification/DrawerNotification";

const TopBar = () => {
  const navigate = useNavigate();
  const user = useSelector(userDetailsInState);
  const [openDrawer, setOpenDrawer] = useState(false);

  const openOutlook = () => {
    // Try to open Outlook desktop app
    window.location.href = "ms-outlook://";

    // Fallback to Outlook Web after 1 second
    setTimeout(() => {
      window.open("https://outlook.office.com/mail/", "_blank");
    }, 1000);
  };

  return (
    <CustomBox customClasses="w-full rounded-xl p-3.5 flex items-center justify-between sticky top-0 shadow z-99">
      {/* Left */}
      <p className="text-black-50 ml-2.5 font-semibold">Dashboard</p>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        {/* Message icon */}
      
        <div
          onClick={openOutlook}
          className="w-10 h-10 p-2 flex items-center justify-center rounded-xl bg-gray-100 cursor-pointer"
        >
          <img src={Icons.OUTLOOK} alt="Outlook" />
        </div>

        {/* Notification icon */}
        <div
          onClick={() => setOpenDrawer(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 cursor-pointer relative"
        >
          <img src={Icons.NOTIFICATION} alt="" />
        </div>

        {/* Profile image */}
        <img
          src={
            user?.photo?.startsWith("http")
              ? user?.photo
              : `${import.meta.env.VITE_API_BASE_URL}${user?.photo}`
          }
          onClick={() => navigate("/profile")}
          alt="profile"
          className="w-10 h-10 rounded-xl object-cover cursor-pointer"
        />
      </div>
      <DrawerNotification
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        // onOpen={() => setOpenDrawer(true)}
      />
    </CustomBox>
  );
};

export default TopBar;
