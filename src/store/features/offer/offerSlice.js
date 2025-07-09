import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
 add_offer_helper
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

export const addOffer = createAsyncThunk(
  "addoffer",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await add_offer_helper(data);
      dispatch(
        setAlert({ type: "success", message: "offer Saved Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);


const offerSlice = createSlice({
  name: "offer",
  initialState,
  reducers: {
    // // postMedicine: (state, { payload }) => {
    // //   state.data = [...state.data, payload.payload]
    // // },
    setOffers: (state, { payload }) => {
      state.data = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addOffer.pending, (state) => {
        state.loading = true;
      })
      .addCase(addOffer.fulfilled, (state, { payload }) => {
        state.loading = false;
        //state.data = payload.payload;
        console.log(payload, "payload offer");
      })
      .addCase(addOffer.rejected, (state) => {
        state.loading = false;
      });
      },
});

export const { setOffers } = offerSlice.actions;

export default offerSlice.reducer;
