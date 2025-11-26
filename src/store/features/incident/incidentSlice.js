import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import {
  getIncidents,
  getIncidentById,
  postIncident,
  updateIncident,
  deleteIncident,
  investigateIncident,
  approveIncident,
  closeIncident,
  updateIncidentStatus,
} from "../../../helpers/backend_helper";

const initialState = {
  data: [],
  currentIncident: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  form: {
    isOpen: false,
    data: null,
    mode: "create", // 'create' or 'edit'
  },
};

// Async thunks
export const fetchIncidents = createAsyncThunk(
  "incident/fetchIncidents",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const response = await getIncidents(params);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const fetchIncidentById = createAsyncThunk(
  "incident/fetchIncidentById",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await getIncidentById(id);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const createIncident = createAsyncThunk(
  "incident/createIncident",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postIncident(data);
      dispatch(
        setAlert({ type: "success", message: "Incident created successfully" })
      );
      dispatch(setIncidentForm({ isOpen: false, data: null, mode: "create" }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateIncidentAction = createAsyncThunk(
  "incident/updateIncident",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateIncident(id, data);
      dispatch(
        setAlert({ type: "success", message: "Incident updated successfully" })
      );
      dispatch(setIncidentForm({ isOpen: false, data: null, mode: "create" }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const deleteIncidentAction = createAsyncThunk(
  "incident/deleteIncident",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await deleteIncident(id);
      dispatch(
        setAlert({ type: "success", message: "Incident deleted successfully" })
      );
      return id;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const investigateIncidentAction = createAsyncThunk(
  "incident/investigateIncident",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await investigateIncident(id, data);
      dispatch(
        setAlert({
          type: "success",
          message: "Investigation completed successfully",
        })
      );
      dispatch(setIncidentForm({ isOpen: false, data: null, mode: "create" }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const approveIncidentAction = createAsyncThunk(
  "incident/approveIncident",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await approveIncident(id, data);
      dispatch(
        setAlert({
          type: "success",
          message: `Incident ${data.decision.toLowerCase()} successfully`,
        })
      );
      dispatch(setIncidentForm({ isOpen: false, data: null, mode: "create" }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const closeIncidentAction = createAsyncThunk(
  "incident/closeIncident",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await closeIncident(id, data);
      dispatch(
        setAlert({ type: "success", message: "Incident closed successfully" })
      );
      dispatch(setIncidentForm({ isOpen: false, data: null, mode: "create" }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const updateIncidentStatusAction = createAsyncThunk(
  "incident/updateIncidentStatus",
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateIncidentStatus(id, { status });
      dispatch(
        setAlert({ type: "success", message: "Incident status updated" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

const incidentSlice = createSlice({
  name: "Incident",
  initialState,
  reducers: {
    setIncidentForm: (state, { payload }) => {
      state.form = payload;
    },
    setCurrentIncident: (state, { payload }) => {
      state.currentIncident = payload;
    },
    clearCurrentIncident: (state) => {
      state.currentIncident = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload || [];
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchIncidents.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    builder
      .addCase(fetchIncidentById.pending, (state) => {
        // state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidentById.fulfilled, (state, { payload }) => {
        // state.loading = false;
        state.currentIncident = payload.payload;
      })
      .addCase(fetchIncidentById.rejected, (state, { payload }) => {
        // state.loading = false;
        state.error = payload;
      });

    builder
      .addCase(createIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIncident.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = [payload.payload, ...state.data];
      })
      .addCase(createIncident.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    builder
      .addCase(updateIncidentAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIncidentAction.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.data.findIndex(
          (item) => item._id === payload.payload._id
        );
        if (index !== -1) {
          state.data[index] = payload.payload;
        }
        if (state.currentIncident?._id === payload.payload._id) {
          state.currentIncident = payload.payload;
        }
      })
      .addCase(updateIncidentAction.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    builder.addCase(deleteIncidentAction.fulfilled, (state, { payload }) => {
      state.data = state.data.filter((item) => item._id !== payload);
      if (state.currentIncident?._id === payload) {
        state.currentIncident = null;
      }
    });

    builder.addCase(
      investigateIncidentAction.fulfilled,
      (state, { payload }) => {
        const index = state.data.findIndex(
          (item) => item._id === payload.payload._id
        );
        if (index !== -1) {
          state.data[index] = payload.payload;
        }
        if (state.currentIncident?._id === payload.payload._id) {
          state.currentIncident = payload.payload;
        }
      }
    );

    builder.addCase(approveIncidentAction.fulfilled, (state, { payload }) => {
      const index = state.data.findIndex(
        (item) => item._id === payload.payload._id
      );
      if (index !== -1) {
        state.data[index] = payload.payload;
      }
      if (state.currentIncident?._id === payload.payload._id) {
        state.currentIncident = payload.payload;
      }
    });

    builder.addCase(closeIncidentAction.fulfilled, (state, { payload }) => {
      const index = state.data.findIndex(
        (item) => item._id === payload.payload._id
      );
      if (index !== -1) {
        state.data[index] = payload.payload;
      }
      if (state.currentIncident?._id === payload.payload._id) {
        state.currentIncident = payload.payload;
      }
    });

    builder.addCase(
      updateIncidentStatusAction.fulfilled,
      (state, { payload }) => {
        const index = state.data.findIndex(
          (item) => item._id === payload.payload._id
        );
        if (index !== -1) {
          state.data[index] = payload.payload;
        }
        if (state.currentIncident?._id === payload.payload._id) {
          state.currentIncident = payload.payload;
        }
      }
    );
  },
});

export const { setIncidentForm, setCurrentIncident, clearCurrentIncident } =
  incidentSlice.actions;

export default incidentSlice.reducer;
