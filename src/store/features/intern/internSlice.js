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
} from "../../../helpers/backend_helper";

const initialState = {
  data: [],
  loading: false,
  error: null,
  internId: null,
  intern: null,
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
// export const addReceiptPayment = createAsyncThunk(
//   "postAdvancePayment",
//   async (data, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await postAdvancePayment(data);
//       dispatch(
//         setAlert({
//           type: "success",
//           message: "Advance Payment Saved Successfully",
//         })
//       );
//       return response;
//     } catch (error) {
//       dispatch(setAlert({ type: "error", message: error.message }));
//       return rejectWithValue("something went wrong");
//     }
//   }
// );

export const addInternBillReceipt = createAsyncThunk(
  "intern/receipt/addInternReceipt",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await addInternReceiptAPI(data);

      dispatch(
        setAlert({
          type: "success",
          message: "Receipt Saved Successfully",
        })
      );

      const payload = response?.bill;
      const intern = response?.intern;
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

      // dispatch(toggleInternForm({ data: null, leadData: null, isOpen: false }));

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
    console.log(id, formData, "slice");
    try {
      const response = await updateInternForm(id, formData);
      dispatch(
        setAlert({ type: "success", message: "Intern updated successfully" })
      );
      dispatch(toggleInternForm({ data: null, leadData: null, isOpen: false }));

      return response; // ✅ return only payload
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
        setAlert({
          type: "success",
          message: "Intern Deleted Successfully",
        })
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
      console.log(response.payload, " testing in slice");
      return response.payload; // Correct: just the intern object
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(error.message || "something went wrong");
    }
  }
);
export const fetchInterns = createAsyncThunk(
  "intern/fetchAllInterns",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetchAllInterns();

      if (!response?.success || !Array.isArray(response?.payload)) {
        throw new Error(response?.message || "Invalid server response");
      }

      return response.payload;
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
      console.log(response, " rtk");
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
      .addCase(postInternData.rejected, (state, action) => {
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
        state.intern = payload.payload; // <-- if API returns { payload: updatedIntern }
      })
      .addCase(editInternForm.rejected, (state, action) => {
        state.loading = false;
      })

      .addCase(removedIntern.pending, (state) => {
        state.loading = true;
      })
      .addCase(removedIntern.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = state.payload;
        state.patient = null;
      })
      .addCase(removedIntern.rejected, (state) => {
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
        state.loading = false; // intern data here
        state.bills = payload.payload;
        state.error = null;
      })
      .addCase(getInternReceiptById.rejected, (state, { payload }) => {
        console.log(state);
        state.loading = false;
      })

      .addCase(addInternBillReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInternBillReceipt.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
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
      .addCase(editInternReceipt.rejected, (state, action) => {
        state.loading = false;
      })

      .addCase(fetchInternById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInternById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.intern = payload; // intern data here
        state.error = null;
      })
      .addCase(fetchInternById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || payload.error.message || "Unknown error";
      })

      .addCase(fetchInterns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // need to change action into payload
      .addCase(fetchInterns.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // This should now be your array of interns
        state.error = null;
      })
      .addCase(fetchInterns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getInternIds.fulfilled, (state, action) => {
        state.internId = action.payload; // ✅ store the ID
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
