import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import CustomDataGrid from "./CustomDataGrid";
import styles from "./styles/ReportTable.module.css";
import { smoothScrollToBottom, smoothScrollToElement } from "../utils/helpers";

export const ReportTable = ({ contentRef }) => {
  const { reportStatus } = useSelector((store) => store.sqlTest);
  const { csvData } = reportStatus;

  useEffect(() => {
    if (csvData && csvData.trim().length > 0 && contentRef.current) {
      const timeout = setTimeout(() => {
        // smoothScrollToBottom(contentRef.current, 2000); // duration
        const target = document.getElementById("reportContainer");
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        if (target) {
            smoothScrollToElement(contentRef.current, target, 800,headerHeight + 12);
          }
      }, 300);

      return () => clearTimeout(timeout); // cleanup
    }
  }, [csvData]);

  const csvDataArray = csvData.split("\n"); // Split CSV by new line to get rows
  const [header, ...rowsData] = csvDataArray;
  const columns = header.split(",").map((col, index) => ({ key: `col${index}`, name: col.trim() }));

  const rows = rowsData.map((row, rowIndex) => {
    const cells = row.split(",");
    return cells.reduce(
      (acc, cell, cellIndex) => {
        acc[`col${cellIndex}`] = cell.trim();
        return acc;
      },
      { id: rowIndex }
    );
  });

  return (
    <div
      id="reportContainer"
      className={styles.reportContainer}
      // ref={reportRef}
    >
      {csvData && csvData.includes("DATA_DS") ? (
        <p className={styles.noDataMsg}>No Data Found</p> // Apply the CSS class here
      ) : csvData ? (
        <>
          <h4 className={styles.reportHeader}>SQL Automation Report Data from Oracle Fusion Cloud</h4>
          <div className="report-content">
            <CustomDataGrid columns={columns} rows={rows} rowsPerPage={10} resizable={true}></CustomDataGrid>
          </div>
        </>
      ) : null}
    </div>
  );
};
