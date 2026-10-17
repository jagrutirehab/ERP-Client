import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getComplianceCategories,
  createComplianceCategory,
  editComplianceCategory,
  updateComplianceCategoryStatus,
  deleteComplianceCategory,
  getComplianceTypes,
  getComplianceTypeById,
  createComplianceType,
  editComplianceType,
  updateComplianceTypeStatus,
  createComplianceSubmission,
  getComplianceSubmissions,
  approveComplianceSubmission,
  rejectComplianceSubmission,
} from "../../../helpers/backend_helper";

const EMPTY_COUNTS = { PENDING: 0, APPROVED: 0, REJECTED: 0 };

const initialState = {
  categories: [],
  categoriesLoading: false,
  types: [],
  typesLoading: false,
  currentType: null,
  currentTypeLoading: false,
  saving: false,
  submissionSaving: false,
  submissions: [],
  submissionCounts: { ...EMPTY_COUNTS },
  submissionsLoading: false,
  submissionReviewing: false,
};

const isAborted = (error) => error?.code === "ERR_CANCELED";

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const fetchComplianceCategories = createAsyncThunk(
  "compliance/fetchComplianceCategories",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return await getComplianceCategories(params, { signal });
    } catch (error) {
      if (isAborted(error)) return rejectWithValue({ aborted: true });
      return rejectWithValue(error);
    }
  },
);

export const addComplianceCategory = createAsyncThunk(
  "compliance/addComplianceCategory",
  async (data, { rejectWithValue }) => {
    try {
      return await createComplianceCategory(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateComplianceCategory = createAsyncThunk(
  "compliance/updateComplianceCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await editComplianceCategory(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const setComplianceCategoryStatus = createAsyncThunk(
  "compliance/setComplianceCategoryStatus",
  async ({ id, active }, { rejectWithValue }) => {
    try {
      await updateComplianceCategoryStatus(id, active);
      return { id, active };
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const removeComplianceCategory = createAsyncThunk(
  "compliance/removeComplianceCategory",
  async (id, { rejectWithValue }) => {
    try {
      await deleteComplianceCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// ---------------------------------------------------------------------------
// Compliance types
// ---------------------------------------------------------------------------
export const fetchComplianceTypes = createAsyncThunk(
  "compliance/fetchComplianceTypes",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return await getComplianceTypes(params, { signal });
    } catch (error) {
      if (isAborted(error)) return rejectWithValue({ aborted: true });
      return rejectWithValue(error);
    }
  },
);

export const fetchComplianceTypeById = createAsyncThunk(
  "compliance/fetchComplianceTypeById",
  async (id, { rejectWithValue }) => {
    try {
      return await getComplianceTypeById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const addComplianceType = createAsyncThunk(
  "compliance/addComplianceType",
  async (data, { rejectWithValue }) => {
    try {
      return await createComplianceType(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateComplianceType = createAsyncThunk(
  "compliance/updateComplianceType",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await editComplianceType(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const setComplianceTypeStatus = createAsyncThunk(
  "compliance/setComplianceTypeStatus",
  async ({ id, active }, { rejectWithValue }) => {
    try {
      await updateComplianceTypeStatus(id, active);
      return { id, active };
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// ---------------------------------------------------------------------------
// Submissions (upload form + approvals)
// ---------------------------------------------------------------------------
export const addComplianceSubmission = createAsyncThunk(
  "compliance/addComplianceSubmission",
  async (data, { rejectWithValue }) => {
    try {
      return await createComplianceSubmission(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchComplianceSubmissions = createAsyncThunk(
  "compliance/fetchComplianceSubmissions",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return await getComplianceSubmissions(params, { signal });
    } catch (error) {
      if (isAborted(error)) return rejectWithValue({ aborted: true });
      return rejectWithValue(error);
    }
  },
);

export const approveSubmission = createAsyncThunk(
  "compliance/approveSubmission",
  async ({ id, comment = "" }, { rejectWithValue }) => {
    try {
      const res = await approveComplianceSubmission(id, { comment });
      return { id, message: res?.message };
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const rejectSubmission = createAsyncThunk(
  "compliance/rejectSubmission",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      await rejectComplianceSubmission(id, { reason });
      return { id };
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// Moves one submission out of the PENDING list after a decision
const removeDecided = (state, id, toStatus) => {
  state.submissions = state.submissions.filter((s) => s._id !== id);
  state.submissionCounts.PENDING = Math.max((state.submissionCounts.PENDING || 0) - 1, 0);
  state.submissionCounts[toStatus] = (state.submissionCounts[toStatus] || 0) + 1;
};

const complianceSlice = createSlice({
  name: "compliance",
  initialState,
  reducers: {
    clearCurrentComplianceType: (state) => {
      state.currentType = null;
    },
  },
  extraReducers: (builder) => {
    // ---------------- Categories ----------------
    builder
      .addCase(fetchComplianceCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchComplianceCategories.fulfilled, (state, { payload }) => {
        state.categoriesLoading = false;
        state.categories = payload?.data || [];
      })
      .addCase(fetchComplianceCategories.rejected, (state, { payload }) => {
        if (payload?.aborted) return;
        state.categoriesLoading = false;
      });

    builder
      .addCase(addComplianceCategory.pending, (state) => {
        state.saving = true;
      })
      .addCase(addComplianceCategory.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(addComplianceCategory.rejected, (state) => {
        state.saving = false;
      });

    builder
      .addCase(updateComplianceCategory.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateComplianceCategory.fulfilled, (state, { payload }) => {
        state.saving = false;
        const updated = payload?.data;
        if (updated) {
          state.categories = state.categories.map((c) => (c._id === updated._id ? updated : c));
        }
      })
      .addCase(updateComplianceCategory.rejected, (state) => {
        state.saving = false;
      });

    builder.addCase(setComplianceCategoryStatus.fulfilled, (state, { payload }) => {
      state.categories = state.categories.map((c) =>
        c._id === payload.id ? { ...c, active: payload.active } : c,
      );
    });

    builder.addCase(removeComplianceCategory.fulfilled, (state, { payload: id }) => {
      state.categories = state.categories.filter((c) => c._id !== id);
    });

    // ---------------- Compliance types ----------------
    builder
      .addCase(fetchComplianceTypes.pending, (state) => {
        state.typesLoading = true;
      })
      .addCase(fetchComplianceTypes.fulfilled, (state, { payload }) => {
        state.typesLoading = false;
        state.types = payload?.data || [];
      })
      .addCase(fetchComplianceTypes.rejected, (state, { payload }) => {
        if (payload?.aborted) return;
        state.typesLoading = false;
      });

    builder
      .addCase(fetchComplianceTypeById.pending, (state) => {
        state.currentTypeLoading = true;
      })
      .addCase(fetchComplianceTypeById.fulfilled, (state, { payload }) => {
        state.currentTypeLoading = false;
        state.currentType = payload?.data || null;
      })
      .addCase(fetchComplianceTypeById.rejected, (state) => {
        state.currentTypeLoading = false;
      });

    builder
      .addCase(addComplianceType.pending, (state) => {
        state.saving = true;
      })
      .addCase(addComplianceType.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(addComplianceType.rejected, (state) => {
        state.saving = false;
      });

    builder
      .addCase(updateComplianceType.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateComplianceType.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateComplianceType.rejected, (state) => {
        state.saving = false;
      });

    builder.addCase(setComplianceTypeStatus.fulfilled, (state, { payload }) => {
      state.types = state.types.map((t) =>
        t._id === payload.id ? { ...t, active: payload.active } : t,
      );
    });

    // ---------------- Submissions ----------------
    builder
      .addCase(addComplianceSubmission.pending, (state) => {
        state.submissionSaving = true;
      })
      .addCase(addComplianceSubmission.fulfilled, (state) => {
        state.submissionSaving = false;
      })
      .addCase(addComplianceSubmission.rejected, (state) => {
        state.submissionSaving = false;
      });

    builder
      .addCase(fetchComplianceSubmissions.pending, (state) => {
        state.submissionsLoading = true;
      })
      .addCase(fetchComplianceSubmissions.fulfilled, (state, { payload }) => {
        state.submissionsLoading = false;
        state.submissions = payload?.data || [];
        state.submissionCounts = payload?.counts || { ...EMPTY_COUNTS };
      })
      .addCase(fetchComplianceSubmissions.rejected, (state, { payload }) => {
        if (payload?.aborted) return;
        state.submissionsLoading = false;
      });

    builder
      .addCase(approveSubmission.pending, (state) => {
        state.submissionReviewing = true;
      })
      .addCase(approveSubmission.fulfilled, (state, { payload }) => {
        state.submissionReviewing = false;
        removeDecided(state, payload.id, "APPROVED");
      })
      .addCase(approveSubmission.rejected, (state) => {
        state.submissionReviewing = false;
      });

    builder
      .addCase(rejectSubmission.pending, (state) => {
        state.submissionReviewing = true;
      })
      .addCase(rejectSubmission.fulfilled, (state, { payload }) => {
        state.submissionReviewing = false;
        removeDecided(state, payload.id, "REJECTED");
      })
      .addCase(rejectSubmission.rejected, (state) => {
        state.submissionReviewing = false;
      });
  },
});

export const { clearCurrentComplianceType } = complianceSlice.actions;
export default complianceSlice.reducer;