import React, { useState, useEffect } from "react";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";
import styles from "./styles/CustomDataGrid.module.css";

const CustomDataGrid = ({ rows, columns, rowsPerPage, resizable, pagination = true, getRowHeight }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!rows || rows.length === 0) return <p>No data available</p>;
  let _rowsPerPage = rowsPerPage;
  if (!pagination) {
    _rowsPerPage = rows.length;
  }
  // Extract rows
  const totalPages = Math.ceil(rows.length / _rowsPerPage);
  const startIdx = (currentPage - 1) * _rowsPerPage;
  const currentRows = rows.slice(startIdx, startIdx + _rowsPerPage);

  return (
    <>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <DataGrid
          style={{ height: "auto" }}
          columns={columns}
          rows={currentRows}
          defaultColumnOptions={{
            resizable: resizable,
          }}
          rowHeight={getRowHeight}
        />
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className={styles.paginationBtnWrapper}>
          <button className={styles.paginationBtn} disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
            Previous
          </button>

          <span style={{ fontWeight: "bold", margin: "0 10px" }}>
            Page {currentPage} of {totalPages}
          </span>

          <button className={styles.paginationBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default CustomDataGrid;
