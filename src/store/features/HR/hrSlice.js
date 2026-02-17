import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAdvanceSalaries, getDesignations, getEmployees, getEmployeeTransfers, getExitEmployees, getHirings, getIncentives, getITApprovals, getMonthlyAttendance, getPayrolls, getTPMs, payrollAction, payrollBulkAction, postDesignation, searchExitEmployee, updatePayrollRemarks } from "../../../helpers/backend_helper";

const initialState = {
    data: [],
    employees: [],
    designations: [],
    pagination: {},
    loading: false,
    designationLoading: false,
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

export const fetchAdvanceSalaries = createAsyncThunk("hr/getAdvanceSalaries", async (data, { rejectWithValue }) => {
    try {
        const response = await getAdvanceSalaries(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchEmployeeTransfers = createAsyncThunk("hr/getEmployeeTransfers", async (data, { rejectWithValue }) => {
    try {
        const response = await getEmployeeTransfers(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchDesignations = createAsyncThunk("hr/getDesignations", async (data, { rejectWithValue }) => {
    try {
        const response = await getDesignations(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const addDesignation = createAsyncThunk("hr/postDesignation", async (data, { rejectWithValue }) => {
    try {
        const response = await postDesignation(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchHirings = createAsyncThunk("hr/getHirings", async (data, { rejectWithValue }) => {
    try {
        const response = await getHirings(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchTPMs = createAsyncThunk("hr/getTPMs", async (data, { rejectWithValue }) => {
    try {
        const response = await getTPMs(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchIncentives = createAsyncThunk("hr/getIncentives", async (data, { rejectWithValue }) => {
    try {
        const response = await getIncentives(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchPayrolls = createAsyncThunk("hr/getPayrolls", async (data, { rejectWithValue }) => {
    try {
        const response = await getPayrolls(data);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const editPayrollRemarks = createAsyncThunk("hr/updatePayrollRemarks", async ({ id, ...payload }, { rejectWithValue }) => {
    try {
        const response = await updatePayrollRemarks(id, payload);
        return response.data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const actionPayroll = createAsyncThunk("hr/payrollAction", async ({ id, ...payload }, { rejectWithValue }) => {
    try {
        const response = await payrollAction(id, payload);
        return response.data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchMonthlyAttendance = createAsyncThunk("hr/getMonthlyAttendance", async (data, { rejectWithValue }) => {
    try {
        const response = await getMonthlyAttendance(data);
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

        builder
            .addCase(fetchAdvanceSalaries.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchAdvanceSalaries.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchAdvanceSalaries.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(fetchEmployeeTransfers.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchEmployeeTransfers.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchEmployeeTransfers.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(fetchDesignations.pending, (state) => {
                state.designationLoading = true
            })
            .addCase(fetchDesignations.fulfilled, (state, { payload }) => {
                state.designationLoading = false;
                state.designations = payload.data;
            })
            .addCase(fetchDesignations.rejected, (state) => {
                state.designationLoading = false
            });

        builder.addCase(addDesignation.fulfilled, (state, { payload }) => {
            state.designations.push(payload.data);
        });

        builder
            .addCase(fetchHirings.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchHirings.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchHirings.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(fetchTPMs.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchTPMs.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchTPMs.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(fetchIncentives.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchIncentives.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchIncentives.rejected, (state) => {
                state.loading = false
            });

        builder
            .addCase(fetchPayrolls.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchPayrolls.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchPayrolls.rejected, (state) => {
                state.loading = false
            });

        builder.addCase(editPayrollRemarks.fulfilled, (state, { payload }) => {
            const payrollIndex = state.data.findIndex((payroll) => payroll._id === payload._id);
            if (payrollIndex !== -1) {
                state.data[payrollIndex] = {
                    ...state.data[payrollIndex],
                    ...payload,
                };
            }
        });

        builder.addCase(actionPayroll.fulfilled, (state, { payload }) => {
            const index = state.data.findIndex((item) => item._id === payload._id);
            if (index !== -1) {
                state.data[index] = {
                    ...state.data[index],
                    ...payload,
                };
            }
        });

        builder
            .addCase(fetchMonthlyAttendance.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchMonthlyAttendance.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.data = payload.data;
                state.pagination = payload.pagination;
            })
            .addCase(fetchMonthlyAttendance.rejected, (state) => {
                state.loading = false
            });
    }
});

export default hrSlice.reducer;