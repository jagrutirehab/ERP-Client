import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMIHubSpotContacts } from "../../../helpers/backend_helper";

const initialState = {
  contacts: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
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
      });
  },
});

export const { clearContacts, setPagination, clearError } =
  miReportingSlice.actions;

export default miReportingSlice.reducer;
