import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getAttendance, getAttendanceImportHistory } from "../../../helpers/backend_helper";


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

export const fetchAttendenceImportHistory = createAsyncThunk("hrms/getAttendanceImportHistory", async (data, { rejectWithValue }) => {
    try {
        const response = await getAttendanceImportHistory(data);
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
            })
    }
});

export default hrmsSlice.reducer;