import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import { getDashboardAnalytics } from "../../../helpers/backend_helper";

const initialState = {
  data: null,
  loading: false,
};

export const fetchDashboardAnalytics = createAsyncThunk(
  "getDashboardAnalytics",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getDashboardAnalytics(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const {} = dashboardSlice.actions;

export default dashboardSlice.reducer;
