import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDBLogs,
  getDBLogsByAction,
  getDBLogsByDateRange,
} from "../../../helpers/backend_helper.js";

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
    sortBy: "createdAt",
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

      console.log(response, "db logs response");

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDBLogsByDateRange = createAsyncThunk(
  "logs/fetchLogsByDateRange",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getDBLogsByDateRange(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDBLogsByAction = createAsyncThunk(
  "logs/fetchLogsByAction",
  async ({ action, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getDBLogsByAction(action, params);
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
      })
      .addCase(fetchDBLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch logs by date range
      .addCase(fetchDBLogsByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDBLogsByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDBLogsByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch logs by action
      .addCase(fetchDBLogsByAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDBLogsByAction.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDBLogsByAction.rejected, (state, action) => {
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

// Export selectors
export const selectLogs = (state) => state.logs.logs;
export const selectPagination = (state) => state.logs.pagination;
export const selectFilters = (state) => state.logs.filters;
export const selectLoading = (state) => state.logs.loading;
export const selectError = (state) => state.logs.error;

// Export reducer
export default dbLogSlice.reducer;
