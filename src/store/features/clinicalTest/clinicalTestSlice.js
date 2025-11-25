import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import {
  getCiwaTest,
  postCiwatest,
  getClinicalTest,
  postSsrstest,
  postYmrsTest,
  postMPQtest,
  postMMSEtest,
  postYBOCSTest,
  postACDSTest,
  postHAMATest,
  postHAMDTest,
  postPANSSTest,
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

export const createMMSETest = createAsyncThunk(
  "createMMSETest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postMMSEtest(data);
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

export const createYBOCSTest = createAsyncThunk(
  "createYBOCSTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postYBOCSTest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const createACDSTest = createAsyncThunk(
  "createACDSTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postACDSTest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const createHAMATest = createAsyncThunk(
  "createHAMATest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postHAMATest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const createHAMDTest = createAsyncThunk(
  "createHAMDTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postHAMDTest(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const createPANSSTest = createAsyncThunk(
  "createPANSSTest",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await postPANSSTest(data);
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
    // create MMSE test
    builder
      .addCase(createMMSETest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMMSETest.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.data = payload.payload;
      })
      .addCase(createMMSETest.rejected, (state) => {
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
    // create YBOCS Test
    builder
      .addCase(createYBOCSTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createYBOCSTest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createYBOCSTest.rejected, (state) => {
        state.isLoading = false;
      });
    // create ACDS Test
    builder
      .addCase(createACDSTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createACDSTest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createACDSTest.rejected, (state) => {
        state.isLoading = false;
      });
    // create HAM-A Test
    builder
      .addCase(createHAMATest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createHAMATest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createHAMATest.rejected, (state) => {
        state.isLoading = false;
      });
    // create HAM-D Test
    builder
      .addCase(createHAMDTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createHAMDTest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createHAMDTest.rejected, (state) => {
        state.isLoading = false;
      });
    // create HAM-D Test
    builder
      .addCase(createPANSSTest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPANSSTest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createPANSSTest.rejected, (state) => {
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
