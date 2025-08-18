import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  postCenter,
  getCenters,
  editCenter,
  deleteCenter,
  getAllCenters,
  deleteCenterLogo,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  data: [],
  allCenters: [],
  createEditCenter: {
    data: null,
    isOpen: false,
  },
};

export const addCenter = createAsyncThunk(
  "postCenter",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postCenter(data);
      dispatch(
        setAlert({ type: "success", message: "Center Saved Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeCenterLogo = createAsyncThunk(
  "deleteCenterLogo",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteCenterLogo(data);
      dispatch(
        setAlert({
          type: "success",
          message: "File Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchCenters = createAsyncThunk(
  "getCenters",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getCenters(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchAllCenters = createAsyncThunk(
  "getAllCenters",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAllCenters(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateCenter = createAsyncThunk(
  "editCenter",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editCenter(data);
      dispatch(
        setAlert({ type: "success", message: "Center Updated Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeCenter = createAsyncThunk(
  "deleteCenter",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteCenter(data);
      dispatch(
        setAlert({ type: "success", message: "Center Deleted Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

const centerSlice = createSlice({
  name: "center",
  initialState,
  reducers: {
    // postCenter: (state, { payload }) => {
    //   state.data = [...state.data, payload.payload]
    // },
    setCenters: (state, { payload }) => {
      state.data = payload;
    },
    createEditCenter: (state, { payload }) => {
      state.createEditCenter = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addCenter.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCenter.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = [...state.data, payload.payload];
      })
      .addCase(addCenter.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchCenters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCenters.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(fetchCenters.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchAllCenters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCenters.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.allCenters = payload.payload;
      })
      .addCase(fetchAllCenters.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeCenter.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeCenter.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = state.data.filter(
          (item) => item._id !== payload.payload._id
        );
      })
      .addCase(removeCenter.rejected, (state, action) => {
        state.loading = false;
      });

    builder
      .addCase(updateCenter.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCenter.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findUserIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.data[findUserIndex] = payload.payload;
      })
      .addCase(updateCenter.rejected, (state, action) => {
        state.loading = false;
      });

    builder
      .addCase(removeCenterLogo.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeCenterLogo.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findUserIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.data[findUserIndex] = payload.payload;
        state.createEditCenter.data = payload.payload;
      })
      .addCase(removeCenterLogo.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { createEditCenter, setCenters } = centerSlice.actions;

export default centerSlice.reducer;
