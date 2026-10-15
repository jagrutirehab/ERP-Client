import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getTrainingNotificationSummary } from "../../../helpers/backend_helper";

const initialState = {
  assigned: 0,
  completion: null,
  lastCompletion: { trainingId: null, tick: 0 },
};

export const fetchTrainingNotificationSummary = createAsyncThunk(
  "getTrainingNotificationSummary",
  async (cntrs, { rejectWithValue }) => {
    try {
      const response = await getTrainingNotificationSummary(cntrs ? { cntrs } : {});
      return response?.data;
    } catch (error) {
      return rejectWithValue("something went wrong");
    }
  },
);

export const trainingNotificationSlice = createSlice({
  name: "TrainingNotification",
  initialState,
  reducers: {
    bumpAssigned: (state) => {
      state.assigned += 1;
    },
    bumpCompletion: (state, { payload }) => {
      if (state.completion !== null) state.completion += 1;
      state.lastCompletion = { trainingId: payload || null, tick: state.lastCompletion.tick + 1 };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTrainingNotificationSummary.fulfilled, (state, { payload }) => {
      state.assigned = payload?.assigned || 0;
      state.completion = payload?.completion ?? null;
    });
  },
});

export const { bumpAssigned, bumpCompletion } = trainingNotificationSlice.actions;

export default trainingNotificationSlice.reducer;
