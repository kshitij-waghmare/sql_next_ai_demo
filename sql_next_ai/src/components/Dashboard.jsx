import { useRef } from "react";
import styles from "../App.module.css";
import ChampionsTable from "./ChampionsTable";
import FileProcessPrompt from "./FileProcessPrompt";
import FileUploadSection from "./FileUploadSection";
import { ReportTable } from "./ReportTable";
import SQLTestSection from "./SQLTestSection";

const Dashboard = () => {
  const contentRef = useRef(null);
  return (
    <div className={styles.content} ref={contentRef}>
      <div className={styles.wrapper}>
        <div className={styles.leftWrapper}>
          <FileUploadSection />
          <ChampionsTable />
        </div>
        <div className={styles.rightWrapper}>
          <FileProcessPrompt />
          <SQLTestSection />
        </div>
      </div>
      <ReportTable contentRef={contentRef} />
    </div>
  );
};
export default Dashboard;
