import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/AdminBoard.module.css";
import {
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiKey,
  FiActivity,
  FiMonitor,
} from "react-icons/fi";

const Adminboard = ({ isShrunk }) => {
  const navigate = useNavigate();

  const sections = [
    { label: "New User", path: "/adminboard/newUser", icon: <FiUserPlus /> },
    {
      label: "Existing Users",
      path: "/adminboard/existingUser",
      icon: <FiUserCheck />,
    },
    {
      label: "Reset Password",
      path: "/adminboard/resetPassword",
      icon: <FiKey />,
    },
    {
      label: "Deleted Users",
      path: "/adminboard/deletedUsers",
      icon: <FiUserX />,
    },
    { label: "User Logs", path: "/adminboard/userLogs", icon: <FiActivity /> },
    {
      label: "Live Sessions",
      path: "/adminboard/liveSession",
      icon: <FiMonitor />,
    },
  ];

  return (
    <div className={styles.adminBoardContainer}>
      <h2 className={styles.title} onClick={() => navigate("/adminboard")}>
        Admin Dashboard
      </h2>
      {!isShrunk && (
        <div className={styles.cardContainer}>
          {sections.map(({ label, path, icon }, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() => navigate(path)}
            >
              <div className={styles.icon}>{icon}</div>
              <div className={styles.label}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Adminboard;
