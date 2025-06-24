import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import { getBillNotification } from "../../../helpers/backend_helper";

const initialState = {
  bill: null,
  loading: false,
};

export const fetchBillNotification = createAsyncThunk(
  "getBillNotifications",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getBillNotification(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const notificationSlice = createSlice({
  name: "Notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBillNotification.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.bill = payload.payload;
      })
      .addCase(fetchBillNotification.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {} = notificationSlice.actions;

export default notificationSlice.reducer;
