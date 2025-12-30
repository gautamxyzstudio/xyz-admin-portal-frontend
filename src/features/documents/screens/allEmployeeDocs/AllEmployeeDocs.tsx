/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import OwnDocs from '../ownDocs/OwnDocs';
import { useSelector } from 'react-redux';
import { userInState } from '../../../auth/authSlice';
import { employeeListInState } from '../../../employee/employeeSlice';
import { useGetEmployeeListQuery } from '../../../employee/employeeApis';
import { Box, Typography, Button } from '@mui/material';

// New manager component
const AllEmployeeDocs = () => {
  const user = useSelector(userInState);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);

  // We'll use employeeListInState to get the list
  const employeeList = useSelector(employeeListInState);

  // Fetch employees if list is empty and user is HR/Admin
  useGetEmployeeListQuery({ user_type: user?.user_type ?? '' });

  // Handler for selecting an employee
  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee);
  };

  // For HR/Admin, show employee list first, then docs for selected employee
  return (
    <>
      {!selectedEmployee ? (
        <Box>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Select an Employee
          </Typography>
          <Box>
            {employeeList && employeeList.length > 0 && user && user.id ? (
              employeeList
                .filter((employee) => employee.id !== user.id) // Hide current logged-in employee
                .map((employee) => (
                  <Box
                    key={employee.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={2}
                    mb={1}
                    sx={{
                      border: '1px solid #eee',
                      borderRadius: 2,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <Box display="flex" alignItems="center">
                      <img
                        src={
                          employee.image || '/static/images/avatar/default.jpg'
                        }
                        alt={employee.name}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginRight: 16,
                        }}
                      />
                      <div>
                        <Typography variant="h6">
                          {employee.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.designation} | {employee.email}
                        </Typography>
                      </div>
                    </Box>
                    <Button variant="outlined" >
                      View Documents
                    </Button>
                  </Box>
                ))
            ) : (
              <Typography>No employees found.</Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box>
          <Button
            variant="text"
            color="info"
            onClick={() => setSelectedEmployee(null)}
          >
            ← Back to Employee List
          </Button>
          <OwnDocs
            userId={selectedEmployee.id}
            canDelete
            employeeName={selectedEmployee.name}
          />
        </Box>
      )}
    </>
  );
};

export default AllEmployeeDocs;
