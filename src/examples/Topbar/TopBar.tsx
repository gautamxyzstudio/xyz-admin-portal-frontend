import { useSelector } from "react-redux";
import { Icons } from "../../assets/myAssets/exporter";
import CustomBox from "../../components/CustomBox/CustomBox";
import { userDetailsInState } from "../../features/auth/authSlice";
import { useNavigate } from "react-router";

const TopBar = () => {
  const navigate = useNavigate();
  const user = useSelector(userDetailsInState);

  return (
    <CustomBox customClasses="w-full rounded-xl p-3.5 flex items-center justify-between sticky top-0 shadow z-99">
      {/* Left */}
      <p className="text-black-50 ml-2.5 font-semibold">Dashboard</p>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        {/* Message icon */}
        <div className="w-10 h-10 p-2 flex items-center justify-center rounded-xl bg-gray-100 cursor-pointer sti">
          <img src={Icons.OUTLOOK} alt="" />
        </div>

        {/* Notification icon */}
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 cursor-pointer relative">
          <img src={Icons.NOTIFICATION} alt="" />
        </div>

        {/* Profile image */}
        <img
          src={user?.photo ? user?.photo : "https://i.pravatar.cc/40"}
          onClick={() => navigate("/profile")}
          alt="profile"
          className="w-10 h-10 rounded-xl object-cover cursor-pointer"
        />
      </div>
    </CustomBox>
  );
};

export default TopBar;
