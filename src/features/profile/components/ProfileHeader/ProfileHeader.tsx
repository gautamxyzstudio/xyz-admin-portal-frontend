import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../state/store";
import { FaCamera } from "react-icons/fa";
import { Icons, Images } from "../../../../assets/myAssets/exporter";

const ProfileHeader: React.FC = () => {
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [avatarError, setAvatarError] = useState(false);

  const getStatusText = (status: string) =>
    status === "active" ? "Active" : "Inactive";

  const getStatusClasses = (status: string) =>
    status === "active"
      ? "bg-[#0080001F] text-[#008000]"
      : "bg-red-100 text-red-800";

  const avatarSrc =
    !avatarError && userDetails?.photo
      ? userDetails.photo
      : "/static/images/avatar/default.jpg";

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white">
      {/* Banner Image */}
      <div className="relative w-full h-40">
        <img
          src={Images.BANNER}
          alt="Banner"
          className="w-full h-41.75 object-cover rounded-2xl"
        />
        {/* Edit icon on banner */}
        <button className="absolute right-4 bottom-2 bg-white p-2 rounded-lg cursor-pointer">
        <img src={Icons.UPDATE_IMG} alt="" />
        </button>
      </div>

      {/* Avatar and Info */}
      <div className="flex items-center p-6 -mt-21">
        <div className="relative">
          <img
            src={avatarSrc}
            alt={userDetails?.name || "Profile"}
            onError={() => setAvatarError(true)}
            className="w-38 h-38  rounded-full border-4 border-white object-cover shadow-lg"
          />
          {/* Edit icon on avatar */}
          <button className="absolute bottom-4 right-3 bg-[#F17C04] text-white p-1 rounded-full border-white shadow-md cursor-pointer">
            <FaCamera size={12} />
          </button>
        </div>

        {/* User Info */}
        <div className="ml-2 mt-14 flex gap-1 ">
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-900 leading-8">
              {userDetails?.name || "User Name"}
            </h2>
            <p className="text-gray-600 font-normal text-base">
              {userDetails?.designation || "Designation"}
            </p>
          </div>
          <span
            className={`flex px-2 w-20 h-10 font-medium items-center mt-3 justify-center rounded-[50px]  ${getStatusClasses(
              userDetails?.status || "active"
            )}`}
          >
            {getStatusText(userDetails?.status || "active")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
