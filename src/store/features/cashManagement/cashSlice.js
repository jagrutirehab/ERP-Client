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
  summaryReport: {
    data: [],
    cache: {},
  },
  isUptoDate: true,
};

export const getLastBankDeposits = createAsyncThunk(
  "cash/getLatestBankDesposits",
  async (data, { getState, dispatch, rejectWithValue }) => {
    const { centers } = data;
    const cacheKey = centers?.length ? [...centers].sort().join(",") : "all";
    const cachedBankDeposits = getState().Cash.bankDeposits?.[cacheKey];
    if (
      cachedBankDeposits &&
      Array.isArray(cachedBankDeposits.data) &&
      cachedBankDeposits.data.length > 0
    ) {
      return { data: cachedBankDeposits, fromCache: true, cacheKey };
    }
    try {
      const response = await getLatestBankDesposits(data);
      return { data: response, fromCache: false, cacheKey };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addSpending = createAsyncThunk(
  "cash/addSpending",
  async ({ formData }, { getState, rejectWithValue }) => {
    try {
      const response = await postSpending(formData);

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
      return rejectWithValue(error);
    }
  }
);

export const getLastSpendings = createAsyncThunk(
  "cash/getLatestSpendings",
  async (data, { getState, rejectWithValue }) => {
    const { centers } = data;
    const cacheKey = centers?.length ? [...centers].sort().join(",") : "all";

    const cachedSpendings = getState().Cash.spendings?.[cacheKey];

    if (
      cachedSpendings &&
      Array.isArray(cachedSpendings.data) &&
      cachedSpendings.data.length > 0
    ) {
      return { data: cachedSpendings, fromCache: true, cacheKey };
    }

    try {
      const response = await getLatestSpendings(data);
      return { data: response, fromCache: false, cacheKey };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addBankDeposit = createAsyncThunk(
  "cash/addBankDeposit",
  async ({ formData }, { getState, rejectWithValue }) => {
    try {
      const response = await postBankDeposit(formData);

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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
    }
  }
);

export const getSummaryReport = createAsyncThunk(
  "cash/getSummaryCashReport",
  async ({ centers, refetch = false }, { getState, dispatch, rejectWithValue }) => {
    const cacheKey = [...centers].sort().join(",");
    const cached = getState().Cash.summaryReport?.cache?.[cacheKey];
    if (!refetch && cached) {
      return { data: cached, fromCache: true };
    }
    try {
      const response = await getSummaryCashReport({ centers });
      return { data: response, cacheKey, fromCache: false };
    } catch (error) {
      return rejectWithValue(error);
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
        state.loading = false;
        const { data, cacheKey, fromCache } = payload;
        if (!fromCache && cacheKey) {
          state.bankDeposits = {};
          state.bankDeposits[cacheKey] = data;
        }
      })
      .addCase(getLastBankDeposits.rejected, (state) => {
        state.loading = false;
      });

    builder.addCase(addBankDeposit.fulfilled, (state, { payload, meta }) => {
      const centers = meta.arg.centers;
      const cacheKey = centers?.length ? [...centers].sort().join(",") : "all";
      if (!state.bankDeposits[cacheKey]) {
        state.bankDeposits[cacheKey] = { data: [], pagination: {} };
      }
      state.bankDeposits[cacheKey].data.unshift(payload);
      if (state.bankDeposits[cacheKey].data.length > 10) {
        state.bankDeposits[cacheKey].data.pop();
      }
    });
    builder
      .addCase(getLastSpendings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLastSpendings.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { data, cacheKey, fromCache } = payload;
        if (!fromCache && cacheKey) {
          state.spendings = {};
          state.spendings[cacheKey] = data;
        }
      })

      .addCase(getLastSpendings.rejected, (state) => {
        state.loading = false;
      });

    builder.addCase(addSpending.fulfilled, (state, { payload, meta }) => {
      const centers = meta.arg.centers;
      const cacheKey = centers?.length ? [...centers].sort().join(",") : "all";
      if (!state.spendings[cacheKey]) {
        state.spendings[cacheKey] = { data: [], pagination: {} };
      }
      state.spendings[cacheKey].data.unshift(payload);
      if (state.spendings[cacheKey].data.length > 10) {
        state.spendings[cacheKey].data.pop();
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
        state.loading = false;
        if (!payload.fromCache) {
          state.summaryReport.cache = {
            [payload.cacheKey]: payload.data.payload,
          };
          state.summaryReport.data = payload.data.payload
        }
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
