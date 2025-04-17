import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "../app.module.css";
import SSOHeader from "./headers/SSOHeader";
import CustomLoginHeader from "./headers/CustomLoginHeader";

const MainLayout = () => {
  const LOGIN_TYPE = import.meta.env.VITE_LOGIN_TYPE;
  const location = useLocation();

  // Check if the current path is the root path ("/")
  // and return the Outlet without any header
  if (LOGIN_TYPE === 'CUSTOM' && location.pathname === "/") {
    return <Outlet />;
  }

  return (
    <div className={styles.dashBoardWrapper}>
      {LOGIN_TYPE === "SSO" ? <SSOHeader /> : <CustomLoginHeader />}
      <Outlet />
    </div>
  );
};

export default MainLayout;
