import { createSlice } from "@reduxjs/toolkit";

const initalState = {
  isProcessConfirmed: false,
  isFileProcessLoading: false,
  isFileProcessed: false,
};

const fileProcessSlice = createSlice({
  name: "fileProcessSlice",
  initialState: initalState,
  reducers: {
    setFileProcess: (state, action) => {
      const { isProcessConfirmed, isFileProcessLoading, isFileProcessed } = action.payload;

      if (typeof isProcessConfirmed !== "undefined") {
        state.isProcessConfirmed = isProcessConfirmed;
      }
      if (typeof isFileProcessLoading !== "undefined") {
        state.isFileProcessLoading = isFileProcessLoading;
      }
      if (typeof isFileProcessed !== "undefined") {
        state.isFileProcessed = isFileProcessed;
      }
    },
    resetFileProcessSlice: (state, action) => {
      return initalState;
    },
  },
});

export const {setFileProcess, resetFileProcessSlice} = fileProcessSlice.actions;

export default fileProcessSlice.reducer;
