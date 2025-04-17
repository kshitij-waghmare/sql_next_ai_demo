import React from "react";
import wordIcon from "../../assets/word-icon.png";
import styles from "../styles/Header.module.css";
import MenuButton from "../MenuButton";
import SideDrawer from "../SideDrawer";
import { useNavigate } from "react-router-dom";

const CustomLoginHeader = () => {
  const documentPath = import.meta.env.VITE_REFERENCE_RD_PATH;
  const navigate = useNavigate();

  const showRightElements = location.pathname.startsWith("/dashboard");
  const showUserElements = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/adminboard");


  return (
    <header className={styles.appHeader}>
      <div className={styles.leftHeader}>
        <div className={styles.title} onClick={()=>navigate('/')}>SQLNEXT.AI</div>
      </div>
      {
        <div className={styles.desktopOnly}>
      {showRightElements && <div className={styles.rightHeader}>
        <div
          onClick={() =>
            window.open("/helpPage", "_blank", "noopener,noreferrer")
          }
          className={styles.helpBtn}
        >
          Help and Resources
        </div>
        <a
          className={styles.downloadRdLink}
          href={documentPath}
          title="Download Reference Document"
          download={"Report_Requirement_Document_V1.0.docx"}
        >
          Reference RD
          <img
            className={styles.downloadRdWordIcon}
            src={wordIcon}
            alt="Download Word Document"
          />
        </a>
      </div>}
      </div>
      }
      {showUserElements && <MenuButton/>}
      {
        <div className={styles.mobileOnly}>
      <div className={styles.rightHeader}>
          <SideDrawer />
      </div>
      </div>
      }
    </header>
  );
};

export default CustomLoginHeader;
