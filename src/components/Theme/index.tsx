import { CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import brandWhite from "../../assets/images/logo-ct.webp";
import {
  setMiniSidenav,
  useMaterialUIController,
} from "../../context/MaterialUIProvider";
import Sidenav from "../../examples/Sidenav";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { userInState } from "../../features/auth/authSlice";
import { getFilteredRoutes } from "../../routes";

const ThemeComponent = ({ children }: { children: React.ReactNode }) => {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, direction, sidenavColor } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const user = useSelector(userInState);

  // Get filtered routes based on user permissions
  const filteredRoutes = getFilteredRoutes(user?.user_type);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="bg-white overflow-scroll w-screen rounded-md scrollbar-none  h-screen">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Sidenav
          color={sidenavColor}
          brand={brandWhite}
          brandName="XYZ Studio"
          routes={filteredRoutes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
        {children}
      </ThemeProvider>
    </div>
  );
};

export default ThemeComponent;
