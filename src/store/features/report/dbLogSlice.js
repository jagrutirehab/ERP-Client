import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDBLogs } from "../../../helpers/backend_helper.js";

// Initial state
const initialState = {
  logs: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 50,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    action: null,
    startDate: null,
    endDate: null,
    search: null,
    sortBy: "date",
    sortOrder: "desc",
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchDBLogs = createAsyncThunk(
  "logs/fetchLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getDBLogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const dbLogSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    // Clear logs
    clearLogs: (state) => {
      state.logs = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch logs
      .addCase(fetchDBLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDBLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.payload;
        state.pagination = action.payload.pagination;
        if (action.payload.filters) {
          state.filters = { ...state.filters, ...action.payload.filters };
        }
      })
      .addCase(fetchDBLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearLogs,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
} = dbLogSlice.actions;

export default dbLogSlice.reducer;
