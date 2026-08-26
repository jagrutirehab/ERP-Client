import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCenterDashboardLive } from "../../../helpers/backend_helper";

export const fetchCenterDashboardLive = createAsyncThunk(
  "centerDashboard/fetchCenterDashboardLive",
  async (data, { rejectWithValue }) => {
    try {
      const response = await getCenterDashboardLive(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch Center Dashboard"
      );
    }
  }
);

const initialState = {
  data: [],
  month: null,
  loading: false,
  error: null,
};

const centerDashboardSlice = createSlice({
  name: "centerDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCenterDashboardLive.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenterDashboardLive.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.payload?.data || [];
        state.month = action.payload.payload?.month || null;
      })
      .addCase(fetchCenterDashboardLive.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
        state.month = null;
      });
  },
});

export default centerDashboardSlice.reducer;
