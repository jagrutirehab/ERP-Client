import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import {
  getPatientTimeline,
  getUserTimeline,
} from "../../../helpers/backend_helper";
// import { extraAction } from "../extraAction";

const initialState = {
  user: null,
  patient: null,
  loading: false,
};

export const fetchUserTimeline = createAsyncThunk(
  "getUserTimeline",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getUserTimeline(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchPatientTimeline = createAsyncThunk(
  "getPatientTimeline",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPatientTimeline(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const billSlice = createSlice({
  name: "Timeline",
  initialState,
  reducers: {
    resetOpdPatientTimeline: (state) => {
      state.patient = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTimeline.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserTimeline.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.payload;
      })
      .addCase(fetchUserTimeline.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchPatientTimeline.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientTimeline.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.patient = payload.payload;
      })
      .addCase(fetchPatientTimeline.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { resetOpdPatientTimeline } = billSlice.actions;

export default billSlice.reducer;
