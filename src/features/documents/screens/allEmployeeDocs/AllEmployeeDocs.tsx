/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import OwnDocs from '../ownDocs/OwnDocs';
import { useSelector } from 'react-redux';
import { userInState } from '../../../auth/authSlice';
import MDBox from '../../../../components/MDBox/MDBox';
import MDButton from '../../../../components/MDButton/MDButton';
import MDTypography from '../../../../components/MDTypography/index';
import { employeeListInState } from '../../../employee/employeeSlice';
import DashboardLayout from '../../../../examples/LayoutContainers/DashboardLayout/index.jsx';
import { useGetEmployeeListQuery } from '../../../employee/employeeApis';

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
        <MDBox>
          <MDTypography variant="h4" fontWeight="bold" mb={3}>
            Select an Employee
          </MDTypography>
          <MDBox>
            {employeeList && employeeList.length > 0 && user && user.id ? (
              employeeList
                .filter((employee) => employee.id !== user.id) // Hide current logged-in employee
                .map((employee) => (
                  <MDBox
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
                    <MDBox display="flex" alignItems="center">
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
                        <MDTypography variant="h6">
                          {employee.name}
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                          {employee.designation} | {employee.email}
                        </MDTypography>
                      </div>
                    </MDBox>
                    <MDButton variant="outlined" color="orange">
                      View Documents
                    </MDButton>
                  </MDBox>
                ))
            ) : (
              <MDTypography>No employees found.</MDTypography>
            )}
          </MDBox>
        </MDBox>
      ) : (
        <MDBox>
          <MDButton
            variant="text"
            color="info"
            onClick={() => setSelectedEmployee(null)}
          >
            ← Back to Employee List
          </MDButton>
          <OwnDocs
            userId={selectedEmployee.id}
            canDelete
            employeeName={selectedEmployee.name}
          />
        </MDBox>
      )}
    </>
  );
};

export default AllEmployeeDocs;
