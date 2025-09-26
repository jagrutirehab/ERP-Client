import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import {
  getBaseBalanceByCenter,
  getDetailedCashReport,
  getLatestBankDesposits,
  getLatestSpendings,
  getSummaryCashReport,
  postBankDeposit,
  postBaseBalance,
  postSpending,
} from "../../../helpers/backend_helper";

const initialState = {
  loading: false,
  bankDeposits: {},
  spendings: {},
  baseBalance: [],
  lastBaseBalance: null,
  detailedReport: {},
  summaryReport: [],
  isUptoDate: true,
};

export const getLastBankDeposits = createAsyncThunk(
  "cash/getLatestBankDesposits",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getLatestBankDesposits(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch deposits");
    }
  }
);

export const addSpending = createAsyncThunk(
  "cash/addSpending",
  async (data, { getState, rejectWithValue }) => {
    try {
      const response = await postSpending(data);

      const centers = getState().Center.data;
      const center = centers.find((cn) => cn._id === response.payload.center);
      return {
        ...response.payload,
        center: {
          _id: center?._id,
          title: center?.title,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to log spending");
    }
  }
);

export const getLastSpendings = createAsyncThunk(
  "cash/getLatestSpendings",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getLatestSpendings(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch spendings");
    }
  }
);

export const addBankDeposit = createAsyncThunk(
  "cash/addBankDeposit",
  async (data, { getState, rejectWithValue }) => {
    try {
      const response = await postBankDeposit(data);

      const centers = getState().Center.data;
      const center = centers.find((cn) => cn._id === response.payload.center);
      return {
        ...response.payload,
        center: {
          _id: center?._id,
          title: center?.title,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add deposit");
    }
  }
);

export const addBaseBalance = createAsyncThunk(
  "cash/addBaseBalance",
  async (data, { getState, rejectWithValue }) => {
    try {
      const response = await postBaseBalance(data);

      const centers = getState().Center.data;
      const center = centers.find((cn) => cn._id === response.payload.center);
      return {
        ...response.payload,
        center: {
          _id: center?._id,
          title: center?.title,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add base balance");
    }
  }
);

export const getLastBaseBalanceByCenter = createAsyncThunk(
  "cash/getBaseBalanceByCenter",
  async (centerId, { dispatch, rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cachedBalance = state.Cash.baseBalance.find(
        (balance) => balance.center && balance.center._id === centerId
      );

      if (cachedBalance) {
        return { payload: cachedBalance, fromCache: true };
      }

      const response = await getBaseBalanceByCenter(centerId);
      return { payload: response.payload, fromCache: false };
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch base balance");
    }
  }
);

export const getDetailedReport = createAsyncThunk(
  "cash/getDetailedCashReport",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getDetailedCashReport(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch spendings");
    }
  }
);

export const getSummaryReport = createAsyncThunk(
  "cash/getSummaryCashReport",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getSummaryCashReport(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch spendings");
    }
  }
);

export const CashSlice = createSlice({
  name: "cash",
  initialState,
  reducers: {
    setLastBaseBalanceFromCache: (state, action) => {
      const centerId = action.payload;
      const cachedBalance = state.baseBalance.find(
        (balance) => balance.center && balance.center._id === centerId
      );
      state.lastBaseBalance = cachedBalance || null;
    },
    clearLastBaseBalance: (state) => {
      state.lastBaseBalance = null;
    },
    forceRefreshBalance: (state, action) => {
      const centerId = action.payload;
      state.baseBalance = state.baseBalance.filter(
        (balance) => !balance.center || balance.center._id !== centerId
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLastBankDeposits.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLastBankDeposits.fulfilled, (state, { payload }) => {
        state.bankDeposits = payload;
        state.loading = false;
      })
      .addCase(getLastBankDeposits.rejected, (state) => {
        state.loading = false;
      });

    builder.addCase(addBankDeposit.fulfilled, (state, { payload }) => {
      state.bankDeposits.data.unshift(payload);
      if (state.bankDeposits.data.length > 10) {
        state.bankDeposits.data.pop();
      }
    });
    builder
      .addCase(getLastSpendings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLastSpendings.fulfilled, (state, { payload }) => {
        state.spendings = payload;
        state.loading = false;
      })
      .addCase(getLastSpendings.rejected, (state) => {
        state.loading = false;
      });

    builder.addCase(addSpending.fulfilled, (state, { payload }) => {
      state.spendings.data.unshift(payload);
      if (state.spendings.data.length > 10) {
        state.spendings.data.pop();
      }
    });

    builder
      .addCase(getLastBaseBalanceByCenter.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLastBaseBalanceByCenter.fulfilled, (state, { payload }) => {
        if (payload && payload.payload) {
          state.lastBaseBalance = payload.payload;

          if (!payload.fromCache) {
            const existingIndex = state.baseBalance.findIndex(
              (balance) =>
                balance.center &&
                balance.center._id === payload.payload.center?._id
            );

            if (existingIndex >= 0) {
              state.baseBalance[existingIndex] = payload.payload;
            } else {
              state.baseBalance.push(payload.payload);
            }
          }
        } else {
          state.lastBaseBalance = null;

          if (payload && !payload.fromCache) {
            const center = state.centers?.find(
              (c) => c._id === payload.requestedCenterId
            );
            if (center) {
              state.baseBalance.push({
                center: { _id: center._id, title: center.title },
                amount: null,
                date: null,
                isEmpty: true,
              });
            }
          }
        }
        state.loading = false;
      })
      .addCase(getLastBaseBalanceByCenter.rejected, (state) => {
        state.loading = false;
        state.lastBaseBalance = null;
      });

    builder.addCase(addBaseBalance.fulfilled, (state, { payload }) => {
      if (payload) {
        state.lastBaseBalance = payload;

        state.baseBalance = state.baseBalance.filter(
          (balance) =>
            !balance.center || balance.center._id !== payload.center?._id
        );

        state.baseBalance.push(payload);
      }
    });
    builder
      .addCase(getDetailedReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDetailedReport.fulfilled, (state, { payload }) => {
        state.detailedReport = payload;
        state.loading = false;
      })
      .addCase(getDetailedReport.rejected, (state) => {
        state.loading = false;
      });
    builder
      .addCase(getSummaryReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSummaryReport.fulfilled, (state, { payload }) => {
        state.summaryReport = payload.payload;
        state.loading = false;
      })
      .addCase(getSummaryReport.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setLastBaseBalanceFromCache,
  clearLastBaseBalance,
  forceRefreshBalance,
} = CashSlice.actions;

export default CashSlice.reducer;
