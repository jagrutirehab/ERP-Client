import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  assignNurseToPatient,
  createNote,
  getAlertsByPatient,
  getClinicalTestSummary,
  getCompletedActiveMedicines,
  getNextDayMedicineBoxFillingMedicines,
  getNotesByPatient,
  getNurseAssignedPatients,
  getNursesListByPatientCenter,
  getPatientDetails,
  getPatientOverview,
  getPatientPrescription,
  getPendingActiveMedicines,
  markMedicineAsGiven,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  loading: false,
  testLoading: false,
  modalLoading: false,
  notesLoading: false,
  medicineLoading: false,
  medicines: {
    pending: [],
    completed: [],
    nextDay: [],
  },
  searchMode:false,
  pagination: null,
  data: [],
  profile: null,
  vitals: null,
  prescription: null,
  testSummary: [],
  alertModal: false,
  alertData: [],
  notesModal: false,
  notesData: [],
  patientIds: [],
  index:0,
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

export const getPatientDetailsById = createAsyncThunk(
  "nurse/getPatientDetails",
  async (patientId, { dispatch, rejectWithValue }) => {
    try {
      const response = await getPatientDetails(patientId);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch patient details");
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

export const getNotesByPatientId = createAsyncThunk(
  "nurse/getNotesByPatient",
  async (patientId, { dispatch, rejectWithValue }) => {
    try {
      const response = await getNotesByPatient(patientId);
      return response;
    } catch (error) {
      console.log(error);
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch patient notes");
    }
  }
);

export const getNursesListByPatient = createAsyncThunk(
  "nurse/getNursesListByPatientCenter",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getNursesListByPatientCenter(data);
      return response;
    } catch (error) {
      console.log(error);
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch nurse list");
    }
  }
);

export const addNotes = createAsyncThunk(
  "nurse/createNote",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await createNote(data);
      return response;
    } catch (error) {
      console.log(error);
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to create patient notes");
    }
  }
);

export const getRemainigActiveMedicines = createAsyncThunk(
  "nurse/getPendingActiveMedicines",
  async (patientId, { dispatch, rejectWithValue }) => {
    try {
      const response = await getPendingActiveMedicines(patientId);
      return response;
    } catch (error) {
      console.log(error);
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch pending active medicines");
    }
  }
);

export const getTodayCompletedActiveMedicines = createAsyncThunk(
  "nurse/getCompletedActiveMedicines",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getCompletedActiveMedicines(data);
      return response;
    } catch (error) {
      console.log(error);
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch completed active medicines");
    }
  }
);

export const markPendingMedicineAsGiven = createAsyncThunk(
  "nurse/markMedicineAsGiven",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await markMedicineAsGiven(data);
      return response;
    } catch (error) {
      console.log(error);
      return rejectWithValue("Failed to mark medicine as given");
    }
  }
);

export const getNextDayMedicineBoxFillingActivities = createAsyncThunk(
  "nurse/getNextDayMedicineBoxFillingMedicines",
  async (patientId, { dispatch, rejectWithValue }) => {
    try {
      const response = await getNextDayMedicineBoxFillingMedicines(patientId);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(
        "Failed to fetch next day medicine box filling medicine activities"
      );
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
    setPatientIds: (state, { payload }) => {
      state.patientIds = payload;
    },
    setIndex:(state,{payload})=>{
      state.index = payload;
    },
    setSearchMode:(state, { payload })=>{
      state.searchMode = payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(allNurseAssignedPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(allNurseAssignedPatients.fulfilled, (state, { payload }) => {
        state.loading = false;
        // const updatedData = [...state.data, ...payload.data];
        // const unique = Array.from(
        //   new Map(updatedData.map((p) => [p._id, p])).values()
        // );
        // state.data = unique;
        // state.pagination = {
        //   ...state.pagination,
        //   page: payload.pagination.page,
        //   limit: payload.pagination.limit,
        //   totalDocs: payload.pagination.totalDocs,
        //   totalPages: payload.pagination.totalPages,
        // };
        // localStorage.setItem(
        //   "nursePatients",
        //   JSON.stringify({
        //     data: unique,
        //     pagination: state.pagination,
        //   })
        // );
        state.data = payload;
        const newIds = payload.data.map((p) => p._id);

        if (state.searchMode) {
          state.patientIds = newIds;
        } else {
          const updatedPatients = Array.from(
            new Set([...state.patientIds, ...newIds])
          );
          state.patientIds = updatedPatients;
        }
        localStorage.setItem("nursePatients", JSON.stringify(state.patientIds));
      })
      .addCase(allNurseAssignedPatients.rejected, (state) => {
        state.loading = false;
      });
    builder
      .addCase(getPatientDetailsById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPatientDetailsById.fulfilled, (state, { payload }) => {
        state.profile = payload.payload;
        state.loading = false;
      })
      .addCase(getPatientDetailsById.rejected, (state) => {
        state.loading = false;
    });
    builder
      .addCase(getPatientOverviewById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPatientOverviewById.fulfilled, (state, { payload }) => {
        state.vitals = payload.payload;
        // state.profile = {
        //   ...payload.payload.patient,
        //   doctorName: payload.payload.doctorName,
        //   psychologistName: payload.payload.psychologistName,
        //   doctorNumber:payload.payload.doctorNumber
        // };
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
    builder
      .addCase(getNotesByPatientId.pending, (state) => {
        state.notesLoading = true;
      })
      .addCase(getNotesByPatientId.fulfilled, (state, { payload }) => {
        state.notesData = payload.data;
        state.notesLoading = false;
      })
      .addCase(getNotesByPatientId.rejected, (state) => {
        state.notesLoading = false;
      });
    builder
      .addCase(addNotes.pending, (state) => {
        state.notesLoading = true;
      })
      .addCase(addNotes.fulfilled, (state, { payload }) => {
        state.notesData.unshift(payload.data);
        state.notesLoading = false;
      })
      .addCase(addNotes.rejected, (state) => {
        state.notesLoading = false;
      });
    builder
      .addCase(getNursesListByPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNursesListByPatient.fulfilled, (state, { payload }) => {
        state.data = payload.data;
        state.loading = false;
      })
      .addCase(getNursesListByPatient.rejected, (state) => {
        state.loading = false;
      });
    builder
      .addCase(getRemainigActiveMedicines.pending, (state) => {
        state.medicineLoading = true;
      })
      .addCase(getRemainigActiveMedicines.fulfilled, (state, { payload }) => {
        state.medicines.pending = payload.data;
        state.medicineLoading = false;
      })
      .addCase(getRemainigActiveMedicines.rejected, (state) => {
        state.medicineLoading = false;
      });
    builder
      .addCase(getTodayCompletedActiveMedicines.pending, (state) => {
        state.medicineLoading = true;
      })
      .addCase(
        getTodayCompletedActiveMedicines.fulfilled,
        (state, { payload }) => {
          state.medicines.completed = payload.data;
          state.medicineLoading = false;
        }
      )
      .addCase(getTodayCompletedActiveMedicines.rejected, (state) => {
        state.medicineLoading = false;
      });
    builder.addCase(
      markPendingMedicineAsGiven.fulfilled,
      (state, { payload }) => {
        state.medicines.pending = state.medicines.pending.filter(
          (medicine) => medicine._id !== payload.data._id
        );
        // state.medicines.completed.unshift(payload);
      }
    );
    builder
      .addCase(getNextDayMedicineBoxFillingActivities.pending, (state) => {
        state.medicineLoading = true;
      })
      .addCase(
        getNextDayMedicineBoxFillingActivities.fulfilled,
        (state, { payload }) => {
          state.medicines.nextDay = payload.data;
          state.medicineLoading = false;
        }
      )
      .addCase(getNextDayMedicineBoxFillingActivities.rejected, (state) => {
        state.medicineLoading = false;
      });
  },
});

export const {
  setNotesModal,
  setAlertModal,
  setAlertData,
  setNotesData,
  clearData,
  setPatients,
  setPatientIds,
  setIndex,
  setSearchMode
} = NurseSlice.actions;
export default NurseSlice.reducer;
