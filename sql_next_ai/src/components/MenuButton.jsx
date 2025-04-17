import React, { useEffect, useRef, useState } from 'react';
import styles from "./styles/MenuButton.module.css";
import { useUserContext } from '../context/UserContext';
import { sendDeleteRequest } from '../utils/helpers';
import { allowedRoles } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

const APP_VERSION = "v1.0.0"; // Replace this with your dynamic version if needed

const API_URL = import.meta.env.VITE_API_URL;

const MenuButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { profile, sessionActive, setIsLoggedIn } = useUserContext();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMenuItemClick = (item) => {
    if (item === "logout") {
      setIsLoggedIn(false);
    }
    else if (item === "accountDelete") {
        const token = localStorage.getItem("token");
        // Handle account deletion request here
        alert("Account deletion request sent.");
        sendDeleteRequest(profile.user_id, token, API_URL )
    }
    else if(item === "admin") {
      // Redirect to admin dashboard
      navigate('/adminboard');
      setIsOpen(false);
    }
    // future item handlers can go here
  };

  if (!profile || Object.keys(profile).length === 0) return null;

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <button className={styles.menuBtn} onClick={toggleMenu}>
        {profile.firstName[0]}{profile.lastName[0]}
      </button>

      {isOpen && (
        <div className={styles.menuWrapper}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{profile.firstName} {profile.lastName}</div>
            <div className={styles.userEmail}>{profile.email}</div>
          </div>

          <div className={styles.menuActions}>
            {allowedRoles.includes(profile.roleName) && (
              <div className={styles.menuItem} onClick={() => handleMenuItemClick("admin")}>
                Admin Dashboard
              </div>
            )}
            <div className={styles.menuItem} onClick={() => handleMenuItemClick("accountDelete")}>
              Request Account Deletion
            </div>
            <div className={styles.menuItem} onClick={() => handleMenuItemClick("logout")}>
              Logout
            </div>
          </div>

          <div className={styles.sessionStatus}>
            <div
              className={`${styles.statusDot} ${sessionActive ? styles.statusActive : styles.statusInactive}`}
            />
            Session {sessionActive ? "Active" : "Inactive"}
          </div>

          <div className={styles.appVersion}>
            {APP_VERSION}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuButton;
