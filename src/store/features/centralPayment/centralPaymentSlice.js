import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { centralPaymentAction, editCentralPayment, getCentralPaymentById, getCentralPayments, getDetailedCentralReport, getSummaryCentralReport, postCentralPayment } from "../../../helpers/backend_helper";

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
    async (data, { getState, rejectWithValue }) => {
        const { centers } = data;
        const cacheKey = centers?.length ? [...centers].sort().join(",") : "all";
        const cachedPayments = getState().CentralPayment.spendings?.[cacheKey];

        if (cachedPayments && Array.isArray(cachedPayments.data) && cachedPayments.data.length > 0) {
            return { data: cachedPayments, fromCache: true, cacheKey };
        }
        try {
            const response = await getCentralPayments(data);
            return { data: response, fromCache: false, cacheKey };
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

export const updateCentralPaymentAction = createAsyncThunk(
    "centralPayment/updateCentralPaymentAction", async (data, { rejectWithValue }) => {
        try {
            const response = await centralPaymentAction(data);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateCentralPayment = createAsyncThunk(
    "centralPayment/updateCentralPayment", async (data, { getState, rejectWithValue }) => {
        try {
            const { id, formData } = data;
            const response = await editCentralPayment(id, formData);

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
)

export const addPayment = createAsyncThunk(
    "centralPayment/addPayment",
    async ({ formData }, { getState, rejectWithValue }) => {
        try {
            const response = await postCentralPayment(formData);

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
                const { data, cacheKey, fromCache } = payload;
                if (!fromCache && cacheKey) {
                    state.spendings = {};
                    state.spendings[cacheKey] = data;
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

        builder.addCase(addPayment.fulfilled, (state, { payload, meta }) => {
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

        builder.addCase(updateCentralPaymentAction.fulfilled, (state, { payload }) => {
            if (Array.isArray(state.approvals.data)) {
                state.approvals.data = state.approvals.data.filter(
                    (approval) => approval._id !== payload.payload._id
                );
            }
        });

        builder.addCase(updateCentralPayment.fulfilled, (state, { payload, meta }) => {
            const centers = meta.arg.centers;
            const cacheKey = centers?.length ? [...centers].sort().join(",") : "all";
            state.spendings[cacheKey].data = state.spendings[cacheKey].data.map((item) =>
                item._id === payload._id ? payload : item
            );
            state.approvals.data = state.approvals.data.map((approval) =>
                approval._id === payload._id ? payload : approval
            )
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