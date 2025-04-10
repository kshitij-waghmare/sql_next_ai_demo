import { createSlice } from "@reduxjs/toolkit";

const initalState = {
  sqlQuery: "",
  reportStatus: {
    uniqueId: "",
    isProcessing: false,
    csvData: "",
    isDownloading: false,
    reportFileName: ''
  },
};

const sqlTestSlice = createSlice({
  name: "sqlTest",
  initialState: initalState,
  reducers: {
    setSqlQuery: (state, action) => {
      state.sqlQuery = action.payload;
    },
    setReportStatus: (state, action) => {
      const { isProcessing, csvData, uniqueId, reportFileName, isDownloading } = action.payload;

      if (typeof isProcessing !== "undefined") {
        state.reportStatus.isProcessing = isProcessing;
      }
      if (typeof csvData !== "undefined") {
        state.reportStatus.csvData = csvData;
      }
      if (typeof uniqueId !== "undefined") {
        state.reportStatus.uniqueId = uniqueId;
      }
      if (typeof reportFileName !== "undefined") {
        state.reportStatus.reportFileName = reportFileName;
      }
      if (typeof isDownloading !== "undefined") {
        state.reportStatus.isDownloading = isDownloading;
      }
    },
    resetSqlState: (state, action) => {
      return initalState;
    },
  },
});

export const { setSqlQuery, setReportStatus, resetSqlState } = sqlTestSlice.actions;

export default sqlTestSlice.reducer;
