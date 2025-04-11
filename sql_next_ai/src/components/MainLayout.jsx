import React from "react";
import { Outlet } from "react-router-dom";
import styles from "../app.module.css";
import SSOHeader from "./headers/SSOHeader";
import CustomLoginHeader from "./headers/CustomLoginHeader";

const MainLayout = () => {
  const LOGIN_TYPE = import.meta.env.VITE_LOGIN_TYPE;

  return (
    <div className={styles.dashBoardWrapper}>
      {LOGIN_TYPE === "SSO" ? <SSOHeader /> : <CustomLoginHeader />}
      <Outlet />
    </div>
  );
};

export default MainLayout;
