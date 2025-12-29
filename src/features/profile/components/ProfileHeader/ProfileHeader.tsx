import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../state/store';

// @mui material components
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

// Material Dashboard 2 React components
import MDBox from '../../../../components/MDBox/MDBox';
import MDTypography from '../../../../components/MDTypography/index';

const ProfileHeader: React.FC = () => {
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const [avatarError, setAvatarError] = useState(false);

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  const avatarSrc =
    !avatarError && userDetails?.photo
      ? userDetails.photo
      : '/static/images/avatar/default.jpg';

  return (
    <Card>
      <MDBox
        display="flex"
        alignItems="center"
        p={3}
        variant="gradient"
        bgColor="warning"
        borderRadius="lg"
        coloredShadow="dark"
      >
        <Avatar
          src={avatarSrc}
          alt={userDetails?.name || 'Profile'}
          sx={{
            width: 120,
            height: 120,
            border: '4px solid white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
          onError={() => setAvatarError(true)}
        />
        <MDBox ml={3}>
          <MDTypography variant="h4" fontWeight="bold" color="white">
            {userDetails?.name || 'User Name'}
          </MDTypography>
          <MDTypography variant="h6" color="white" opacity={0.9}>
            {userDetails?.designation || 'Designation'}
          </MDTypography>
          <Chip
            label={getStatusText(userDetails?.status || 'active')}
            color={getStatusColor(userDetails?.status || 'active')}
            sx={{ mt: 1, color: 'white' }}
          />
        </MDBox>
      </MDBox>
    </Card>
  );
};

export default ProfileHeader;
