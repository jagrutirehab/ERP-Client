import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getHubspotContacts } from "../../../helpers/backend_helper";

const initialState = {
  contacts: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  error: null,
};

export const fetchHubspotContacts = createAsyncThunk(
  "Hubspot/fetchContacts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getHubspotContacts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const hubspotContactsSlice = createSlice({
  name: "Hubspot",
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
      .addCase(fetchHubspotContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHubspotContacts.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the new response format where contacts are in 'payload'
        state.contacts = action.payload.payload || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchHubspotContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearContacts, setPagination, clearError } =
  hubspotContactsSlice.actions;

export default hubspotContactsSlice.reducer;
