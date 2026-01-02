import { useSelector } from "react-redux";
import type { RootState } from "../../../../state/store";
import dayjs from "dayjs";
import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import { Icons } from "../../../../assets/myAssets/exporter";

// const IconWrapper = ({ children }: { children: React.ReactNode }) => (
//   <div className="w-10 h-10 flex items-center justify-center bg-orange-100 text-orange-500 rounded-md mr-4">
//     {children}
//   </div>
// );

const ProfileInformation: React.FC = () => {
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const formatDate = (dateString: string) =>
    dayjs(dateString).format("DD MMM, YYYY");

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Personal Information */}
        <div className="flex-1 bg-white rounded-lg  p-2">
          <h3 className="text-lg font-semibold mb-5 text-gray-800">
            Personal <span className="text-orange-500">Information</span>
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <img
                  className="bg-[#FFE4CA] p-2 rounded-[10px]"
                  src={Icons.PROFILE}
                  alt=""
                />
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-800">
                    {userDetails?.name || "Not Available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <img
                  className="bg-[#FFE4CA] p-2 rounded-[10px]"
                  src={Icons.DESIGNATION}
                  alt=""
                />
                <div>
                  <p className="text-xs text-gray-400">Designation</p>
                  <p className="font-medium text-gray-800">
                    {userDetails?.designation || "Not Available"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <img
                  className="bg-[#FFE4CA] p-2 rounded-[10px]"
                  src={Icons.JOINING_DATE}
                  alt=""
                />
                <div>
                  <p className="text-xs text-gray-400">Joining Date</p>
                  <p className="font-medium text-gray-800">
                    {userDetails?.joining_date
                      ? formatDate(userDetails.joining_date)
                      : "Not Available"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img
                className="bg-[#FFE4CA] p-2 rounded-[10px]"
                src={Icons.EMPLOYED_CODE}
                alt=""
              />
              <div>
                <p className="text-xs text-gray-400">Employee Code</p>
                <p className="font-medium text-gray-800">
                  {userDetails?.empCode || "Not Available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LinearGradient />
      {/* Contact Information */}
      <div className="flex-1 bg-white rounded-lg p-1 mt-8">
        <h3 className="text-lg font-semibold mb-5 text-gray-800">
          Contact <span className="text-orange-500">Information</span>
        </h3>

        <div className="flex justify-between space-y-4">
          <div className="flex items-center gap-2">
            <img
              className="bg-[#FFE4CA] p-2 rounded-[10px]"
              src={Icons.OUTLOOK_PRIMARY}
              alt=""
            />
            <div>
              <p className="text-xs text-gray-400">Email Address</p>
              <p className="font-medium text-gray-800">
                {userDetails?.email || "Not Available"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ">
            <img
              className="bg-[#FFE4CA] p-3 rounded-[10px] "
              src={Icons.CALL_ICON}
              alt=""
            />
            <div>
              <p className="text-xs text-gray-400">Phone Number</p>
              <p className="font-medium text-gray-800">
                {userDetails?.phoneNumber || "Not Available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileInformation;
