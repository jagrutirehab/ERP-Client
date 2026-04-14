import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    deleteAuditById,
    getAuditsByStatus,
    getDetailedPrescription,
    getMedineApprovalsByStatus,
    getNurseGivenMedicines as getNurseGivenMedicinesApi,
    getPendingPatientApprovals,
    updateMedicineApprovalStatus,
    getInternalTransferRequisitions,
    createInternalTransferRequisition,
    searchPharmacyMedicines,
    getInternalTransferRequisitionById,
    updateInternalTransferRequisition,
    reviewInternalTransferRequisition,
    dispatchInternalTransferRequisition,
    grnInternalTransferRequisition,
} from "../../../helpers/backend_helper";

const initialState = {
    loading: false,
    data: [],
    pagination: {},
    medicineApprovals: [],
    pendingPatients: [],
    detailedPrescription: {},
    pendingAudits: [],
    auditHistory: {
        data: [],
        pagination: {}
    },
    internalTransfer: {
        loading: false,
        data: [],
        totalCount: 0,
        totalPages: 1,
    },
    submitLoading: false,
};

export const getMedicineApprovals = createAsyncThunk("pharmacy/getMedineApprovalsByStatus", async (data, { rejectWithValue }) => {
    try {
        const response = await getMedineApprovalsByStatus(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const updateApprovalStatus = createAsyncThunk("pharmacy/updateMedicineApprovalStatus", async ({ update, ...data }, { rejectWithValue }) => {
    try {
        const response = await updateMedicineApprovalStatus(data);
        return { ...response, update };
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getPendingApprovalsByPatient = createAsyncThunk("pharmacy/getPendingPatientApprovals", async (data, { rejectWithValue }) => {
    try {
        const response = await getPendingPatientApprovals(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getDetailedPrescriptionById = createAsyncThunk("pharmacy/getDetailedPrescription", async (prescriptionId, { rejectWithValue }) => {
    try {
        const response = await getDetailedPrescription(prescriptionId);
        return response.data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getAudits = createAsyncThunk(
    "pharmacy/getAuditsByStatus",
    async (data, { rejectWithValue }) => {
        try {
            const response = await getAuditsByStatus(data);
            return {
                ...response,
                append: data.append || false
            };
        } catch (error) {
            return rejectWithValue(error);
        }
    });

export const deleteAudit = createAsyncThunk("pharmacy/deleteAuditById", async ({ _id }, { rejectWithValue }) => {
    try {
        const response = await deleteAuditById(_id);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchInternalTransferRequisitions = createAsyncThunk(
    "pharmacy/fetchInternalTransferRequisitions",
    async (params, { rejectWithValue }) => {
        try {
            const response = await getInternalTransferRequisitions(params);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const submitInternalTransferRequisition = createAsyncThunk(
    "pharmacy/submitInternalTransferRequisition",
    async (data, { rejectWithValue }) => {
        try {
            const response = await createInternalTransferRequisition(data);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const reviewInternalTransfer = createAsyncThunk(
    "pharmacy/reviewInternalTransfer",
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            const response = await reviewInternalTransferRequisition(id, data);
            return { id, data: response?.data || response };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const grnInternalTransfer = createAsyncThunk(
    "pharmacy/grnInternalTransfer",
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            const response = await grnInternalTransferRequisition(id, data);
            return { id, data: response?.data || response };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const dispatchInternalTransfer = createAsyncThunk(
    "pharmacy/dispatchInternalTransfer",
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            const response = await dispatchInternalTransferRequisition(id, data);
            return { id, data: response?.data || response };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchInternalTransferById = createAsyncThunk(
    "pharmacy/fetchInternalTransferById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await getInternalTransferRequisitionById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const editInternalTransferRequisition = createAsyncThunk(
    "pharmacy/editInternalTransferRequisition",
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            const response = await updateInternalTransferRequisition(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const searchPharmacyInventory = createAsyncThunk(
    "pharmacy/searchPharmacyInventory",
    async (params, { rejectWithValue }) => {
        try {
            const response = await searchPharmacyMedicines(params);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const getNurseGivenMedicines = createAsyncThunk("pharmacy/getNurseGivenMedicines", async (data, { rejectWithValue }) => {
    try {
        const response = await getNurseGivenMedicinesApi(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const pharmacySlice = createSlice({
    name: "Pharmacy",
    initialState,
    reducers: {
        clearMedicineApprovals: (state) => {
            state.medicineApprovals = []
        },
        clearAuditHistory: (state) => {
            state.auditHistory = initialState.auditHistory
        },
        clearInternalTransfer: (state) => {
            state.internalTransfer = initialState.internalTransfer
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMedicineApprovals.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMedicineApprovals.fulfilled, (state, { payload }) => {
                state.medicineApprovals = payload;
                state.loading = false;
            })
            .addCase(getMedicineApprovals.rejected, (state) => {
                state.loading = false;
            });
        builder
            .addCase(updateApprovalStatus.fulfilled, (state, { payload }) => {
                console.log(payload)
                if (payload.type === "single" && payload.update !== "pendingPatients") {
                    state.medicineApprovals.data = state.medicineApprovals.data.filter((data) => data._id !== payload._id);
                }
                else if (payload.type === "bulk" && payload.update === "pendingApprovals" && payload.status === "REJECTED") {
                    state.medicineApprovals = [];
                }
                else if (payload.update === "pendingPatients") {
                    state.pendingPatients.data = state.pendingPatients.data.filter((data) => data._id !== payload._id);
                }
            });
        builder
            .addCase(getPendingApprovalsByPatient.pending, (state) => {
                state.loading = true
            })
            .addCase(getPendingApprovalsByPatient.fulfilled, (state, { payload }) => {
                state.pendingPatients = payload;
                state.loading = false;
            })
            .addCase(getPendingApprovalsByPatient.rejected, (state) => {
                state.loading = false;
            });

        builder.addCase(getDetailedPrescriptionById.fulfilled, (state, { payload }) => {
            state.detailedPrescription = payload;
        });

        builder
            .addCase(getAudits.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAudits.fulfilled, (state, { payload }) => {
                if (payload.status === "PENDING") {
                    state.pendingAudits = payload;
                } else if (payload.status === "COMPLETED") {
                    if (!payload.append) {
                        state.auditHistory = {
                            data: payload.data,
                            pagination: payload.pagination
                        };
                    }
                }


                state.loading = false;
            })
            .addCase(getAudits.rejected, (state) => {
                state.loading = false;
            });

        builder
            .addCase(deleteAudit.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteAudit.fulfilled, (state, { meta }) => {
                const { _id, status } = meta.arg;
                if (status === "PENDING") {
                    state.pendingAudits.data = state.pendingAudits.data.filter((audit) => audit._id !== _id);
                } else if (status === "COMPLETED") {
                    state.auditHistory.data = state.auditHistory.data.filter((audit) => audit._id !== _id);
                }
                state.loading = false;
            })
            .addCase(deleteAudit.rejected, (state) => {
                state.loading = false;
            });

        builder
            .addCase(getNurseGivenMedicines.pending, (state) => {
                state.loading = true;
            })
            .addCase(getNurseGivenMedicines.fulfilled, (state, { payload }) => {
                state.data = payload;
                state.loading = false;
            })
            .addCase(getNurseGivenMedicines.rejected, (state) => {
                state.loading = false;
            });

        builder
            .addCase(fetchInternalTransferRequisitions.pending, (state) => {
                state.internalTransfer.loading = true;
            })
            .addCase(fetchInternalTransferRequisitions.fulfilled, (state, { payload }) => {
                state.internalTransfer.loading = false;
                state.internalTransfer.data = payload.data || payload || [];
                state.internalTransfer.totalCount = payload.totalCount || payload.total || 0;
                state.internalTransfer.totalPages =
                    payload.totalPages ||
                    payload.pages ||
                    Math.max(1, Math.ceil((payload.total || 0) / (payload.limit || 10)));
            })
            .addCase(fetchInternalTransferRequisitions.rejected, (state) => {
                state.internalTransfer.loading = false;
            });

        builder
            .addCase(submitInternalTransferRequisition.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(submitInternalTransferRequisition.fulfilled, (state) => {
                state.submitLoading = false;
            })
            .addCase(submitInternalTransferRequisition.rejected, (state) => {
                state.submitLoading = false;
            });

        builder
            .addCase(editInternalTransferRequisition.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(editInternalTransferRequisition.fulfilled, (state) => {
                state.submitLoading = false;
            })
            .addCase(editInternalTransferRequisition.rejected, (state) => {
                state.submitLoading = false;
            });

        builder
            .addCase(grnInternalTransfer.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(grnInternalTransfer.fulfilled, (state, { payload }) => {
                state.submitLoading = false;
                state.internalTransfer.data = state.internalTransfer.data.map((req) =>
                    req._id === payload.id ? { ...req, status: payload.data?.status ?? req.status } : req
                );
            })
            .addCase(grnInternalTransfer.rejected, (state) => {
                state.submitLoading = false;
            });

        builder
            .addCase(dispatchInternalTransfer.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(dispatchInternalTransfer.fulfilled, (state, { payload }) => {
                state.submitLoading = false;
                state.internalTransfer.data = state.internalTransfer.data.map((req) =>
                    req._id === payload.id ? { ...req, status: payload.data?.status ?? req.status } : req
                );
            })
            .addCase(dispatchInternalTransfer.rejected, (state) => {
                state.submitLoading = false;
            });

        builder
            .addCase(reviewInternalTransfer.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(reviewInternalTransfer.fulfilled, (state, { payload }) => {
                state.submitLoading = false;
                state.internalTransfer.data = state.internalTransfer.data.map((req) =>
                    req._id === payload.id ? { ...req, status: payload.data?.status ?? req.status } : req
                );
            })
            .addCase(reviewInternalTransfer.rejected, (state) => {
                state.submitLoading = false;
            });
    }
});

export const { clearMedicineApprovals, clearAuditHistory, clearInternalTransfer } = pharmacySlice.actions;

export default pharmacySlice.reducer;
