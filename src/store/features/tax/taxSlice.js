import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
 add_tax_helper
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
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
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
        //state.data = payload.payload;
        console.log(payload, "payload offer");
      })
      .addCase(addTax.rejected, (state) => {
        state.loading = false;
      });
      },
});

export const { setTax } = taxSlice.actions;

export default taxSlice.reducer;
