import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  deleteMedicine,
  editMedicine,
  getMedicines,
  postCSVMedicine,
  postMedicine,
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
      const response = await postMedicine(data);
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

export const fetchMedicines = createAsyncThunk(
  "medicine/fetchMedicines",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue, dispatch }) => {
    try {
      const response = await getMedicines({ page, limit, search});
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
      .addCase(addMedicine.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
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

        localStorage.setItem("medicines", JSON.stringify(medicines));

        state.data = medicines;
        state.totalCount = totalCount;
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
  },
});

export const { setMedicines } = medicineSlice.actions;

export default medicineSlice.reducer;
