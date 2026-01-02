import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../state/store";
import { useLazyUserDetailsQuery } from "../../../auth/authApi";

// Profile components
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import ProfileInformation from "../../components/ProfileInformation/ProfileInformation";
import EmployeeDirectory from "../../components/EmployeeDirectory/EmployeeDirectory";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;

  return <div className="p-6">{children}</div>;
}

const ProfileList = () => {
  const [tabValue, setTabValue] = useState(0);
  const user = useSelector((state: RootState) => state.auth.user);
  const [getUserDetails] = useLazyUserDetailsQuery();

  useEffect(() => {
    if (user?.id) {
      getUserDetails({ id: user.id });
    }
  }, [user?.id, getUserDetails]);

  return (
    <div className="pt-6 pb-6 p-6 bg-white rounded-2xl ">
      {/* Profile Header */}
      <div className="w-full mb-6">
        <ProfileHeader />
      </div>

      {/* Tabs Container */}
      <div className="w-full bg-white rounded-lg ">
        {/* Tabs Header */}
        <div className="flex w-full gap-2 px-7 ">
          <button
            className={`px-6 py-3 text-sm font-medium w-full cursor-pointer ${
              tabValue === 0
                ? " bg-[#FFE4CA] text-orange-500 rounded-lg"
                : "text-gray-500 bg-[#F7F7F7] rounded-lg"
            }`}
            onClick={() => setTabValue(0)}
          >
            Profile Information
          </button>

          <button
            className={`px-6 py-3 text-sm font-medium w-full cursor-pointer  ${
              tabValue === 1
                ? "bg-[#FFE4CA] text-orange-500 rounded-lg"
                : "text-gray-500 bg-[#F7F7F7] rounded-lg"
            }`}
            onClick={() => setTabValue(1)}
          >
            Employee Directory
          </button>
        </div>

        {/* Tabs Content */}
        <TabPanel value={tabValue} index={0}>
          <ProfileInformation />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <EmployeeDirectory />
        </TabPanel>
      </div>
    </div>
  );
};

export default ProfileList;
