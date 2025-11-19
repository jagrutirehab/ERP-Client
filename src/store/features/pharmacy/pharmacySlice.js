import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteAuditById, getAuditsByStatus, getDetailedPrescription, getMedineApprovalsByStatus, getPendingPatientApprovals, updateMedicineApprovalStatus } from "../../../helpers/backend_helper";

const initialState = {
    loading: false,
    medicineApprovals: [],
    pendingPatients: [],
    detailedPrescription: {},
    pendingAudits: [],
    auditHistory: {
        data: [],
        pagination: {}
    }
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




export const pharmacySlice = createSlice({
    name: "Pharmacy",
    initialState,
    reducers: {
        clearMedicineApprovals: (state) => {
            state.medicineApprovals = []
        },
        clearAuditHistory: (state) => {
            state.auditHistory = initialState.auditHistory
        }
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
                if (payload.data.type === "single" && payload.update !== "pendingPatients") {
                    state.medicineApprovals.data = state.medicineApprovals.data.filter((data) => data._id !== payload.data.id);
                } else if (payload.data.type === "bulk") {
                    state.medicineApprovals = [];
                    console.log(payload)
                } else if (payload.update === "pendingPatients") {
                    state.pendingPatients.data = state.pendingPatients.data.filter((data) => data._id !== payload.data.id);
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
            })
    }
});

export const { clearMedicineApprovals, clearAuditHistory } = pharmacySlice.actions;

export default pharmacySlice.reducer;