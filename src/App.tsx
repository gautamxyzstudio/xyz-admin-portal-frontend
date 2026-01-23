import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoutes";
import HolidayList from "./features/holydayList/screens/holydayList/HolydayList";
import LoginPage from "./features/auth/screens/login/Login";
import { Provider } from "react-redux";
import store, { persistor } from "./state/store";
import EmployeeList from "./features/employee/screens/employeeList/EmployeeList";
import AddEmployee from "./features/employee/screens/addEmployee/AddEmployee";
import SnackBarProvider from "./wrappers/snackbarContext/SnackbarProvider.js";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import LeaveList from "./features/leaves/screens/leaveList/LeaveList";
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
import BlogList from "./features/blogs/screens/blogList/BlogList.js";
import BlogEditor from "./features/blogs/screens/blogEditor/index.jsx";
import AnnouncementList from "./features/announcements/screens/AnnouncementsList/AnnouncementsList.js";

const App: React.FC = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

useEffect(() => {
  const checkAccess = () => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    const maxTouch = navigator.maxTouchPoints || 0;

    // 1. Mobile OS keywords check
    const isMobileUA = /android|iphone|ipod|ipad/.test(ua);
    
    const isDesktopModeOnMobile = (platform.includes("linux") || platform.includes("mac")) && maxTouch > 1;

    // 3. iPad / Tablet Specific
    const isIPad = platform === "macintel" && maxTouch > 1;

   
    if (isMobileUA || isDesktopModeOnMobile || isIPad) {
      
      const isRealWindowsLaptop = platform.includes("win32") && maxTouch > 0;
      
      if (isRealWindowsLaptop && window.innerWidth > 1024) {
        setIsBlocked(false);
      } else {
        setIsBlocked(true);
      }
    } else {
      // Screen width check for extra safety
      if (window.innerWidth <= 1024) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    }
    
    setIsChecking(false);
  };

  checkAccess();
  window.addEventListener("resize", checkAccess);
  return () => window.removeEventListener("resize", checkAccess);
}, []);

  // ⏳ Prevent UI flicker
  if (isChecking) return null;

  // 🚫 BLOCK SCREEN
  if (isBlocked) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-9999 flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl p-8 max-w-sm shadow-2xl border-t-4 border-red-500">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 text-sm">
            This portal is{" "}
            <b>only accessible on a physical Desktop or Laptop</b>. Mobile
            devices and <b>Desktop Mode</b> are not allowed.
          </p>
          <p className="mt-4 text-xs text-gray-400 italic">
            Please use a computer to continue.
          </p>
        </div>
      </div>
    );
  }

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
                      path="announcement"
                      element={
                        <DashboardLayout>
                          <AnnouncementList />
                        </DashboardLayout>
                      }
                    />

                    <Route
                      path="blog"
                      element={
                        <DashboardLayout>
                          <BlogList />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="blog/post_blog"
                      element={
                        <DashboardLayout>
                          <BlogEditor />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="blog/edit_blog/:id" // Route for editing a blog post
                      element={
                        <DashboardLayout>
                          <BlogEditor />
                        </DashboardLayout>
                      }
                    />
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
