import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  assignPatientType,
  getAllEmergencyPatients,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  loading: false,
  data: {},
};



export const getAllPatients = createAsyncThunk(
  "emergency/getAllEmergencyPatients",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getAllEmergencyPatients(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch patients");
    }
  }
);

export const EmergencySlice = createSlice({
  name: "emergency",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getAllPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPatients.fulfilled, (state, { payload }) => {
        state.data = payload;
        state.loading = false;
      })
      .addCase(getAllPatients.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default EmergencySlice.reducer;
