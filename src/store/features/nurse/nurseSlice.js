import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createNote,
  getActivitiesByStatus,
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
  markAlertAsRead,
  markTomorrowMedicines,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  loading: false,
  testLoading: false,
  modalLoading: false,
  notesLoading: false,
  medicineLoading: false,
  medicines: {
    activities: [],
    nextDay: [],
  },
  searchMode: false,
  patientIdsFromSearch: false,
  pagination: null,
  data: {
    data: [],
    pagination: {},
  },
  profile: null,
  vitals: null,
  prescription: null,
  testSummary: [],
  alertModal: false,
  alertData: [],
  notesModal: false,
  notesData: [],
  patientIds: [],
  index: 0,
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

export const getMedicineActivitiesByStatus = createAsyncThunk(
  "nurse/getActivitiesByStatus",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await getActivitiesByStatus(data);
      return response;
    } catch (error) {
      console.log(error);
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to fetch completed active medicines");
    }
  }
);

export const markTomorrowActivityMedicines = createAsyncThunk(
  "nurse/markTomorrowMedicines",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await markTomorrowMedicines(data);
      return response;
    } catch (error) {
      console.log(error);
      return rejectWithValue("Failed to mark medicine activity");
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
export const markUnreadAlert = createAsyncThunk(
  "nurse/markAlertAsRead",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await markAlertAsRead(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Alert marked as read successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(
        setAlert({
          type: "error",
          message: error.message || "Failed to mark alert as read",
        })
      );
      return rejectWithValue(error.message);
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
    setIndex: (state, { payload }) => {
      state.index = payload;
    },
    setSearchMode: (state, { payload }) => {
      state.searchMode = payload;
    },
    setPatientIdsFromSearch: (state, { payload }) => {
      state.patientIdsFromSearch = payload;
    },
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
          state.patientIdsFromSearch = true;
        } else {
          if (state.patientIdsFromSearch) {
            state.patientIds = [];
            state.patientIdsFromSearch = false;
          }
          state.patientIds = Array.from(
            new Set([...state.patientIds, ...newIds])
          );
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
      .addCase(getMedicineActivitiesByStatus.pending, (state) => {
        state.medicineLoading = true;
      })
      .addCase(
        getMedicineActivitiesByStatus.fulfilled,
        (state, { payload }) => {
          state.medicines.activities = payload.data;
          state.medicineLoading = false;
        }
      )
      .addCase(getMedicineActivitiesByStatus.rejected, (state) => {
        state.medicineLoading = false;
      });
    builder.addCase(
      markTomorrowActivityMedicines.fulfilled,
      (state, { payload }) => {
        const patientIndex = state.data.data.findIndex(
          (patient) => patient._id === payload.data.patient
        );
        state.medicines.nextDay = payload.data;
        state.alertData = state.alertData.filter(
          (alert) => alert.type !== "medicine"
        );
        state.data.data[patientIndex].missedMedsCount =
          payload.data.missedCount;
        state.data.data[patientIndex].medicinesToTakeNow = [];
        state.data.data[patientIndex] = {
          ...state.data.data[patientIndex],
          alertCount: payload.data.allCompleted
            ? state.data.data[patientIndex].alertCount - 1
            : state.data.data[patientIndex].alertCount,
          // flag:
          //   state.data.data[patientIndex].flag === "urgent" &&
          //   state.data.data[patientIndex].alertCount > 1
          //     ? "attention"
          //     : "stable",
          flag: payload.data.allCompleted
            ? state.data.data[patientIndex].alertCount > 1
              ? "attention"
              : "stable"
            : state.data.data[patientIndex].flag,
        };
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
    builder.addCase(markUnreadAlert.fulfilled, (state, { payload }) => {
      // const alertIndex = state.alertData.findIndex(
      //   (alert) => alert._id === payload.data._id
      // );

      // if (alertIndex !== -1) {
      //   state.alertData[alertIndex] = {
      //     ...state.alertData[alertIndex],
      //     read: true,
      //   };
      // }
      state.alertData = state.alertData.filter(
        (alert) => alert.type !== payload.data.type
      );

      if (state.data.data.length > 0) {
        const patientIndex = state.data.data.findIndex(
          (patient) => patient._id === payload.data.patientId
        );

        if (patientIndex !== -1) {
          state.data.data[patientIndex] = {
            ...state.data.data[patientIndex],
            ...(payload.data.type === "prescription-update" && {
              isPrescriptionUpdated: false,
            }),
            alertCount: Math.max(
              0,
              (state.data.data[patientIndex]?.alertCount || 1) - 1
            ),
          };
        }
      }
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
  setSearchMode,
  setPatientIdsFromSearch,
} = NurseSlice.actions;
export default NurseSlice.reducer;
