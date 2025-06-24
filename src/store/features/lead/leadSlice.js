import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deleteLead,
  editLead,
  getLeads,
  postLead,
  postLeadPatient,
  postMergeLead,
  postUnMergeLead,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  data: null,
  createEditLead: {
    isOpen: false,
    data: null,
  },
  unGroupLeads: [],
  loading: false,
  searchLoading: false,
};

export const addLead = createAsyncThunk(
  "postLead",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postLead(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Lead Saved Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateLead = createAsyncThunk(
  "editLead",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editLead(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Lead Updated Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const mergeLead = createAsyncThunk(
  "mergeLead",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postMergeLead(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Lead Merged Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const unMergeLead = createAsyncThunk(
  "unMergeLead",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postUnMergeLead(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Lead Unmerged Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addLeadPatient = createAsyncThunk(
  "postLeadPatient",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postLeadPatient(data);
      dispatch(
        setAlert({ type: "success", message: "Patient Saved Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchLeads = createAsyncThunk(
  "getLeads",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getLeads();
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeLead = createAsyncThunk(
  "deleteLead",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteLead(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Lead Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

const leadSlice = createSlice({
  name: "Lead",
  initialState,
  reducers: {
    createEditLead: (state, { payload }) => {
      state.createEditLead = payload;
    },
    searchLead: (state) => {
      state.searchLoading = true;
    },
    setUngroupLeads: (state, { payload }) => {
      state.unGroupLeads = payload.payload;
    },
    searchLeadSuccess: (state, { payload }) => {
      if (payload.grouped === "true") {
        state.data = payload.payload;
      } else {
        state.unGroupLeads = payload.payload;
      }
      state.searchLoading = false;
    },
    searchLeadFail: (state, { payload }) => {
      state.searchLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(fetchLeads.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addLead.pending, (state) => {
        state.loading = true;
      })
      .addCase(addLead.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(addLead.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateLead.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateLead.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(updateLead.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(mergeLead.pending, (state) => {
        state.loading = true;
      })
      .addCase(mergeLead.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(mergeLead.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(unMergeLead.pending, (state) => {
        state.loading = true;
      })
      .addCase(unMergeLead.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(unMergeLead.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addLeadPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(addLeadPatient.fulfilled, (state, { payload }) => {
        state.data = payload.payload;
        state.loading = false;
      })
      .addCase(addLeadPatient.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeLead.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeLead.fulfilled, (state, { payload }) => {
        state.loading = false;

        const data = state.data.map((ld) => {
          const leads = ld.leads.filter((lead) => lead._id !== payload.payload);
          return { ...ld, leads };
        });

        state.data = data;
      })
      .addCase(removeLead.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  createEditLead,
  searchLead,
  searchLeadSuccess,
  searchLeadFail,
  setUngroupLeads,
} = leadSlice.actions;

export default leadSlice.reducer;
