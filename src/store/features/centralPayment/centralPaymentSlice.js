import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCentralPaymentById, getCentralPayments, getDetailedCentralReport, getSummaryCentralReport, postCentralPayment, updateCentralPayment } from "../../../helpers/backend_helper";

const initialState = {
    loading: false,
    spendings: {},
    approvals: {},
    paymentDetails: null,
    paymentDetailsLoading: false,
    summaryReport: {
        data: [],
        cache: {},
    },
    detailedReport: {},
};

export const getLastCentralPayments = createAsyncThunk(
    "centralPayment/getPayments",
    async (data, { rejectWithValue, getState }) => {
        const cached = getState().CentralPayment.spendings?.data;
        if (cached && cached.length > 0) {
            return { data: cached, fromCache: true }
        }
        try {
            const response = await getCentralPayments(data);
            return { payload: response, fromCache: false };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const getApprovals = createAsyncThunk(
    "centralPayment/getAwitingApprovals", async (data, { rejectWithValue }) => {
        try {
            const response = await getCentralPayments(data);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const getPaymentDetails = createAsyncThunk(
    'centralPayment/getPaymentDetails',
    async (paymentId, { rejectWithValue }) => {
        try {
            const response = await getCentralPaymentById(paymentId);
            return response.payload;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const editCentralPayment = createAsyncThunk(
    "centralPayment/editCentralPayment", async (data, { rejectWithValue }) => {
        try {
            const response = await updateCentralPayment(data);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const addPayment = createAsyncThunk(
    "centralPayment/addPayment",
    async (data, { getState, rejectWithValue }) => {
        try {
            const response = await postCentralPayment(data);

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


export const getSummaryReport = createAsyncThunk(
    "cash/getSummaryCentralReport",
    async ({ centers, refetch = false }, { getState, dispatch, rejectWithValue }) => {
        const cacheKey = [...centers].sort().join(",");
        const cached = getState().CentralPayment.summaryReport?.cache?.[cacheKey];
        if (!refetch && cached) {
            return { data: cached, fromCache: true };
        }
        try {
            const response = await getSummaryCentralReport({ centers });
            return { data: response, cacheKey, fromCache: false };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);


export const getDetailedReport = createAsyncThunk(
    "cash/getDetailedCashReport",
    async (data, { rejectWithValue }) => {
        try {
            const response = await getDetailedCentralReport(data);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const centralPaymentSlice = createSlice({
    name: "CentralPayment",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(getLastCentralPayments.pending, (state) => {
                state.loading = true;
            })
            .addCase(getLastCentralPayments.fulfilled, (state, { payload }) => {
                state.loading = false;
                if (!payload.fromCache) {
                    state.spendings = payload.payload;
                }
            })
            .addCase(getLastCentralPayments.rejected, (state) => {
                state.loading = false;
            });

        builder
            .addCase(getApprovals.pending, (state) => {
                state.loading = true;
            })
            .addCase(getApprovals.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.approvals = payload;
            })
            .addCase(getApprovals.rejected, (state) => {
                state.loading = false;
            });

        builder.addCase(addPayment.fulfilled, (state, { payload }) => {
            state.spendings.data.unshift(payload);
            if (state.spendings.data.length > 10) {
                state.spendings.data.pop();
            }
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

        builder.addCase(editCentralPayment.fulfilled, (state, { payload }) => {
            if (Array.isArray(state.approvals.data)) {
                state.approvals.data = state.approvals.data.filter(
                    (approval) => approval._id !== payload.payload._id
                );
            }
        });

        builder.addCase(getPaymentDetails.pending, (state) => {
            state.paymentDetailsLoading = true;
        })
            .addCase(getPaymentDetails.fulfilled, (state, { payload }) => {
                state.paymentDetails = payload;
                state.paymentDetailsLoading = false;
            })
            .addCase(getPaymentDetails.rejected, (state) => {
                state.paymentDetailsLoading = false
            })


    }
});


export default centralPaymentSlice.reducer;