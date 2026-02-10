import CustomBox from "../../components/CustomBox/CustomBox";
import CustomButton from "../../components/CustomButton/CustomButton";
import { Logout } from "@mui/icons-material";
import { Images } from "../../assets/myAssets/exporter";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { getRoutes } from "../../routes";
import { userDetailsInState, userInState } from "../../features/auth/authSlice";

const SideNav = () => {
  const dispatcher = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(userInState);
  const userDetail = useSelector(userDetailsInState);
  const handleLinkPress = (href: string) => {
    if (href === "Log Out") {
      dispatcher({ type: "RESET" });
      navigate("/login");
    }
  };
  const routes = getRoutes(userDetail);

  if (!user) return null;

  const filteredRoutes = routes.filter((route) =>
    route.permissions.includes(user?.user_type),
  );

  return (
    <CustomBox customClasses="pl-5 pr-2 py-6 flex w-[18%] h-full flex-col justify-between items-center overflow-clip overflow-y-scroll scrollbar-hide">
      <div className="w-full h-full  flex flex-col gap-y-8">
        <Link to="/">
          <img
            className="w-[80%] h-full"
            src={Images.BRAND_LOGO}
            alt="XYZ Studio"
          />
        </Link>
        <div className="flex flex-col gap-y-1 h-full overflow-scroll scrollbar-hide">
          {filteredRoutes.map((route) => {
            const isActive =
              location.pathname === route.route ||
              location.pathname.startsWith(route.route + "/");

            return (
              <Link
                key={route.key}
                to={route.route}
                title={route.name}
                className={`flex flex-row gap-x-1 items-center ${
                  isActive ? "py-2" : "py-3.5"
                }`}
              >
                <div
                  className={`${
                    isActive ? "flex" : "hidden"
                  } w-0.75 h-9 mr-2 rounded-r-xs bg-[linear-gradient(95deg,#ff7300_0%,#d17200_100%)] transition duration-300 ease-in-out`}
                />
                <img
                  src={isActive ? route.iconFill : route.icon}
                  alt={route.key}
                  className={`w-6 h-6 object-contain transition duration-300 ease-in-out ${
                    isActive ? "" : "ml-4"
                  }`}
                />
                <span
                  className={`${
                    isActive
                      ? "bg-[linear-gradient(135deg,#ff7300_0%,#d17200_100%)] text-transparent bg-clip-text"
                      : "text-black-50"
                  } transition text-sm duration-300 ease-in-out`}
                >
                  {route.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <CustomButton
        label="Log Out"
        icon={<Logout />}
        buttonStyle="secondary"
        customStyles="py-3.5! mt-7 w-[90%]"
        onClick={() => handleLinkPress("Log Out")}
      />
    </CustomBox>
  );
};

export default SideNav;
