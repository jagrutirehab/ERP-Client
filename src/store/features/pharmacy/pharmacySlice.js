import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDetailedPrescription, getMedineApprovalsByStatus, getPendingPatientApprovals, updateMedicineApprovalStatus } from "../../../helpers/backend_helper";

const initialState = {
    loading: false,
    medicineApprovals: [],
    pendingPatients: [],
    detailedPrescription: {}
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


export const pharmacySlice = createSlice({
    name: "Pharmacy",
    initialState,
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
                if (payload.data.type === "single" && payload.update !== "pendingPatients") {
                    state.medicineApprovals.data = state.medicineApprovals.data.filter((data) => data._id !== payload.data.id);
                } else if (payload.data.type === "bulk") {
                    state.medicineApprovals = [];
                    console.log(payload)
                } else if (payload.update === "pendingPatients") {
                    console.log("here")
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
        })

    }
});

export default pharmacySlice.reducer;