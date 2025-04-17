import React, { useState } from "react";
import styles from "./styles/SideDrawer.module.css";

const SideDrawer = () => {

const DOCUMENT_PATH = import.meta.env.VITE_REFERENCE_RD_PATH;
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const handleItemClick = (item) => {
    if (item === "Download RD") {
      // initiate download 
      const link = document.createElement("a");
        link.href = DOCUMENT_PATH;
        link.download = "Report_Requirement_Document_V1.0.docx";
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
    else if(item === "Help and Resources"){
        window.open("/helpPage", "_blank", "noopener,noreferrer")
    }
    else if(item === "Refer Prompts"){
        
    }
    closeDrawer(); // optional: close after clicking
  };

  const drawerItems = ["Refer Prompts", "Help and Resources", "Download RD"];

  return (
    <>
      <button className={styles.toggleButton} onClick={toggleDrawer}>
        ☰
      </button>

      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.drawerHeader}>
          <h3>Menu</h3>
          <span className={styles.closeBtn} onClick={closeDrawer}>
            &times;
          </span>
        </div>
        <ul className={styles.drawerList}>
          {drawerItems.map((item, i) => (
            <li
              key={i}
              className={styles.drawerItem}
              onClick={() => handleItemClick(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {isOpen && <div className={styles.backdrop} onClick={closeDrawer}></div>}
    </>
  );
};

export default SideDrawer;
