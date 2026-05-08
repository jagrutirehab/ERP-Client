import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  deleteMedicine,
  editMedicine,
  getMedicines,
  postCSVMedicine,
  postMedicine,
  validateDuplicateMedicine,
  getMedicineRequisitions,
  createMedicineRequisition,
  getMedicineRequisitionById,
  editMedicineRequisition as editMedicineRequisitionApi,
  approveMedicineRequisition as approveMedicineRequisitionApi,
  rejectMedicineRequisition as rejectMedicineRequisitionApi,
  deleteMedicineRequisition as deleteMedicineRequisitionApi,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  data: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
};

export const addMedicine = createAsyncThunk(
  "postMedicine",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await postMedicine(data);
      dispatch(
        setAlert({ type: "success", message: "Medicine Saved Successfully" })
      );
      return null;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addCSVMedicine = createAsyncThunk(
  "postCSVMedicine",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postCSVMedicine(data);
      dispatch(
        setAlert({ type: "success", message: "Medicine Saved Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const duplicateMedicineValidator = createAsyncThunk(
  "validateDuplicate",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await validateDuplicateMedicine(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchMedicines = createAsyncThunk(
  "medicine/fetchMedicines",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue, dispatch }) => {
    try {
      const response = await getMedicines({ page, limit, search });
      return response;
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong";
      dispatch(setAlert({ type: "error", message }));
      return rejectWithValue(message);
    }
  }
);

export const updateMedicine = createAsyncThunk(
  "editMedicine",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editMedicine(data);
      dispatch(
        setAlert({ type: "success", message: "Medicine Updated Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeMedicine = createAsyncThunk(
  "deleteMedicine",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteMedicine(data);
      dispatch(
        setAlert({ type: "success", message: "Medicine Deleted Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchMedicineRequisitions = createAsyncThunk(
  "medicine/fetchMedicineRequisitions",
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const response = await getMedicineRequisitions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const submitMedicineRequisition = createAsyncThunk(
  "medicine/submitMedicineRequisition",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await createMedicineRequisition(data);
      dispatch(setAlert({ type: "success", message: "Medicine Requisition created successfully" }));
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchMedicineRequisitionById = createAsyncThunk(
  "medicine/fetchMedicineRequisitionById",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await getMedicineRequisitionById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const editMedicineRequisition = createAsyncThunk(
  "medicine/editMedicineRequisition",
  async ({ id, ...data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await editMedicineRequisitionApi(id, data);
      dispatch(setAlert({ type: "success", message: "Medicine Requisition updated successfully" }));
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const approveMedicineRequisition = createAsyncThunk(
  "medicine/approveMedicineRequisition",
  async ({ id, ...data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await approveMedicineRequisitionApi(id, data);
      dispatch(setAlert({ type: "success", message: "Medicine Requisition approved successfully" }));
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const rejectMedicineRequisition = createAsyncThunk(
  "medicine/rejectMedicineRequisition",
  async ({ id, ...data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await rejectMedicineRequisitionApi(id, data);
      dispatch(setAlert({ type: "success", message: "Medicine Requisition rejected successfully" }));
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeMedicineRequisition = createAsyncThunk(
  "medicine/removeMedicineRequisition",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteMedicineRequisitionApi(id);
      dispatch(setAlert({ type: "success", message: "Medicine Requisition deleted successfully" }));
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const medicineSlice = createSlice({
  name: "medicine",
  initialState,
  reducers: {
    // postMedicine: (state, { payload }) => {
    //   state.data = [...state.data, payload.payload]
    // },
    setMedicines: (state, { payload }) => {
      state.data = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addMedicine.pending, (state) => {
        state.loading = true;
      })
      .addCase(addMedicine.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addMedicine.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addCSVMedicine.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCSVMedicine.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.payload?.length)
          localStorage.setItem("medicines", JSON.stringify(payload.payload));
        state.data = payload.payload;
      })
      .addCase(addCSVMedicine.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchMedicines.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.loading = false;

        const medicines = action.payload?.payload || []; // medicine array
        const totalCount = action.payload?.pagination?.total || 0;
        const totalPages = action.payload?.pagination?.totalPages || 1;

        localStorage.setItem("medicines", JSON.stringify(medicines));

        state.data = medicines;
        state.totalCount = totalCount;
        state.totalPages = totalPages;
      })
      .addCase(fetchMedicines.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeMedicine.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeMedicine.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = state.data.filter(
          (item) => item._id !== payload.payload._id
        );
      })
      .addCase(removeMedicine.rejected, (state, action) => {
        state.loading = false;
      });

    builder
      .addCase(updateMedicine.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMedicine.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findMedicineIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.data[findMedicineIndex] = payload.payload;
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.loading = false;
      });

    builder
      .addCase(fetchMedicineRequisitions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMedicineRequisitions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload?.data || payload || [];
        state.totalCount = payload?.totalCount || payload?.total || 0;
        state.totalPages =
          payload?.totalPages ||
          payload?.pages ||
          Math.max(1, Math.ceil((payload?.total || 0) / (payload?.limit || 10)));
      })
      .addCase(fetchMedicineRequisitions.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(submitMedicineRequisition.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitMedicineRequisition.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitMedicineRequisition.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(editMedicineRequisition.pending, (state) => {
        state.loading = true;
      })
      .addCase(editMedicineRequisition.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editMedicineRequisition.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(approveMedicineRequisition.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveMedicineRequisition.fulfilled, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(approveMedicineRequisition.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(rejectMedicineRequisition.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectMedicineRequisition.fulfilled, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(rejectMedicineRequisition.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeMedicineRequisition.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeMedicineRequisition.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = state.data.filter((req) => req._id !== payload);
      })
      .addCase(removeMedicineRequisition.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setMedicines } = medicineSlice.actions;

export default medicineSlice.reducer;
