import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getBookingAnalytics,
  getDoctorAnalytics,
  getLeadAnalytics,
  getOPDAnalytics,
  getPatientAnalytics,
  getReport,
  getCenterBedsAnalytics as getCenterBedsAnalyticsApi,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  data: null,
  finance: null,
  patient: null,
  lead: null,
  opd: null,
  booking: null,
  doctor: null,
  centerBeds: [],
  loading: false,
  centerBedsLoading: false,
  totalPages: 0,
  currentPage: 0,
  limit: 0,
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

export const fetchDoctorAnalytics = createAsyncThunk(
  "getDoctorAnalytics",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getDoctorAnalytics(data);
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

export const fetchBookingAnalytics = createAsyncThunk(
  "getBookingAnalytics",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getBookingAnalytics(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchCenterBedsAnalytics = createAsyncThunk(
  "getCenterBedsAnalytics",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getCenterBedsAnalyticsApi(data);
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

    builder
      .addCase(fetchBookingAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookingAnalytics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.booking = payload.payload;
        state.total = payload.total;
        state.totalPages = payload.totalPages;
        state.currentPage = payload.currentPage;
        state.limit = payload.limit;
      })
      .addCase(fetchBookingAnalytics.rejected, (state) => {
        state.loading = false;
      });
    builder
      .addCase(fetchDoctorAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctorAnalytics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.doctor = payload;
      })
      .addCase(fetchDoctorAnalytics.rejected, (state) => {
        state.loading = false;
      });
    builder
      .addCase(fetchCenterBedsAnalytics.pending, (state) => {
        state.centerBedsLoading = true;
      })
      .addCase(fetchCenterBedsAnalytics.fulfilled, (state, { payload }) => {
        state.centerBedsLoading = false;
        state.centerBeds = payload.payload || [];
      })
      .addCase(fetchCenterBedsAnalytics.rejected, (state) => {
        state.centerBedsLoading = false;
      });
  },
});

export const {} = reportSlice.actions;

export default reportSlice.reducer;
