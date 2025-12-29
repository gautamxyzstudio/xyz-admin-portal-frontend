import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../state/store";
import { useLazyUserDetailsQuery } from "../../../auth/authApi";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Material Dashboard 2 React components
import MDBox from "../../../../components/MDBox/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout/index.jsx";
import DashboardNavbar from "../../../../examples/Navbars/DashboardNavbar/index.jsx";

// Profile components
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import ProfileInformation from "../../components/ProfileInformation/ProfileInformation";
import EmployeeDirectory from "../../components/EmployeeDirectory/EmployeeDirectory";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={3}>
          {/* Profile Header */}
          <div className="w-full">
            <ProfileHeader />
          </div>

          {/* Tabs */}
          <div className="w-full">
            <Card>
              <MDBox sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="profile tabs"
                >
                  <Tab label="Profile Information" />
                  <Tab label="Employee Directory" />
                </Tabs>
              </MDBox>

              {/* Profile Information Tab */}
              <TabPanel value={tabValue} index={0}>
                <ProfileInformation />
              </TabPanel>

              {/* Employee Directory Tab */}
              <TabPanel value={tabValue} index={1}>
                <EmployeeDirectory />
              </TabPanel>
            </Card>
          </div>
        </Grid>
      </MDBox>
    </>
  );
};

export default ProfileList;
