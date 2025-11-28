import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMIHubSpotContacts,
  getCenterLeadsMoM as fetchCenterMoM,
  getCenterLeadsMTD as fetchCenterMTD,
  getOwnerLeadsMoM as fetchOwnerMoM,
  getOwnerLeadsMTD as fetchOwnerMTD,
  getCityQualityBreakdown as fetchCityQuality,
  getOwnerQualityBreakdown as fetchOwnerQuality,
  getCityVisitDate as fetchCityVisit,
  getOwnerVisitDate as fetchOwnerVisit,
  getCityVisitedDate as fetchCityVisited,
  getOwnerVisitedDate as fetchOwnerVisited,
} from "../../../helpers/backend_helper";

const initialState = {
  contacts: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  centerLeadsMoM: [],
  centerLeadsMTD: [],
  ownerLeadsMoM: [],
  ownerLeadsMTD: [],
  cityQuality: [],
  ownerQuality: [],
  cityVisitDate: [],
  ownerVisitDate: [],
  cityVisitedDate: [],
  ownerVisitedDate: [],
  loading: false,
  error: null,
};

// Async thunk for fetching HubSpot contacts
export const fetchMIHubSpotContacts = createAsyncThunk(
  "miReporting/fetchHubSpotContacts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getMIHubSpotContacts(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch contacts"
      );
    }
  }
);

// Center Leads MoM
export const fetchCenterLeadsMoM = createAsyncThunk(
  "miReporting/fetchCenterLeadsMoM",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCenterMoM(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch center leads (MoM)"
      );
    }
  }
);

// Center Leads MTD
export const fetchCenterLeadsMTD = createAsyncThunk(
  "miReporting/fetchCenterLeadsMTD",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCenterMTD(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch center leads (MTD)"
      );
    }
  }
);

// Owner Leads MoM
export const fetchOwnerLeadsMoM = createAsyncThunk(
  "miReporting/fetchOwnerLeadsMoM",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchOwnerMoM(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch owner leads (MoM)"
      );
    }
  }
);

// Owner Leads MTD
export const fetchOwnerLeadsMTD = createAsyncThunk(
  "miReporting/fetchOwnerLeadsMTD",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchOwnerMTD(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch owner leads (MTD)"
      );
    }
  }
);

// City Quality Breakdown
export const fetchCityQualityBreakdown = createAsyncThunk(
  "miReporting/fetchCityQuality",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCityQuality(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch city quality breakdown"
      );
    }
  }
);

// Owner Quality Breakdown
export const fetchOwnerQualityBreakdown = createAsyncThunk(
  "miReporting/fetchOwnerQuality",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchOwnerQuality(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch owner quality breakdown"
      );
    }
  }
);

// City Visit Date
export const fetchCityVisitDate = createAsyncThunk(
  "miReporting/fetchCityVisitDate",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCityVisit(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch city visit date analytics"
      );
    }
  }
);

// Owner Visit Date
export const fetchOwnerVisitDate = createAsyncThunk(
  "miReporting/fetchOwnerVisitDate",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchOwnerVisit(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch owner visit date analytics"
      );
    }
  }
);

// City Visited Date
export const fetchCityVisitedDate = createAsyncThunk(
  "miReporting/fetchCityVisitedDate",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCityVisited(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch city visited date analytics"
      );
    }
  }
);

// Owner Visited Date
export const fetchOwnerVisitedDate = createAsyncThunk(
  "miReporting/fetchOwnerVisitedDate",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchOwnerVisited(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch owner visited date analytics"
      );
    }
  }
);

const miReportingSlice = createSlice({
  name: "miReporting",
  initialState,
  reducers: {
    clearContacts: (state) => {
      state.contacts = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // HubSpot Contacts
      .addCase(fetchMIHubSpotContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMIHubSpotContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload.payload || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchMIHubSpotContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.contacts = [];
      })
      // Center Leads MoM
      .addCase(fetchCenterLeadsMoM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenterLeadsMoM.fulfilled, (state, action) => {
        state.loading = false;
        state.centerLeadsMoM = action.payload.payload || [];
      })
      .addCase(fetchCenterLeadsMoM.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Center Leads MTD
      .addCase(fetchCenterLeadsMTD.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenterLeadsMTD.fulfilled, (state, action) => {
        state.loading = false;
        state.centerLeadsMTD = action.payload.payload || [];
      })
      .addCase(fetchCenterLeadsMTD.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Owner Leads MoM
      .addCase(fetchOwnerLeadsMoM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerLeadsMoM.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerLeadsMoM = action.payload.payload || [];
      })
      .addCase(fetchOwnerLeadsMoM.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Owner Leads MTD
      .addCase(fetchOwnerLeadsMTD.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchOwnerLeadsMTD.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerLeadsMTD = action.payload.payload || [];
      })
      .addCase(fetchOwnerLeadsMTD.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // City Quality
      .addCase(fetchCityQualityBreakdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCityQualityBreakdown.fulfilled, (state, action) => {
        state.loading = false;
        state.cityQuality = action.payload.payload || [];
      })
      .addCase(fetchCityQualityBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Owner Quality
      .addCase(fetchOwnerQualityBreakdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerQualityBreakdown.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerQuality = action.payload.payload || [];
      })
      .addCase(fetchOwnerQualityBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // City Visit Date
      .addCase(fetchCityVisitDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCityVisitDate.fulfilled, (state, action) => {
        state.loading = false;
        state.cityVisitDate = action.payload.payload || [];
      })
      .addCase(fetchCityVisitDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Owner Visit Date
      .addCase(fetchOwnerVisitDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerVisitDate.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerVisitDate = action.payload.payload || [];
      })
      .addCase(fetchOwnerVisitDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // City Visited Date
      .addCase(fetchCityVisitedDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCityVisitedDate.fulfilled, (state, action) => {
        state.loading = false;
        state.cityVisitedDate = action.payload.payload || [];
      })
      .addCase(fetchCityVisitedDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Owner Visited Date
      .addCase(fetchOwnerVisitedDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerVisitedDate.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerVisitedDate = action.payload.payload || [];
      })
      .addCase(fetchOwnerVisitedDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearContacts, setPagination, clearError } =
  miReportingSlice.actions;

export default miReportingSlice.reducer;
