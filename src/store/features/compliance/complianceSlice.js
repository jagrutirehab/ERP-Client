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
  getMyComplianceDrafts,
  getAllComplianceDrafts,
  updateComplianceDraft,
  discardComplianceDraft,
  getComplianceRecords,
} from "../../../helpers/backend_helper";

const EMPTY_COUNTS = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
const EMPTY_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 0 };

const initialState = {
  categories: [],
  categoriesLoading: false,
  categoriesPagination: { ...EMPTY_PAGINATION },
  types: [],
  typesLoading: false,
  typesTotal: 0,
  currentType: null,
  currentTypeLoading: false,
  saving: false,
  submissionSaving: false,
  submissions: [],
  submissionCounts: { ...EMPTY_COUNTS },
  submissionsLoading: false,
  submissionsTotal: 0,
  submissionReviewing: false,
  myDrafts: [],
  myDraftsTotal: 0,
  allDrafts: [],
  allDraftsTotal: 0,
  draftsLoading: false,
  draftSaving: false,
  records: [],
  recordsLoading: false,
  recordsTotal: 0,
  recordsOverallTotal: 0,
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

// ---------------------------------------------------------------------------
// Drafts
// ---------------------------------------------------------------------------
export const fetchMyDrafts = createAsyncThunk(
  "compliance/fetchMyDrafts",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return await getMyComplianceDrafts(params, { signal });
    } catch (error) {
      if (isAborted(error)) return rejectWithValue({ aborted: true });
      return rejectWithValue(error);
    }
  },
);

export const fetchAllDrafts = createAsyncThunk(
  "compliance/fetchAllDrafts",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return await getAllComplianceDrafts(params, { signal });
    } catch (error) {
      if (isAborted(error)) return rejectWithValue({ aborted: true });
      return rejectWithValue(error);
    }
  },
);

// "Continue draft": formData carries the fields, files and action (DRAFT | SEND)
export const saveDraft = createAsyncThunk(
  "compliance/saveDraft",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateComplianceDraft(id, formData);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const removeDraft = createAsyncThunk(
  "compliance/removeDraft",
  async (id, { rejectWithValue }) => {
    try {
      await discardComplianceDraft(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// ---------------------------------------------------------------------------
// Compliance records (Register)
// ---------------------------------------------------------------------------
export const fetchComplianceRecords = createAsyncThunk(
  "compliance/fetchComplianceRecords",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return await getComplianceRecords(params, { signal });
    } catch (error) {
      if (isAborted(error)) return rejectWithValue({ aborted: true });
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
        state.categoriesPagination = payload?.pagination || { ...EMPTY_PAGINATION };
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
        state.typesTotal = payload?.pagination?.total || 0;
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
        state.submissionsTotal = payload?.pagination?.total || 0;
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

    // ---------------- Drafts ----------------
    builder
      .addCase(fetchMyDrafts.pending, (state) => {
        state.draftsLoading = true;
      })
      .addCase(fetchMyDrafts.fulfilled, (state, { payload }) => {
        state.draftsLoading = false;
        state.myDrafts = payload?.data || [];
        state.myDraftsTotal = payload?.pagination?.total || 0;
      })
      .addCase(fetchMyDrafts.rejected, (state, { payload }) => {
        if (payload?.aborted) return;
        state.draftsLoading = false;
      });

    builder
      .addCase(fetchAllDrafts.pending, (state) => {
        state.draftsLoading = true;
      })
      .addCase(fetchAllDrafts.fulfilled, (state, { payload }) => {
        state.draftsLoading = false;
        state.allDrafts = payload?.data || [];
        state.allDraftsTotal = payload?.pagination?.total || 0;
      })
      .addCase(fetchAllDrafts.rejected, (state, { payload }) => {
        if (payload?.aborted) return;
        state.draftsLoading = false;
      });

    builder
      .addCase(saveDraft.pending, (state) => {
        state.draftSaving = true;
      })
      .addCase(saveDraft.fulfilled, (state) => {
        state.draftSaving = false;
      })
      .addCase(saveDraft.rejected, (state) => {
        state.draftSaving = false;
      });

    builder.addCase(removeDraft.fulfilled, (state, { payload: id }) => {
      state.myDrafts = state.myDrafts.filter((d) => d._id !== id);
      state.allDrafts = state.allDrafts.filter((d) => d._id !== id);
    });

    // ---------------- Records (Register) ----------------
    builder
      .addCase(fetchComplianceRecords.pending, (state) => {
        state.recordsLoading = true;
      })
      .addCase(fetchComplianceRecords.fulfilled, (state, { payload }) => {
        state.recordsLoading = false;
        state.records = payload?.data || [];
        state.recordsTotal = payload?.pagination?.total || 0;
        state.recordsOverallTotal = payload?.overallTotal || 0;
      })
      .addCase(fetchComplianceRecords.rejected, (state, { payload }) => {
        if (payload?.aborted) return;
        state.recordsLoading = false;
      });
  },
});

export const { clearCurrentComplianceType } = complianceSlice.actions;
export default complianceSlice.reducer;