import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
// import BlogPost from './layouts/blogPost/index.jsx';
// import Editor from './examples/Editor/index.jsx';
import HolidayList from "./features/holydayList/screens/holydayList/HolydayList";
import AddHoliday from "./features/holydayList/screens/addHoliday/AddHoliday";
import EditHoliday from "./features/holydayList/screens/editHoliday/EditHoliday";
import LoginPage from "./features/auth/screens/login/Login";
import { Provider } from "react-redux";
import store, { persistor } from "./state/store";
import EmployeeList from "./features/employee/screens/employeeList/EmployeeList";
import AddEmployee from "./features/employee/screens/addEmployee/AddEmployee";
import SnackBarProvider from "./wrappers/snackbarContext/SnackbarProvider.js";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import LeaveList from "./features/leaves/screens/leaveList/LeaveList";
import CreateLeave from "./features/leaves/screens/createLeave/CreateLeave";
import AttendanceList from "./features/AttendanceList/screens/AttendanceList";
import Dashboard from "./features/dashboard/screens/Dashboard";
import EditEmployee from "./features/employee/screens/editEmployee/EditEmployee";
import ProfileList from "./features/profile/screens/profileList/ProfileList";
import EmployeeDocs from "./features/documents/screens/employee/EmployeeDocs";
import AllLeaves from "./features/leaves/screens/allLeaves/AllLeaves";
import AllEmployeeDocs from "./features/documents/screens/allEmployeeDocs/AllEmployeeDocs";
import { ThemeProvider } from "@mui/material";
import theme from "./theme/theme.js";
import { LoadingWrapperProvider } from "./wrappers/loadingWrapper/LoadingWrapper.context.js";
import DashboardLayout from "./examples/LayoutContainers/DashboardLayout/DashboardLayout.js";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="app">
          <LoadingWrapperProvider>
            <SnackBarProvider>
              <ThemeProvider theme={theme}>
              
                <Routes>
                  <Route element={<PrivateRoute />}>
                    <Route
                      path="/"
                      element={
                        <DashboardLayout>
                          <Dashboard />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="employees"
                      element={
                        <DashboardLayout>
                          <EmployeeList />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="attendance"
                      element={
                        <DashboardLayout>
                          <AttendanceList />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="leaves"
                      element={
                        <DashboardLayout>
                          <LeaveList />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="all-leaves"
                      element={
                        <DashboardLayout>
                          <AllLeaves />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="leaves/create"
                      element={
                        <DashboardLayout>
                          <CreateLeave />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="leaves/update"
                      element={
                        <DashboardLayout>
                          <CreateLeave />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="documents"
                      element={
                        <DashboardLayout>
                          <EmployeeDocs />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="all-employee-docs"
                      element={
                        <DashboardLayout>
                          <AllEmployeeDocs />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="employees/register"
                      element={
                        <DashboardLayout>
                          <AddEmployee />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="employees/:name"
                      element={
                        <DashboardLayout>
                          <EditEmployee />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <DashboardLayout>
                          <ProfileList />
                        </DashboardLayout>
                      }
                    />

                    <Route
                      path="holidays"
                      element={
                        <DashboardLayout>
                          <HolidayList />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="holidays/add"
                      element={
                        <DashboardLayout>
                          <AddHoliday />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="holidays/edit/:id"
                      element={
                        <DashboardLayout>
                          <EditHoliday />
                        </DashboardLayout>
                      }
                    />
                    {/* <Route
                      path="blog"
                      element={
                        
                          <BlogPost />
                        
                      }
                    />
                    <Route
                      path="blog/post_blog"
                      element={
                        
                          <Editor />
                        
                      }
                    />
                    <Route
                      path="blog/edit_blog/:id" // Route for editing a blog post
                      element={
                        
                          <Editor />
                        
                      }
                    /> */}
                  </Route>
                  <Route path="/login" element={<LoginPage />} />
                </Routes>
              </ThemeProvider>
            </SnackBarProvider>
          </LoadingWrapperProvider>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </PersistGate>
    </Provider>
  );
};

export default App;
