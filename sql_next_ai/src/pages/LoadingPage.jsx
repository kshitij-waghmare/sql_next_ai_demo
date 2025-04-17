import React from "react";
import styles from "../App.module.css";

const LoadingPage = () => {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.spinner} />
      <p className={styles.loadingText}>Loading...</p>
    </div>
  );
};

export default LoadingPage;
