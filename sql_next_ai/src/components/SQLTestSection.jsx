import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./styles/SQLTestSection.module.css";
import axios from "axios";
import { safeLogUserAction } from "../utils/logUserAction";

import { setSqlQuery, setReportStatus, resetSqlState } from "../features/sqlTestSlice";

const SQLTestSection = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const { sqlQuery, reportStatus } = useSelector((state) => state.sqlTest);

  const { csvData, isProcessing, isDownloading, reportFileName } = reportStatus;

  const LOADING_MESSAGE = "Please wait...";
  const NO_ORACLE_ERROR = "No Oracle error found";

  const [reportGenMsg, setReportGenMsg] = useState({ type: "", text: "" });
  const [oracleErrorMsg, setOracleErrorMsg] = useState("");

  const handleChange = (e) => {
    dispatch(setSqlQuery(e.target.value));
  };

  const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Regular expression to match bind variables that start with either ':=' or '=:' followed by alphanumeric characters or underscores
  const extractBindVariables = (query) => {
    const regex = /= :\w+|=:\w+/g;
    return query.match(regex);
  };

  const isDateTimeFormat = (value) => {
    const dateTimeRegex = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/;
    return dateTimeRegex.test(value);
  };

  const processBindVariables = (sqlQuery, bindVariables) => {
    const bindValues = {}; // Store user inputs
    let updatedSql = sqlQuery.trim();

    for (let i = 0; i < bindVariables.length; i++) {
      const variable = bindVariables[i];

      if (!bindValues[variable]) {
        if (isDateTimeFormat(variable)) {
          const defaultDate = "2025/01/01 00:00:00";
          console.log(`Skipping prompt for ${variable}. Using default: ${defaultDate}`);
          bindValues[variable] = defaultDate;
        } else {
          const userValue = prompt(`Please provide a value for ${variable}:`);
          if (userValue) {
            bindValues[variable] = userValue;
          } else {
            alert(`Bind variable ${variable} is required.`);
            return null; // Stop processing if user cancels or provides empty input
          }
        }
      }
    }

    // Replace all occurrences of bind variables with their values
    for (let variable in bindValues) {
      const regex = new RegExp(`[:= ]?${variable}`, "g");
      updatedSql = updatedSql.replace(regex, " = " + bindValues[variable]);
    }

    return updatedSql;
  };

  const handleTestButtonClick = async () => {
    setReportGenMsg({ type: "", text: "" });
    setOracleErrorMsg("");

    const newUniqueId = generateUniqueId();
    dispatch(setReportStatus({ uniqueId: newUniqueId, isProcessing: true })); // Store the unique ID in state

    let updatedSqlQuery = sqlQuery.trim();

    // Step 1: Extract bind variables using the previous extractBindVariables function
    const bindVariables = extractBindVariables(updatedSqlQuery);

    // Step 2: Process Bind Variables
    if (Array.isArray(bindVariables) && bindVariables.length) {
      updatedSqlQuery = processBindVariables(updatedSqlQuery, bindVariables);
      dispatch(setSqlQuery(updatedSqlQuery));
    }

    // Step 3: Process SQL Query
    if (!sqlQuery || sqlQuery.trim() === "") {
      alert("Please enter a valid SQL query.");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const fileName = `SQL_AUTOMATION_REPORT_${timestamp}`;
    dispatch(
      setReportStatus({
        reportFileName: fileName,
      })
    );

    try {
      if (!fileName) {
        setReportGenMsg({ type: "error", text: "Report file name is missing." });
        return;
      }

      const requestData = {
        reportName: fileName, // Include report file name as expected by the backend
        sqlQuery: updatedSqlQuery, // The SQL query generated
      };

      // Insert the record with the generated uniqueId
      await axios.post(`${API_URL}/sql/insert`, {
        uniqueId: newUniqueId,
        sqlQuery: sqlQuery,
        created_by: typeof user !== "undefined" ? user.id : "unknown",
        created_on: timestamp,
      });

      const response = await axios.post(`${API_URL}/report/frontend-update`, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        dispatch(
          setReportStatus({
            csvData: response.data.csvData,
            isProcessing: false,
          })
        );
        setReportGenMsg({
          type: "success",
          text: `Report ${fileName}.xlsx generated successfully!`,
        });
      }
    } catch (error) {
      if (error.response && error.response.data.oracleError) {
        // if(error.response.daa.oracleError !== NO_ORACLE_ERROR)
        setOracleErrorMsg(error.response.data.oracleError); // Show Oracle error from the server
      }
      dispatch(
        setReportStatus({
          isProcessing: false,
        })
      );
      setReportGenMsg({
        type: "error",
        text: `Error in generating report ${fileName}.xlsx!`,
      });
      //   alert("Failed to save SQL file. Please try again.");
    } finally {
      try {
        await safeLogUserAction(
          typeof instance !== "undefined" && instance !== null ? instance : undefined,
          "Clicked on SQL Test Button",
          `User Tested the SQL Query after clicking on Test Button.`
        );
      } catch (error) {
        dispatch(setErrorMessage(`Failed to log user action`));
      }
    }
  };

  const handleClearButtonClick = () => {
    dispatch(resetSqlState());
    setReportGenMsg({ type: "", text: "" });
    setOracleErrorMsg("");
    // setIsDownloadButton('');
    // setCsvData('');
  };

  const handleDownloadReport = async () => {
    dispatch(
      setReportStatus({
        isDownloading: true,
      })
    );
    try {
      const response = await axios.get(`${API_URL}/report/download-report/${reportFileName}`, {
        responseType: "blob", // Ensure the response is treated as a file
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.data);
      link.download = reportFileName + ".xlsx";
      link.click();
      setReportGenMsg({ type: "success", text: `Report ${reportFileName}.xlsx downloaded successfully!` });
      dispatch(setReportStatus({ isDownloading: false }));
    } catch (error) {
      setReportGenMsg({ type: "error", text: `Error downloading Report ${reportFileName}.xlsx` });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.sqlTestWrapper}>
        <div className={styles.textAreaWrapper}>
          <h4 className={styles.sqlTestingTitle}>SQL Testing</h4>
          <textarea
            className={styles.sqlTextArea}
            value={sqlQuery}
            placeholder="Paste your SQL query (no semicolon at the end)..."
            onChange={handleChange}
          ></textarea>
        </div>
        <div className={styles.testBtnWrapper}>
          <button className={styles.clearBtn} disabled={sqlQuery === "" && csvData === ""} onClick={handleClearButtonClick}>
            CLEAR
          </button>
          <button className={styles.testBtn} disabled={sqlQuery === ""} onClick={handleTestButtonClick} title="TEST">
            TEST
          </button>
        </div>
      </div>
      {oracleErrorMsg && <div className={styles.oracleError}>{oracleErrorMsg}</div>}
      {/*Success & Error Messages */}
      {reportGenMsg.type && reportGenMsg.text && (
        <div className={`${styles.reportGenMsg} ${styles[`${reportGenMsg.type}`]} `}>{reportGenMsg.text}</div>
      )}

      {/*Appears when the testing is in process*/}
      {isProcessing && <div className={styles.loadingMessage}>{LOADING_MESSAGE}</div>}

      <div className={styles.downloadButtonWrapper}>
        <button className={styles.downloadButton} onClick={handleDownloadReport} disabled={!csvData}>
          {`DOWNLOAD REPORT`}
        </button>
      </div>
    </div>
  );
};

export default SQLTestSection;
