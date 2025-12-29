import { useSelector } from "react-redux";
import type { RootState } from "../../../../state/store";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// @mui icons
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";

// Material Dashboard 2 React components
import MDBox from "../../../../components/MDBox/MDBox";
import MDTypography from "../../../../components/MDTypography/index";

// Utils
import dayjs from "dayjs";

const ProfileInformation: React.FC = () => {
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMMM DD, YYYY");
  };

  return (
    <Grid container spacing={3} flex={1}>
      <div className="w-1/2">
        <Card sx={{ height: "100%" }}>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="bold" mb={3}>
              Personal Information
            </MDTypography>
            <MDBox>
              <MDBox display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 2, color: "#FF7312" }} />
                <MDBox>
                  <MDTypography variant="caption" color="text.secondary">
                    Full Name
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">
                    {userDetails?.name || "Not Available"}
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox display="flex" alignItems="center" mb={2}>
                <WorkIcon sx={{ mr: 2, color: "#FF7312" }} />
                <MDBox>
                  <MDTypography variant="caption" color="text.secondary">
                    Designation
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">
                    {userDetails?.designation || "Not Available"}
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox display="flex" alignItems="center" mb={2}>
                <BadgeIcon sx={{ mr: 2, color: "#FF7312" }} />
                <MDBox>
                  <MDTypography variant="caption" color="text.secondary">
                    Employee Code
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">
                    {userDetails?.empCode || "Not Available"}
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox display="flex" alignItems="center" mb={2}>
                <CalendarTodayIcon sx={{ mr: 2, color: "#FF7312" }} />
                <MDBox>
                  <MDTypography variant="caption" color="text.secondary">
                    Joining Date
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">
                    {userDetails?.joining_date
                      ? formatDate(userDetails.joining_date)
                      : "Not Available"}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </div>

      <div className="flex-1">
        <Card sx={{ height: "100%" }}>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="bold" mb={3}>
              Contact Information
            </MDTypography>
            <MDBox>
              <MDBox display="flex" alignItems="center" mb={2}>
                <EmailIcon sx={{ mr: 2, color: "#FF7312" }} />
                <MDBox>
                  <MDTypography variant="caption" color="text.secondary">
                    Email Address
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">
                    {userDetails?.email || "Not Available"}
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox display="flex" alignItems="center" mb={2}>
                <PhoneIcon sx={{ mr: 2, color: "#FF7312" }} />
                <MDBox>
                  <MDTypography variant="caption" color="text.secondary">
                    Phone Number
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="medium">
                    {userDetails?.phoneNumber || "Not Available"}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </div>

      <div className="w-full">
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="bold" mb={3}>
              Leave Information
            </MDTypography>
            <Grid container spacing={3}>
              <Grid container spacing={3}>
                <MDBox
                  textAlign="center"
                  p={2}
                  bgcolor="primary.light"
                  borderRadius={2}
                >
                  <MDTypography
                    variant="h4"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {userDetails?.leave_balance || 0}
                  </MDTypography>
                  <MDTypography variant="body2" color="text.secondary">
                    Paid Leave Balance
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid container spacing={3}>
                <MDBox
                  textAlign="center"
                  p={2}
                  bgcolor="warning.light"
                  borderRadius={2}
                >
                  <MDTypography
                    variant="h4"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    {userDetails?.unpaid_leave_balance || 0}
                  </MDTypography>
                  <MDTypography variant="body2" color="text.secondary">
                    Unpaid Leave Balance
                  </MDTypography>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </div>
    </Grid>
  );
};

export default ProfileInformation;
