import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  add_tax_helper,
  getTaxList,
  updateTax
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

export const addTax = createAsyncThunk(
  "addoffer",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await add_tax_helper(data);
      dispatch(
        setAlert({ type: "success", message: "Tax Saved Successfully" })
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchTaxList = createAsyncThunk(
  "taxlist/fetchtaxlist",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue, dispatch }) => {
    try {
      const response = await getTaxList({ page, limit, search });
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateTaxFunction = createAsyncThunk(
  "editTax",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateTax(data);
      dispatch(
        setAlert({ type: "success", message: "Tax Updated Successfully" })
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


const taxSlice = createSlice({
  name: "tax",
  initialState,
  reducers: {
    // // postMedicine: (state, { payload }) => {
    // //   state.data = [...state.data, payload.payload]
    // // },
    setTax: (state, { payload }) => {
      state.data = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addTax.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTax.fulfilled, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(addTax.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchTaxList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaxList.fulfilled, (state, action) => {
        state.loading = false;
        const list = action.payload?.payload || [];
        const totalCount = action.payload?.pagination?.total || 0;
        state.data = list;
        state.totalCount = totalCount;
      })
      .addCase(fetchTaxList.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setTax } = taxSlice.actions;

export default taxSlice.reducer;
