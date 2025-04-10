import React from "react";
import wordIcon from "../assets/word-icon.png";
import styles from "./styles/Header.module.css";

const Header = () => {
  const documentPath = import.meta.env.VITE_REFERENCE_RD_PATH;

  return (
    <header className={styles.appHeader}>
      <div className={styles.leftHeader}>SQLNEXT.AI</div>
      <div className={styles.rightHeader}>
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
      </div>
    </header>
  );
};

export default Header;
