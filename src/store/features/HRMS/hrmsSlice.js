import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getAttendance, getAttendanceMetrics, getEmployeeReportings, getAttendanceLogs, getAttendanceSummary } from "../../../helpers/backend_helper";


const initialState = {
    data: [],
    lastImportTime: null,
    loading: false,
    pagination: {},
    attendanceSummary: {
        data: null,
        loading: false
    },
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

export const fetchAttendanceLogs = createAsyncThunk("hrms/getAttendanceLogs", async (data, { rejectWithValue }) => {
    try {
        const response = await getAttendanceLogs(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchAttendanceSummary = createAsyncThunk("hrms/getAttendanceSummary", async (data, { rejectWithValue }) => {
    try {
        const response = await getAttendanceSummary(data);
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
                state.data = payload.data?.attendanceData;
                state.lastImportTime = payload.data?.lastImportTime || null;
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

        builder
            .addCase(fetchAttendanceLogs.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAttendanceLogs.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchAttendanceLogs.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(fetchAttendanceSummary.pending, (state) => {
                state.attendanceSummary.loading = true;
            })
            .addCase(fetchAttendanceSummary.fulfilled, (state, { payload }) => {
                state.attendanceSummary.loading = false;
                state.attendanceSummary.data = payload.data;
            })
            .addCase(fetchAttendanceSummary.rejected, (state) => {
                state.attendanceSummary.loading = false;
            });
    }
});

export default hrmsSlice.reducer;