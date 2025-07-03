import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import {
  addInternForm,
  fetchAllInterns,
  getInternById,
  getInternId,
  addInternReceipt as addInternReceiptAPI,
  getInternReceipt,
  updateInternForm,
  removeIntern,
  updateInternReceipt,
  removeInternBill,
  permenentremoveIntern,
} from "../../../helpers/backend_helper";

const initialState = {
  data: [],
  loading: false,
  error: null,
  internId: null,
  intern: null,
  hasMore: false, // ✅ added
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 0,
    total: 0,
  },
  filters: {
    name: "",
    internStatus: "",
  },
  InternAdmission: {
    data: null,
    isOpen: "",
  },
  internForm: {
    data: null,
    leadData: null,
    isOpen: false,
  },
};

export const addInternBillReceipt = createAsyncThunk(
  "intern/receipt/addInternReceipt",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await addInternReceiptAPI(data);
      dispatch(
        setAlert({ type: "success", message: "Receipt Saved Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const editInternReceipt = createAsyncThunk(
  "intern/intern-receipt",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateInternReceipt(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Intern Receipt updated successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message || "Update failed");
    }
  }
);

export const removeInternReceipt = createAsyncThunk(
  "intern/deleteIntern-receipt",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await removeInternBill(id);
      dispatch(
        setAlert({
          type: "success",
          message: "Intern Receipt Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message || "Delete failed");
    }
  }
);

export const getInternIds = createAsyncThunk(
  "intern/getInternId",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await getInternId();
      return response.internId;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to fetch intern ID",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const postInternData = createAsyncThunk(
  "addInternForm",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await addInternForm(data);
      dispatch(
        setAlert({ type: "success", message: "Intern Saved Successfully" })
      );
      dispatch(toggleInternForm({ data: null, leadData: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const editInternForm = createAsyncThunk(
  "intern/editInternForm",
  async ({ id, formData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateInternForm(id, formData);
      dispatch(
        setAlert({ type: "success", message: "Intern updated successfully" })
      );
      dispatch(toggleInternForm({ data: null, leadData: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message || "Update failed");
    }
  }
);

export const removedIntern = createAsyncThunk(
  "intern/deleteIntern",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await removeIntern(id);
      dispatch(
        setAlert({ type: "success", message: "Intern Deleted Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removedInternpermenet = createAsyncThunk(
  "intern/permenent-delete",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await permenentremoveIntern(id);
      dispatch(
        setAlert({ type: "success", message: "Intern Deleted Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchInternById = createAsyncThunk(
  "intern/updateIntern",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await getInternById(id);
      return response.payload;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message || "something went wrong");
    }
  }
);

export const fetchInterns = createAsyncThunk(
  "intern/fetchAllInterns",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetchAllInterns(params);
      if (!response?.success || !Array.isArray(response?.payload)) {
        throw new Error(response?.message || "Invalid server response");
      }
      return {
        interns: response.payload,
        pagination: response.pagination,
      };
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to fetch interns",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const getInternReceiptById = createAsyncThunk(
  "intern/getReceipts",
  async (internId, { rejectWithValue, dispatch }) => {
    try {
      const response = await getInternReceipt(internId);
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to fetch intern ID",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const internSlice = createSlice({
  name: "intern",
  initialState,
  reducers: {
    billForm: {
      data: null,
      isOpen: false,
    },
    fetchInternById: (state, { payload }) => {
      state.intern = payload;
    },
    createEditInternBill: (state, { payload }) => {
      state.billForm = payload;
    },
    setInternBillDate: (state, { payload }) => {
      state.billDate = payload;
    },
    InternAdmission: (state, { payload }) => {
      state.InternAdmission = payload;
    },
    toggleInternForm: (state, { payload }) => {
      state.internForm = payload;
    },
    createUpdate: (state, { payload }) => {
      state.billForm = payload;
    },
    viewIntern: (state, { payload }) => {
      const findInternInList = state.data?.find((pt) => pt._id === payload._id);
      if (!findInternInList) state.data = [payload, ...state.data];
      localStorage.setItem("activeIntern", JSON.stringify(payload));
      state.internId = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postInternData.pending, (state) => {
        state.loading = true;
      })
      .addCase(postInternData.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = [payload.payload, ...(state.data || [])];
      })
      .addCase(postInternData.rejected, (state) => {
        state.loading = false;
      })

      .addCase(editInternForm.pending, (state) => {
        state.loading = true;
      })
      .addCase(editInternForm.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.data.findIndex(
          (pt) => pt._id === payload.payload._id
        );
        state.data[index] = payload.payload;
        state.intern = payload.payload;
      })
      .addCase(editInternForm.rejected, (state) => {
        state.loading = false;
      })

      .addCase(removedIntern.pending, (state) => {
        state.loading = true;
      })
      .addCase(removedIntern.fulfilled, (state, { payload }) => {
        return { ...initialState };
      })
      .addCase(removedIntern.rejected, (state) => {
        state.loading = false;
      })

      .addCase(removedInternpermenet.pending, (state) => {
        state.loading = true;
      })
      .addCase(removedInternpermenet.fulfilled, (state, { payload }) => {
        return { ...initialState };
      })
      .addCase(removedInternpermenet.rejected, (state) => {
        state.loading = false;
      })

      .addCase(removeInternReceipt.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeInternReceipt.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.bills = state.bills.filter(
          (pt) => pt._id !== payload.payload._id
        );
      })
      .addCase(removeInternReceipt.rejected, (state) => {
        state.loading = false;
      })

      .addCase(getInternReceiptById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInternReceiptById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.bills = payload.payload;
      })
      .addCase(getInternReceiptById.rejected, (state) => {
        state.loading = false;
      })

      .addCase(addInternBillReceipt.pending, (state) => {
        state.loading = true;
      })
      .addCase(addInternBillReceipt.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.bills = [payload.payload, ...(state.bills || [])];
      })
      .addCase(addInternBillReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(editInternReceipt.pending, (state) => {
        state.loading = true;
      })
      .addCase(editInternReceipt.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.bills.findIndex(
          (pt) => pt._id === payload.payload._id
        );
        state.bills[index] = payload.payload;
      })
      .addCase(editInternReceipt.rejected, (state) => {
        state.loading = false;
      })

      .addCase(fetchInternById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInternById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.intern = payload;
      })
      .addCase(fetchInternById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || payload.error?.message || "Unknown error";
      })

      .addCase(fetchInterns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterns.fulfilled, (state, action) => {
        state.loading = false;
        const { interns, pagination } = action.payload;

        state.data =
          action.meta.arg?.page && action.meta.arg.page > 1
            ? [...state.data, ...interns]
            : interns;

        state.pagination = {
          ...state.pagination,
          ...pagination,
        };

        // ✅ Calculate hasMore
        state.hasMore = pagination.page < pagination.totalPages;

        state.error = null;
      })
      .addCase(fetchInterns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getInternIds.fulfilled, (state, action) => {
        state.internId = action.payload;
      });
  },
});

export const {
  toggleInternForm,
  viewIntern,
  InternAdmission,
  createUpdate,
  editInternBill,
  createEditInternBill,
  setInternBillDate,
} = internSlice.actions;

export default internSlice.reducer;
