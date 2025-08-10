import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
 add_offer_helper,
 getOfferList,
 updateOffer
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
      return rejectWithValue(error);
    }
  }
);

export const fetchOfferList = createAsyncThunk(
  "offerlist/fetchofferlist",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue, dispatch }) => {
    try {
      const response = await getOfferList({ page, limit, search});
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateOfferFunction = createAsyncThunk(
  "editCenter",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateOffer(data);
      dispatch(
        setAlert({ type: "success", message: "Offer Updated Successfully" })
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
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
      })
      .addCase(addOffer.rejected, (state) => {
        state.loading = false;
      });

     builder
          .addCase(fetchOfferList.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchOfferList.fulfilled, (state, action) => {
            state.loading = false;
            const list = action.payload?.payload || [];
            const totalCount = action.payload?.pagination?.total || 0;
            state.data = list;
            state.totalCount = totalCount;
          })
          .addCase(fetchOfferList.rejected, (state) => {
            state.loading = false;
          });
    
      },
});

export const { setOffers } = offerSlice.actions;

export default offerSlice.reducer;
