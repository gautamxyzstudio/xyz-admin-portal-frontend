import { useGetEmployeeListQuery } from '../../../employee/employeeApis';
import type { IEmployee } from '../../../employee/types';

// @mui material components
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

// @mui icons
import EmailIcon from '@mui/icons-material/Email';

// Material Dashboard 2 React components
import MDBox from '../../../../components/MDBox/MDBox';
import MDTypography from '../../../../components/MDTypography/index';
import { employeeListInState } from '../../../employee/employeeSlice';
import { userInState } from '../../../auth/authSlice';
import { useSelector } from 'react-redux';
import React from 'react';

interface EmployeeDirectoryProps {
  userType?: string;
}

const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  userType = 'Employee',
}) => {
  const { isLoading: isLoadingEmployees } = useGetEmployeeListQuery({
    user_type: userType,
  });

  const employeeList = useSelector(employeeListInState);
  const currentUser = useSelector(userInState);

  // Filter out the current user from the employee list
  const filteredEmployeeList = employeeList?.filter(
    (employee: IEmployee) => employee.id !== currentUser?.id
  );

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  return (
    <MDBox>
      <MDTypography variant="h6" fontWeight="bold" mb={3}>
        Employee Directory
      </MDTypography>

      {isLoadingEmployees ? (
        <MDBox display="flex" justifyContent="center" p={4}>
          <MDTypography>Loading employees...</MDTypography>
        </MDBox>
      ) : (
        <Paper elevation={0} sx={{ maxHeight: 600, overflow: 'auto' }}>
          <List>
            {filteredEmployeeList?.map((employee: IEmployee, index: number) => (
              <React.Fragment key={employee.id}>
                <ListItem
                  sx={{
                    width: '80%',
                    gap: 2,
                    display: 'flex',
                  }}
                  alignItems="flex-start"
                >
                  <ListItemAvatar>
                    <Avatar
                      src={
                        employee?.image ?? '/static/images/avatar/default.jpg'
                      }
                      alt={employee.name}
                      sx={{ width: 56, height: 56, objectFit: 'cover' }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <MDBox display="flex" alignItems="center">
                        <MDTypography variant="h6" fontWeight="medium">
                          {employee.name}
                        </MDTypography>
                      </MDBox>
                    }
                    secondary={
                      <MDBox>
                        <MDTypography variant="body2" color="text.secondary">
                          {employee.designation}
                        </MDTypography>
                        <MDBox display="flex" alignItems="center" mt={0.5}>
                          <MDTypography variant="body2" color="text.secondary">
                            {employee.email}
                          </MDTypography>
                          <IconButton
                            size="small"
                            onClick={() => handleEmailClick(employee.email)}
                            sx={{
                              ml: 1,
                              color: '#FF7312',
                              '&:hover': {
                                backgroundColor: '#FF7312',
                                color: 'white.main',
                              },
                            }}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </MDBox>
                        <MDTypography variant="body2" color="text.secondary">
                          {employee.phoneNumber}
                        </MDTypography>
                      </MDBox>
                    }
                  />
                </ListItem>
                {index < filteredEmployeeList.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </MDBox>
  );
};

export default EmployeeDirectory;
