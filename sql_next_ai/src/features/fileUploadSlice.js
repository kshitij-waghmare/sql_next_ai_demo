import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  errorMessage: '',
  successMessage: '',
  isAttachButtonDisabled: false,
  interactionId: '',
};

const fileUploadSlice = createSlice({
  name: 'fileUpload',
  initialState,
  reducers: {
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    setIsAttachButtonDisabled: (state,action)=>{
      state.isAttachButtonDisabled = action.payload;
    },
    setInteractionId: (state,action) => {
      state.interactionId = action.payload;
    },
    resetFileUploadSlice: ()=> {
      return initialState}
  },
});

export const {
  setErrorMessage,
  setSuccessMessage,
  setIsAttachButtonDisabled,
  setInteractionId,
  resetFileUploadSlice
} = fileUploadSlice.actions;

export default fileUploadSlice.reducer;
