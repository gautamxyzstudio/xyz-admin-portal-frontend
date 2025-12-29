import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedAccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: 3,
      }}
    >
      <Box>
        <Typography variant="h1" color="error" fontWeight="bold" mb={2}>
          403
        </Typography>
        <Typography variant="h4" color="text" mb={2}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </Typography>
        <Button
          variant="contained"
          color="info"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Go to Dashboard
        </Button>
        <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    </Box>
  );
};

export default UnauthorizedAccess;
