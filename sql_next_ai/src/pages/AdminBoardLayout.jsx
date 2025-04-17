// src/pages/admin/AdminboardLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./styles/AdminBoard.module.css";
import Adminboard from "./AdminBoard"; 

const AdminboardLayout = () => {
  const location = useLocation();
  const isDetailVisible = location.pathname !== "/adminboard" && location.pathname !== "/adminboard/";

  return (
    <div className={styles.mainLayout}>
      <div>
        <Adminboard isShrunk={isDetailVisible} />
      </div>
      <div className={styles.detailPanel}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminboardLayout;
