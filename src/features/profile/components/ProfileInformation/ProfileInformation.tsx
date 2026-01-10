import { useSelector } from "react-redux";
import type { RootState } from "../../../../state/store";

import LinearGradient from "../../../../components/LinearGradient/LinearGradient";
import { Icons } from "../../../../assets/myAssets/exporter";

type InfoItemProps = {
  icon: string;
  label: string;
  value?: string | null;
};

const InfoItem = ({ icon, label, value }: InfoItemProps) => {
  return (
    <div className="flex items-center gap-x-3">
      <img
        src={icon}
        alt={label}
        className={`bg-primary-20 p-2.25 rounded-[10px] w-15 h-15`}
      />

      <div className="flex flex-col">
        <p className="text-base text-black-80">{label}</p>
        <p className="font-semibold text-black text-xl">
          {value || "Not Available"}
        </p>
      </div>
    </div>
  );
};

const ProfileInformation: React.FC = () => {
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Personal Information */}
        <div className="flex-1 bg-white rounded-lg  p-2">
          <h3 className="text-xl font-semibold mb-5 text-black">
            Personal <span className="text-primary">Information</span>
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <InfoItem
                icon={Icons.PROFILE}
                label={"Full Name"}
                value={userDetails?.name}
              />

              <div className="flex items-center gap-2">
                <InfoItem
                  icon={Icons.DESIGNATION}
                  label={"Designation"}
                  value={userDetails?.designation}
                />
              </div>
              <div className="flex items-center gap-2">
                <InfoItem
                  icon={Icons.JOINING_DATE}
                  label={"Joining Date"}
                  value={userDetails?.joinig_date}
                />
              </div>
            </div>
            <div className="flex items-center mt-6 gap-2">
              <InfoItem
                icon={Icons.EMPLOYED_CODE}
                label={"Employee Code"}
                value={userDetails?.empCode}
              />
            </div>
          </div>
        </div>
      </div>
      <LinearGradient />
      {/* Contact Information */}
      <div className="flex-1 bg-white rounded-lg p-1 mt-8">
        <h3 className="text-lg font-semibold mb-5 text-black">
          Contact Information
        </h3>

        <div className="flex justify-between space-y-4">
          <div className="flex items-center gap-2">
            <InfoItem
              icon={Icons.OUTLOOK_PRIMARY}
              label={"Email Address"}
              value={userDetails?.email}
            />
          </div>

          <div className="flex items-center gap-2 ">
            <InfoItem
              icon={Icons.CALL_ICON}
              label={"Phone Number"}
              value={userDetails?.phoneNumber}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileInformation;
