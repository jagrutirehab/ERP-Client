import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAlertsByPatient,
  getClinicalTestSummary,
  getNurseAssignedPatients,
  getPatientOverview,
  getPatientPrescription,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  loading: false,
  testLoading: false,
  modalLoading:false,
  data: [],
  profile: null,
  vitals: null,
  prescription: null,
  testSummary: [],
  alertModal: false,
  alertData: [],
  notesModal: false,
  notesData: [],
};

export const allNurseAssignedPatients = createAsyncThunk(
  "nurse/AssignedPatients",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getNurseAssignedPatients(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const getPatientOverviewById = createAsyncThunk(
  "nurse/getPatientOverview",
  async (patientId, { dispatch, rejectWithValue }) => {
    try {
      const response = await getPatientOverview(patientId);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch patient overview");
    }
  }
);

export const getPatientPrescriptionById = createAsyncThunk(
  "nurse/getPatientPrescription",
  async (patientId, { dispatch, rejectWithValue }) => {
    try {
      const response = await getPatientPrescription(patientId);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch patient prescriptions");
    }
  }
);

export const getClinicalTestSummaryById = createAsyncThunk(
  "nurse/getClinicalTestSummary",
  async (patientId, { dispatch, rejectWithValue }) => {
    try {
      const response = await getClinicalTestSummary(patientId);
      return response;
    } catch (error) {
      console.log(error);
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch patient clinical test summary");
    }
  }
);

export const getAlertsByPatientId = createAsyncThunk(
  "nurse/getAlertsByPatient",
  async (patientId, { dispatch, rejectWithValue }) => {
    try {
      const response = await getAlertsByPatient(patientId);
      return response;
    } catch (error) {
      console.log(error);
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch patient alerts");
    }
  }
);

export const NurseSlice = createSlice({
  name: "nurse",
  initialState,
  reducers: {
    setAlertModal: (state) => {
      state.alertModal = !state.alertModal;
    },
    setNotesModal: (state) => {
      state.notesModal = !state.notesModal;
    },
    setAlertData: (state, { payload }) => {
      state.alertData = payload;
    },
    setNotesData: (state, { payload }) => {
      state.notesData = payload;
    },
    clearData: (state) => {
      state.patient = null;
      state.testSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(allNurseAssignedPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(allNurseAssignedPatients.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload;
      })
      .addCase(allNurseAssignedPatients.rejected, (state) => {
        state.loading = false;
      });
    builder
      .addCase(getPatientOverviewById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPatientOverviewById.fulfilled, (state, { payload }) => {
        state.vitals = payload.payload.vitalSign;
        state.profile = {
          ...payload.payload.patient,
          doctorName: payload.payload.doctorName,
          psychologistName: payload.payload.psychologistName,
        };
        state.loading = false;
      })
      .addCase(getPatientOverviewById.rejected, (state) => {
        state.loading = false;
      });
    builder
      .addCase(getPatientPrescriptionById.pending, (state) => {
        state.testLoading = true;
      })
      .addCase(getPatientPrescriptionById.fulfilled, (state, { payload }) => {
        state.prescription = payload.payload;
        state.testLoading = false;
      })
      .addCase(getPatientPrescriptionById.rejected, (state) => {
        state.testLoading = false;
      });
    builder
      .addCase(getClinicalTestSummaryById.pending, (state) => {
        state.testLoading = true;
      })
      .addCase(getClinicalTestSummaryById.fulfilled, (state, { payload }) => {
        state.testSummary = payload.data;
        state.testLoading = false;
      })
      .addCase(getClinicalTestSummaryById.rejected, (state) => {
        state.testLoading = false;
      });
    builder
      .addCase(getAlertsByPatientId.pending, (state) => {
        state.modalLoading = true;
      })
      .addCase(getAlertsByPatientId.fulfilled, (state, { payload }) => {
        state.alertData = payload.data;
        state.modalLoading = false;
      })
      .addCase(getAlertsByPatientId.rejected, (state) => {
        state.modalLoading = false;
      });
  },
});

export const {
  setNotesModal,
  setAlertModal,
  setAlertData,
  setNotesData,
  clearData,
} = NurseSlice.actions;
export default NurseSlice.reducer;
