import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getLeadAnalytics,
  getOPDAnalytics,
  getPatientAnalytics,
  getReport,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  data: null,
  finance: null,
  patient: null,
  lead: null,
  opd: null,
  loading: false,
};

export const fetchReport = createAsyncThunk(
  "getReport",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getReport(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchPatientAnalytics = createAsyncThunk(
  "getPatientAnalytics",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPatientAnalytics(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchLeadAnalytics = createAsyncThunk(
  "getLeadAnalytics",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getLeadAnalytics(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchOPDAnalytics = createAsyncThunk(
  "getOPDAnalytics",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getOPDAnalytics(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

const reportSlice = createSlice({
  name: "Report",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(fetchReport.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchPatientAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientAnalytics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.patient = payload.payload;
      })
      .addCase(fetchPatientAnalytics.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchLeadAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeadAnalytics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.lead = payload.payload;
      })
      .addCase(fetchLeadAnalytics.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchOPDAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOPDAnalytics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.opd = payload.payload;
      })
      .addCase(fetchOPDAnalytics.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {} = reportSlice.actions;

export default reportSlice.reducer;
