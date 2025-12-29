
import { Card, Typography, Box, CircularProgress } from '@mui/material';
import { CheckCircle, HourglassEmpty, Cancel } from '@mui/icons-material';
import { green, orange, red } from '@mui/material/colors';
import MDBox from '../../../../components/MDBox/MDBox';
import MDButton from '../../../../components/MDButton/MDButton';
import { useSelector } from 'react-redux';
import { userDetailsInState } from '../../../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  formatDateToReadable,
  getLeaveTypeTitle,
} from '../../../../utils/utils';

const LeaveAnalytics = ({ leaves }: { leaves: any }) => {
  const userDetails = useSelector(userDetailsInState);
  const navigate = useNavigate();

  // Get recent leaves (last 3)
  const recentLeaves = leaves?.data?.slice(0, 3) || [];

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle style={{ color: green[500] }} />;
      case 'pending':
        return <HourglassEmpty style={{ color: orange[500] }} />;
      case 'rejected':
        return <Cancel style={{ color: red[500] }} />;
      default:
        return <Cancel style={{ color: red[500] }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return green[500];
      case 'pending':
        return orange[500];
      case 'rejected':
        return red[500];
      default:
        return red[500];
    }
  };

  return (
    <Card sx={{ width: '100%', p: 3 }}>
      <MDBox mb={3}>
        <div className="flex flex-row justify-between items-center">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Leaves
          </Typography>
          <MDButton
            sx={{ height: '40px' }}
            variant="gradient"
            color="success"
            onClick={() => navigate('/leaves/create')}
          >
            Apply Leave
          </MDButton>
        </div>

        {/* Leave Balance Circles */}
        <div className="flex flex-row justify-start items-start mt-4 space-x-8">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                size={120}
                variant="determinate"
                value={100}
                sx={{ color: green[200] }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ color: 'text.primary', fontWeight: 'bold' }}
                >
                  {userDetails?.leave_balance ?? 0}
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                color: 'text.primary',
                fontWeight: 'medium',
                textAlign: 'center',
              }}
            >
              Leave Balance
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              Available days
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                size={120}
                variant="determinate"
                value={100}
                sx={{ color: red[200] }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ color: 'text.primary', fontWeight: 'bold' }}
                >
                  {userDetails?.unpaid_leave_balance ?? 0}
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                color: 'text.primary',
                fontWeight: 'medium',
                textAlign: 'center',
              }}
            >
              Unpaid Leave Balance
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              Unpaid days
            </Typography>
          </Box>
        </div>
      </MDBox>

      <MDBox>
        <div className="flex flex-row justify-between items-center mb-3">
          <Typography variant="h6" fontWeight="bold">
            Recent Leaves
          </Typography>
          <MDButton
            variant="text"
            className="cursor-pointer z-30"
            color="info"
            size="medium"
            onClick={() => navigate('/leaves')}
          >
            View All
          </MDButton>
        </div>

        {recentLeaves.length > 0 ? (
          <div className="space-y-3">
            {recentLeaves.map((leave: any, index: number) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                  {getStatusIcon(leave.status)}
                  <div>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {leave.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getLeaveTypeTitle(leave.leave_duration)}
                    </Typography>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                  <Typography variant="body2" color="text.secondary">
                    {formatDateToReadable(leave.start_date)} -{' '}
                    {formatDateToReadable(leave.end_date)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getStatusColor(leave.status),
                      fontWeight: 'medium',
                    }}
                  >
                    {leave.status}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Typography variant="body1" color="text.secondary">
              No recent leaves found
            </Typography>
            <MDButton
              variant="text"
              color="primary"
              onClick={() => navigate('/leaves/create')}
              sx={{ mt: 1 }}
            >
              Request your first leave
            </MDButton>
          </div>
        )}
      </MDBox>
    </Card>
  );
};

export default LeaveAnalytics;
