import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deleteReferral,
  editReferral,
  getReferrals,
  postReferral,
  getPendingReferrals,
  approveReferral,
  rejectReferral,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  data: null,
  pendingReferrals: null,
  pendingLoading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  pendingPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  createEditReferral: {
    isOpen: false,
    data: null,
  },
  loading: false,
};

export const addReferral = createAsyncThunk(
  "postReferral",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postReferral(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Referral Saved Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateReferral = createAsyncThunk(
  "editReferral",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editReferral(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Referral Updated Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchReferrals = createAsyncThunk(
  "getReferrals",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const response = await getReferrals(params);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeReferral = createAsyncThunk(
  "deleteReferral",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteReferral(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Referral Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchPendingReferrals = createAsyncThunk(
  "getPendingReferrals",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPendingReferrals(params);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const approveReferralAction = createAsyncThunk(
  "approveReferral",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await approveReferral(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Referral approved successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const rejectReferralAction = createAsyncThunk(
  "rejectReferral",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await rejectReferral(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Referral rejected successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

const referralSlice = createSlice({
  name: "Referral",
  initialState,
  reducers: {
    createEditReferral: (state, { payload }) => {
      state.createEditReferral = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferrals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReferrals.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
        if (payload.pagination) {
          state.pagination = payload.pagination;
        }
      })
      .addCase(fetchReferrals.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addReferral.pending, (state) => {
        state.loading = true;
      })
      .addCase(addReferral.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(addReferral.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateReferral.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReferral.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(updateReferral.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeReferral.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeReferral.fulfilled, (state, { payload }) => {
        state.loading = false;
        const data = state.data.filter((ref) => ref._id !== payload.payload);
        state.data = data;
      })
      .addCase(removeReferral.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchPendingReferrals.pending, (state) => {
        state.pendingLoading = true;
      })
      .addCase(fetchPendingReferrals.fulfilled, (state, { payload }) => {
        state.pendingLoading = false;
        state.pendingReferrals = payload.payload;
        if (payload.pagination) {
          state.pendingPagination = payload.pagination;
        }
      })
      .addCase(fetchPendingReferrals.rejected, (state) => {
        state.pendingLoading = false;
      });

    builder
      .addCase(approveReferralAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveReferralAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveReferralAction.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(rejectReferralAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectReferralAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rejectReferralAction.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { createEditReferral } = referralSlice.actions;

export default referralSlice.reducer;
