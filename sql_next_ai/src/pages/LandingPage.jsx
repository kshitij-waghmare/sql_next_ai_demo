import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/LandingPage.module.css";
import databaseIcon from "../assets/database.png";
import codeIcon from "../assets/code.png";
import mastekLogo from "../assets/Mastek_Logo.png";

const LandingPage = () => {
  const [isGrey, setIsGrey] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGrey((prevState) => !prevState);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.landingContainerD}>
      <div className={styles.backgroundAnimationD}></div>
      <main className={styles.contentD}>
        <div className={styles.iconContainerD}>
          <div className={styles.relativeD}>
            <img
              src={databaseIcon}
              alt="Database Icon"
              className={`${styles.iconDatabase} ${isGrey ? styles.iconDatabaseGreyD : styles.iconDatabaseWhiteD}`}
            />
            <img src={codeIcon} alt="Code Icon" className={styles.iconCodeD} />
          </div>
        </div>
        <h1 className={styles.staticTitleD}>SQL Automation</h1>
        <p className={styles.versionD}>Version 1.0.0</p>
        <p className={styles.descriptionD}>Streamline your database operations with intelligent automation</p>
        <div className={styles.buttonsD}>
          <Link to="/login" className={`${styles.btn} ${styles.btnPrimaryD}`}>
            Login →{" "}
          </Link>
          <Link to="/signup" className={`${styles.btn} ${styles.btnSecondaryD}`}>
            Sign Up →{" "}
          </Link>
        </div>
      </main>
      <img src={mastekLogo} alt="Mastek Logo" className={styles.mastekLogoD} />
    </div>
  );
};

export default LandingPage;
