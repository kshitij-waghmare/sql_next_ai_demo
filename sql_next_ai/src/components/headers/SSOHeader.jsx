import React from "react";
import wordIcon from "../../assets/word-icon.png";
import styles from "../styles/Header.module.css";

const SSOHeader = () => {
  const documentPath = import.meta.env.VITE_REFERENCE_RD_PATH;

  return (
    <header className={styles.appHeader}>
      <div className={styles.leftHeader}>
        <span className={styles.title} onClick={()=>{navigate('/')}}>SQLNEXT.AI</span>
        <span className={styles.version}>version 1.0.0</span>
      </div>
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

export default SSOHeader;
