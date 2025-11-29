import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getEmployees, postEmployee } from "../../../helpers/backend_helper";

const initialState = {
    employees: {
        data: [],
        pagination: {}
    },
    loading: false
};
export const getMasterEmployees = createAsyncThunk("hr/getEmployees", async (data, { rejectWithValue }) => {
    try {
        const response = await getEmployees(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
})

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
                state.employees = payload;
            })
            .addCase(getMasterEmployees.rejected, (state) => {
                state.loading = false
            })
    }
});

export default hrSlice.reducer;