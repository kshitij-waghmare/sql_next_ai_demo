import { useRef } from "react";
import styles from "./App.module.css";
import ChampionsTable from "./components/ChampionsTable";
import FileProcessPrompt from "./components/FileProcessPrompt";
import FileUploadSection from "./components/FileUploadSection";

import Header from "./components/Header";
import { ReportTable } from "./components/ReportTable";
import SQLTestSection from "./components/SQLTestSection";
import Chatbot from "./components/ChatBot";

function App() {
  const contentRef = useRef(null); 
  return (
    <>
      <Header />
      <div className={styles.content} ref={contentRef}>
        <div className={styles.wrapper}>
          <div className={styles.leftWrapper}>
              <FileUploadSection/>
              <ChampionsTable/>
          </div>
          <div className={styles.rightWrapper}>
            <FileProcessPrompt/>
            <SQLTestSection/>
          </div>
        </div>
          <ReportTable contentRef={contentRef}/>
      </div>
      {/* <Chatbot/> */}
    </>
  );
}

export default App;
