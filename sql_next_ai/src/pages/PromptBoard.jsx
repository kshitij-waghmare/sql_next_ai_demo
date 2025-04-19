import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import promptData from "../constants/PromptData.json";
import styles from "./styles/PromptBoard.module.css";

const PromptBoard = () => {
  const { promptData: _rows } = promptData;

  const rows = _rows.map((line, index) => ({
    srno: index + 1,
    ...line,
  }));

  return (
    <div className={styles.tableWrapper}>
      <h4 style={{ marginTop: 0 }}>Prompt Reference</h4>
      <table className={styles.promptTable}>
        <thead>
          <tr>
            <th style={{ width: "6%" }}>Sr. No</th>
            <th style={{ width: "12%" }}>Module</th>
            <th>Prompt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.srno}</td>
              <td>{row.category}</td>
              <td>{row.sqlPrompt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromptBoard;
