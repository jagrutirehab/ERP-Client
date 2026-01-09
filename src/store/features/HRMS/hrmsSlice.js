import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getAttendance, getAttendanceMetrics, getEmployeeReportings } from "../../../helpers/backend_helper";


const initialState = {
    data: [],
    loading: false,
    pagination: {},
};

export const fetchAttendance = createAsyncThunk("hrms/getAttendance", async (data, { rejectWithValue }) => {
    try {
        const response = await getAttendance(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchAttendanceMetrics = createAsyncThunk("hrms/getAttendanceMetrics", async (data, { rejectWithValue }) => {
    try {
        const response = await getAttendanceMetrics(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchReportings = createAsyncThunk("hrms/getEmployeeReportings", async (data, { rejectWithValue }) => {
    try {
        const response = await getEmployeeReportings(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const hrmsSlice = createSlice({
    name: "HRMS",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttendance.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAttendance.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination
            })
            .addCase(fetchAttendance.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(fetchAttendanceMetrics.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAttendanceMetrics.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination
            })
            .addCase(fetchAttendanceMetrics.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(fetchReportings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchReportings.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination
            })
            .addCase(fetchReportings.rejected, (state) => {
                state.loading = false
            });
    }
});

export default hrmsSlice.reducer;