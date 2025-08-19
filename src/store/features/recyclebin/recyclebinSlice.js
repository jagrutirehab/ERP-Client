import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDeletedPatients,
  postRestorePatient,
  deletePatientPermanently,
  getPatientCountedDocuments,
  postRestoreCenter,
  deleteCenterPermanently,
  getDeletedCenters,
  getDeletedLeads,
  deleteLeadPermanently,
  postRestoreLead,
  getDeletedMedicines,
  postRestoreMedicine,
  deleteMedicinePermanently,
  getDeletedCharts,
  postRestoreChart,
  deleteChartPermanently,
  getDeletedBills,
  postRestoreBill,
  deleteBillPermanently,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  //patient
  patients: [],
  patientDocumentsCount: null,
  patientLoading: false,
  //chart
  charts: [],
  //bills
  bills: [],
  //center
  centers: [],
  centerDocumentsCount: null,
  centerLoading: false,
  //lead
  leads: [],
  //medicine
  medicines: [],
  loading: false,
};

/* --------------------------- patient ----------------------------- */
export const getRemovedPatients = createAsyncThunk(
  "getDeletedPatients",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getDeletedPatients(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const countPatientDocuments = createAsyncThunk(
  "getPatientCountedDocuments",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPatientCountedDocuments(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const restorePatient = createAsyncThunk(
  "restorePatient",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postRestorePatient(data);
      dispatch(
        setAlert({ type: "success", message: "Patient Restored Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removePatientPermanently = createAsyncThunk(
  "deletePatientPermanently",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deletePatientPermanently(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Patient Permanently Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);
/* --------------------------- patient ----------------------------- */

/* --------------------------- chart ------------------------------ */
export const getRemovedCharts = createAsyncThunk(
  "getDeletedCharts",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getDeletedCharts(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const restoreChart = createAsyncThunk(
  "restoreChart",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postRestoreChart(data);
      dispatch(
        setAlert({ type: "success", message: "Chart Restored Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeChartPermanently = createAsyncThunk(
  "deleteChartPermanently",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteChartPermanently(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Chart Permanently Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);
/* --------------------------- chart ------------------------------ */

/* --------------------------- bill ------------------------------- */
export const getRemovedBills = createAsyncThunk(
  "getDeletedBills",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getDeletedBills(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const restoreBill = createAsyncThunk(
  "restoreBill",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postRestoreBill(data);
      dispatch(
        setAlert({ type: "success", message: "Bill Restored Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeBillPermanently = createAsyncThunk(
  "deleteBillPermanently",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteBillPermanently(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Bill Permanently Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);
/* --------------------------- bill ------------------------------- */

/* --------------------------- center ----------------------------- */

export const getRemovedCenters = createAsyncThunk(
  "getDeletedCenters",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getDeletedCenters(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const countCenterDocuments = createAsyncThunk(
  "getCenterCountedDocuments",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await data;
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const restoreCenter = createAsyncThunk(
  "restoreCenter",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postRestoreCenter(data);
      dispatch(
        setAlert({ type: "success", message: "Center Restored Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeCenterPermanently = createAsyncThunk(
  "deleteCenterPermanently",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteCenterPermanently(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Center Permanently Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);
/* --------------------------- center ----------------------------- */

/* ---------------------------- lead ------------------------------ */

export const getRemovedLeads = createAsyncThunk(
  "getDeletedLeads",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getDeletedLeads(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const restoreLead = createAsyncThunk(
  "restoreLead",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postRestoreLead(data);
      dispatch(
        setAlert({ type: "success", message: "Lead Restored Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeLeadPermanently = createAsyncThunk(
  "deleteLeadPermanently",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteLeadPermanently(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Lead Permanently Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

/* ---------------------------- lead ------------------------------ */

/* -------------------------- medicine ---------------------------- */

export const getRemovedMedicines = createAsyncThunk(
  "getDeletedMedicines",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getDeletedMedicines(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const restoreMedicine = createAsyncThunk(
  "restoreMedicine",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postRestoreMedicine(data);
      dispatch(
        setAlert({ type: "success", message: "Lead Restored Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeMedicinePermanently = createAsyncThunk(
  "deleteMedicinePermanently",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteMedicinePermanently(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Lead Permanently Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

/* -------------------------- medicine ---------------------------- */

const recyclebinSlice = createSlice({
  name: "Recyclebin",
  initialState,
  reducers: {
    // postMedicine: (state, { payload }) => {
    //   state.data = [...state.data, payload.payload]
    // },
  },
  extraReducers: (builder) => {
    /* --------------------------- patient ----------------------------- */
    builder
      .addCase(getRemovedPatients.pending, (state) => {
        // state.loading = true;
      })
      .addCase(getRemovedPatients.fulfilled, (state, { payload }) => {
        // state.loading = false;
        state.patients = payload?.payload;
      })
      .addCase(getRemovedPatients.rejected, (state) => {
        // state.loading = false;
      });

    builder
      .addCase(countPatientDocuments.pending, (state) => {
        state.patientLoading = true;
      })
      .addCase(countPatientDocuments.fulfilled, (state, { payload }) => {
        state.patientLoading = false;
        state.patientDocumentsCount = payload?.payload;
      })
      .addCase(countPatientDocuments.rejected, (state) => {
        state.patientLoading = false;
      });

    builder
      .addCase(restorePatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(restorePatient.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.patients = state.patients.filter(
          (el) => el._id !== payload?.payload?._id
        );
      })
      .addCase(restorePatient.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removePatientPermanently.pending, (state) => {
        state.loading = true;
      })
      .addCase(removePatientPermanently.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.payload?.length === 1) {
          state.patients = state.patients.filter(
            (el) => el._id !== payload?.payload[0]
          );
        } else state.patients = [];
      })
      .addCase(removePatientPermanently.rejected, (state) => {
        state.loading = false;
      });
    /* --------------------------- patient ----------------------------- */

    /* --------------------------- center ----------------------------- */
    builder
      .addCase(getRemovedCenters.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRemovedCenters.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.centers = payload?.payload;
      })
      .addCase(getRemovedCenters.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(countCenterDocuments.pending, (state) => {
        state.centerLoading = true;
      })
      .addCase(countCenterDocuments.fulfilled, (state, { payload }) => {
        state.centerLoading = false;
        state.centerDocumentsCount = payload?.payload;
      })
      .addCase(countCenterDocuments.rejected, (state) => {
        state.centerLoading = false;
      });

    builder
      .addCase(restoreCenter.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreCenter.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.centers = state.centers.filter(
          (el) => el._id !== payload?.payload?._id
        );
      })
      .addCase(restoreCenter.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeCenterPermanently.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeCenterPermanently.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.centers = state.centers.filter(
          (el) => el._id !== payload?.payload?._id
        );
      })
      .addCase(removeCenterPermanently.rejected, (state) => {
        state.loading = false;
      });
    /* --------------------------- center ----------------------------- */

    /* ---------------------------- lead ------------------------------ */
    builder
      .addCase(getRemovedLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRemovedLeads.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.leads = payload?.payload;
      })
      .addCase(getRemovedLeads.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(restoreLead.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreLead.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.leads = state.leads.filter(
          (el) => el._id !== payload?.payload?._id
        );
      })
      .addCase(restoreLead.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeLeadPermanently.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeLeadPermanently.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.leads = state.leads.filter(
          (el) => el._id !== payload?.payload?._id
        );
      })
      .addCase(removeLeadPermanently.rejected, (state) => {
        state.loading = false;
      });

    /* ---------------------------- lead ------------------------------ */

    /* -------------------------- medicine ---------------------------- */

    builder
      .addCase(getRemovedMedicines.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRemovedMedicines.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.medicines = payload?.payload;
      })
      .addCase(getRemovedMedicines.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(restoreMedicine.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreMedicine.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.medicines = state.medicines.filter(
          (el) => el._id !== payload?.payload?._id
        );
      })
      .addCase(restoreMedicine.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeMedicinePermanently.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeMedicinePermanently.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.medicines = state.medicines.filter(
          (el) => el._id !== payload?.payload?._id
        );
      })
      .addCase(removeMedicinePermanently.rejected, (state) => {
        state.loading = false;
      });

    /* -------------------------- medicine ---------------------------- */

    /* --------------------------- chart ----------------------------- */

    builder
      // .addCase(getRemovedCharts.pending, (state) => {
      //   // state.loading = true;
      // })
      .addCase(getRemovedCharts.fulfilled, (state, { payload }) => {
        // state.loading = false;
        state.charts = payload?.payload;
      })
      // .addCase(getRemovedCharts.rejected, (state) => {
      //   // state.loading = false;
      // });

    builder
      .addCase(restoreChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreChart.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.charts = state.charts.filter(
          (el) => el._id !== payload?.payload?._id
        );
      })
      .addCase(restoreChart.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeChartPermanently.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeChartPermanently.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.payload?.length === 1) {
          state.charts = state.charts.filter(
            (el) => el._id !== payload?.payload[0]
          );
        } else state.charts = [];
      })
      .addCase(removeChartPermanently.rejected, (state) => {
        state.loading = false;
      });

    /* --------------------------- chart ----------------------------- */

    /* ---------------------------- bill ----------------------------- */

    builder
      // .addCase(getRemovedBills.pending, (state) => {
      //   state.loading = true;
      // })
      .addCase(getRemovedBills.fulfilled, (state, { payload }) => {
        // state.loading = false;
        state.bills = payload?.payload;
      })
      // .addCase(getRemovedBills.rejected, (state) => {
      //   state.loading = false;
      // });

    builder
      .addCase(restoreBill.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreBill.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.bills = state.bills.filter(
          (el) => el._id !== payload?.payload?._id
        );
      })
      .addCase(restoreBill.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeBillPermanently.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeBillPermanently.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.payload?.length === 1) {
          state.bills = state.bills.filter(
            (el) => el._id !== payload?.payload[0]
          );
        } else state.bills = [];
      })
      .addCase(removeBillPermanently.rejected, (state) => {
        state.loading = false;
      });

    /* ---------------------------- bill ----------------------------- */
  },
});

export const {} = recyclebinSlice.actions;

export default recyclebinSlice.reducer;
