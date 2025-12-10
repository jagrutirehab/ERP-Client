import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getEmployees, getExitEmployees, getITApprovals, postEmployee, searchExitEmployee } from "../../../helpers/backend_helper";

const initialState = {
    data: [],
    employees: [],
    pagination: {},
    loading: false
};

export const getMasterEmployees = createAsyncThunk("hr/getEmployees", async (data, { rejectWithValue }) => {
    try {
        const response = await getEmployees(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchExitEmployees = createAsyncThunk("hr/exitEmployees", async (data, { rejectWithValue }) => {
    try {
        const response = await getExitEmployees(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const getExitEmployeesBySearch = createAsyncThunk("hr/searchExitEmployee", async (data, { rejectWithValue }) => {
    try {
        const response = await searchExitEmployee(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchITApprovals = createAsyncThunk("hr/getITApprovals", async (data, { rejectWithValue }) => {
    try {
        const response = await getITApprovals(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const hrSlice = createSlice({
    name: "HR",
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(getMasterEmployees.pending, (state) => {
                state.loading = true
            })
            .addCase(getMasterEmployees.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(getMasterEmployees.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(fetchExitEmployees.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchExitEmployees.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchExitEmployees.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(getExitEmployeesBySearch.fulfilled, (state, { payload }) => {
                state.employees = payload.data;
            });

        builder
            .addCase(fetchITApprovals.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchITApprovals.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchITApprovals.rejected, (state) => {
                state.loading = false
            });
    }
});

export default hrSlice.reducer;