import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserLogs } from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  user: null,
  loading: false,
};

export const fetchUserLogs = createAsyncThunk(
  "getUserLogs",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getUserLogs(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

const logSlice = createSlice({
  name: "Log",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserLogs.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.payload;
      })
      .addCase(fetchUserLogs.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {} = logSlice.actions;

export default logSlice.reducer;
