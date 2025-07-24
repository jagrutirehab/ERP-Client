import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import {
  getCiwaTest,
  postCiwatest,
  getClinicalTest,
  postSsrstest,
  postYmrsTest,
  postMPQtest,
} from "../../../helpers/backend_helper";

export const fetchClinicalTest = createAsyncThunk(
  "fetchClinicalTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getClinicalTest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchCiwaTest = createAsyncThunk(
  "getCiwaTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getCiwaTest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const createCiwaTest = createAsyncThunk(
  "createCiwaTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postCiwatest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const createSsrsTest = createAsyncThunk(
  "createSsrsTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postSsrstest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const createMPQTest = createAsyncThunk(
  "createMPQTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postMPQtest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const createYMRSTest = createAsyncThunk(
  "createYMRSTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postYmrsTest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

const initialState = {
  testName: "babu raw",
  isTestPageOpen: false,
  isLoading: false,
  data: null,
  testResult: null,
  isClinincalTab: false,
};

export const clinicalTestSlice = createSlice({
  name: "clinicalTest",
  initialState: initialState,
  reducers: {
    setTestName: (state, { payload }) => {
      state.testName = payload;
    },
    setTestPageOpen: (state, { payload }) => {
      state.isTestPageOpen = payload;
    },
    setLoding: (state, { payload }) => {
      state.isLoading = payload;
    },
    setIsClinicalTab: (state, { payload }) => {
      state.isClinincalTab = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCiwaTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCiwaTest.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.data = payload.data;
      })
      .addCase(fetchCiwaTest.rejected, (state) => {
        state.isLoading = false;
      });
    // post cewa-ar test
    builder
      .addCase(createCiwaTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCiwaTest.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.data = payload.payload;
      })
      .addCase(createCiwaTest.rejected, (state) => {
        state.isLoading = false;
      });

    builder
      .addCase(createSsrsTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSsrsTest.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.data = payload.payload;
      })
      .addCase(createSsrsTest.rejected, (state) => {
        state.isLoading = false;
      });
    // create MPQ test
    builder
      .addCase(createMPQTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMPQTest.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.data = payload.payload;
      })
      .addCase(createMPQTest.rejected, (state) => {
        state.isLoading = false;
      });
    // create YMRS Test
    builder
      .addCase(createYMRSTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createYMRSTest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createYMRSTest.rejected, (state) => {
        state.isLoading = false;
      });
    // fetchClinicalTest
    builder
      .addCase(fetchClinicalTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchClinicalTest.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.testResult = payload.data;
      })
      .addCase(fetchClinicalTest.rejected, (state) => {
        state.testResult = [];
        state.isLoading = false;
      });
  },
});

export const { setTestName, setTestPageOpen, setLoding, setIsClinicalTab } =
  clinicalTestSlice.actions;
export default clinicalTestSlice.reducer;
