import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deleteRoundNote,
  getRoundNoteStaff,
  getRoundNotesList,
  postRoundNote,
  putRoundNote,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  list: [],
  pagination: {
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
  },
  loading: false,
  filters: {
    search: "",
    startDate: null,
    endDate: null,
    floor: null,
    patientId: null,
    staffIds: [],
    carryForward: null,
    carryForwardStatus: null,
  },
  lastQuery: {
    page: 1,
    limit: 10,
  },
  staff: [],
  staffLoading: false,
  floors: [],
  carryForwardOpen: [],
  drawer: {
    isOpen: false,
    mode: "create", // create | edit
    data: null,
    carryForwardSource: null,
  },
  patientNotes: [],
  patientLoading: false,
};

export const fetchRoundNotes = createAsyncThunk(
  "roundNotes/fetchList",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const response = await getRoundNotesList(params);
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to load round notes",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPatientRoundNotes = createAsyncThunk(
  "roundNotes/fetchPatientList",
  async ({ patientId, limit = 20 } = {}, { rejectWithValue, dispatch }) => {
    try {
      const response = await getRoundNotesList({
        patientId,
        limit,
        page: 1,
        includeCarryForwardOpen: false,
      });
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to load patient round notes",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRoundNoteStaff = createAsyncThunk(
  "roundNotes/fetchStaff",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const response = await getRoundNoteStaff(params);
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to load staff members",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const createRoundNote = createAsyncThunk(
  "roundNotes/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postRoundNote(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Round note saved successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to create round note",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const updateRoundNoteEntry = createAsyncThunk(
  "roundNotes/update",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await putRoundNote(id, data);
      dispatch(
        setAlert({
          type: "success",
          message: "Round note updated successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to update round note",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const removeRoundNoteEntry = createAsyncThunk(
  "roundNotes/delete",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteRoundNote(id);
      dispatch(
        setAlert({
          type: "success",
          message: "Round note deleted successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to delete round note",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

const roundNotesSlice = createSlice({
  name: "roundNotes",
  initialState,
  reducers: {
    setRoundNotesFilters: (state, { payload }) => {
      state.filters = {
        ...state.filters,
        ...payload,
      };
    },
    resetRoundNotesFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    setRoundNoteDrawer: (state, { payload }) => {
      state.drawer = {
        ...state.drawer,
        ...payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoundNotes.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(fetchRoundNotes.fulfilled, (state, { payload, meta }) => {
        state.loading = false;
        state.list = payload.data || [];
        state.pagination = payload.pagination || initialState.pagination;
        state.carryForwardOpen = payload.carryForwardOpen || [];
        state.floors = payload.meta?.floors || [];
        state.lastQuery = meta.arg || state.lastQuery;
      })
      .addCase(fetchRoundNotes.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchPatientRoundNotes.pending, (state) => {
        state.patientLoading = true;
      })
      .addCase(fetchPatientRoundNotes.fulfilled, (state, { payload }) => {
        state.patientLoading = false;
        state.patientNotes = payload.data || [];
      })
      .addCase(fetchPatientRoundNotes.rejected, (state) => {
        state.patientLoading = false;
      });

    builder
      .addCase(fetchRoundNoteStaff.pending, (state) => {
        state.staffLoading = true;
      })
      .addCase(fetchRoundNoteStaff.fulfilled, (state, { payload }) => {
        state.staffLoading = false;
        state.staff = payload.data || [];
      })
      .addCase(fetchRoundNoteStaff.rejected, (state) => {
        state.staffLoading = false;
      });

    builder.addCase(createRoundNote.fulfilled, (state) => {
      state.drawer = {
        ...state.drawer,
        isOpen: false,
        data: null,
        carryForwardSource: null,
      };
    });

    builder.addCase(updateRoundNoteEntry.fulfilled, (state) => {
      state.drawer = {
        ...state.drawer,
        isOpen: false,
        data: null,
        carryForwardSource: null,
      };
    });
  },
});

export const {
  setRoundNotesFilters,
  resetRoundNotesFilters,
  setRoundNoteDrawer,
} = roundNotesSlice.actions;

export default roundNotesSlice.reducer;
