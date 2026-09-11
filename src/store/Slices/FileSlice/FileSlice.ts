import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  file: null as File | null,
  submitReviewTriggered: false,
  resubmitTriggered: false,
};

const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    setFile: (state, action) => {
      state.file = action.payload;
    },
    triggerSubmitReview: (state) => {
      state.submitReviewTriggered = true;
    },
    clearSubmitReviewTrigger: (state) => {
      state.submitReviewTriggered = false;
    },
    triggerResubmit: (state) => {
      state.resubmitTriggered = true;
    },
    clearResubmitTrigger: (state) => {
      state.resubmitTriggered = false;
    },
  },
});

export const {
  setFile,
  triggerSubmitReview,
  clearSubmitReviewTrigger,
  triggerResubmit,
  clearResubmitTrigger,
} = fileSlice.actions;

export default fileSlice.reducer;

