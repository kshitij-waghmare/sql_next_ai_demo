import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  champions: [],
};

const championsSlice = createSlice({
  name: "champions",
  initialState: initialState,
  reducers: {
    setChampions: (state, action) => {
      state.champions = action.payload;
    },
  },
});

export const { setChampions } = championsSlice.actions;

export default championsSlice.reducer;
