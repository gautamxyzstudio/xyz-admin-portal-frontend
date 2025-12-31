import CustomBox from "../../components/CustomBox/CustomBox";
import CustomButton from "../../components/CustomButton/CustomButton";
import { Logout } from "@mui/icons-material";
import { Images } from "../../assets/myAssets/exporter";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";

const SideNav = () => {
  const dispatcher = useDispatch();
  const navigate = useNavigate();
  const handleLinkPress = (href: string) => {
    if (href === "Log Out") {
      dispatcher({ type: "RESET" });
      navigate("/login");
    }
  };
  return (
    <CustomBox customClasses="px-6 pt-6 pb-5 flex w-[17%] h-full flex-col justify-between">
      <div className="w-full flex flex-col gap-y-12">
        <Link to="/">
          <img
            className="w-[90%] h-full"
            src={Images.BRANDLOGO}
            alt="XYZ Studio"
          />
        </Link>
        <div></div>
      </div>
      <CustomButton
        label="Log Out"
        icon={<Logout />}
        buttonStyle="secondary"
        customStyles="py-3.5!"
        onClick={() => handleLinkPress("Log Out")}
      />
    </CustomBox>
  );
};

export default SideNav;
