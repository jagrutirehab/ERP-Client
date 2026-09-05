import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAlert } from "../alert/alertSlice";
import {
  submitAdmissionForm as submitAdmissionFormApi,
  assignNurseToPatient,
  assignPatientType,
  deletePatientAadhaarCard,
  deletePatientPassportCard,
  editPatient,
  getAllPatients,
  getMorePatients,
  getPatientById,
  getPatientId,
  getPatients,
  postAdmitPatient,
  postDischargePatient,
  postPatient,
  postPatientCenterSwitch,
  postUndischargePatient,
  removePatient,
  unAssignNurseToPatient,
  updateAdmissionAssignment,
  updatePatientAdmission,
  getSopOverview,
} from "../../../helpers/backend_helper";
import {
  setChartAdmission,
  updateChartAdmission,
  addAdmissionType,
  updateAdmissionType,
  removeChart,
  setAdmissionTypeDirect,
} from "../chart/chartSlice";
import { setBillAdmission, updateBillAdmission } from "../bill/billSlice";

const initialState = {
  data: [],
  allPatients: [],
  searchedPatients: [],
  phoneNumberPatients: [],
  uidPatient: [],
  patientForm: {
    data: null,
    leadData: null,
    isOpen: false,
  },
  patient: null,
  patientReferrel: [],
  admitDischargePatient: {
    data: null,
    isOpen: "",
  },
  viewProfile: {
    data: null,
    isOpen: false,
  },
  switchCenter: {
    data: null,
    isOpen: false,
  },
  generatedPatientId: {
    value: null,
  },
  searchLoading: false,
  phoneNumberLoading: false,
  patientRefLoading: false,
  nurseLoading: false,
  sopOverview: null,
  sopLoading: false,
};

export const fetchPatients = createAsyncThunk(
  "getPatients",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPatients(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchAllPatients = createAsyncThunk(
  "getAllPatients",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAllPatients();
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchMorePatients = createAsyncThunk(
  "getMorePatients",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getMorePatients(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchPatientId = createAsyncThunk(
  "getPatientId",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPatientId();
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  "getPatientById",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPatientById(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addPatient = createAsyncThunk(
  "postPatient",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postPatient(data);
      dispatch(
        setAlert({ type: "success", message: "Patient Saved Successfully" })
      );

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeAadhaarCard = createAsyncThunk(
  "deletePatientAadhaarCard",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deletePatientAadhaarCard(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Aadhaar Card Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removePassportCard = createAsyncThunk(
  "deletePatientPassportCard",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deletePatientPassportCard(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Passport Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updatePatient = createAsyncThunk(
  "editPatient",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editPatient(data);
      dispatch(
        setAlert({ type: "success", message: "Patient Updated Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const admitIpdPatient = createAsyncThunk(
  "postPatientAddmission",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postAdmitPatient(data);
      dispatch(
        setAlert({ type: "success", message: "Patient Addmitted Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const editAdmission = createAsyncThunk(
  "updatePatientAdmission",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await updatePatientAdmission(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Admission Updated Successfully!",
        })
      );
      dispatch(updateChartAdmission(response.payload));
      dispatch(updateBillAdmission(response.payload));
      dispatch(setPatient(response.patient));

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const editAdmissionAssignment = createAsyncThunk(
  "updateAdmissionAssignment",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateAdmissionAssignment(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Doctor and Psychologist Updated Successfully!",
        })
      );
      dispatch(setChartAdmission(response.payload));
      dispatch(setBillAdmission(response.payload));

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const dischargeIpdPatient = createAsyncThunk(
  "postPatientDischarge",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postDischargePatient(data);
      dispatch(
        setAlert({ type: "success", message: "Patient Discharge Successfully" })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const undischargePatient = createAsyncThunk(
  "postPatientUndischarge",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postUndischargePatient(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Patient Un-Discharged Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updatePatientCenter = createAsyncThunk(
  "postPatientCenterSwitch",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postPatientCenterSwitch(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Patient Center Switched Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const deletePatient = createAsyncThunk(
  "deletePatient",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await removePatient(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Patient Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const assignNurse = createAsyncThunk(
  "assignNurseToPatient",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await assignNurseToPatient(data);
      return response;
    } catch (error) {
      console.log(error);
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to assign nurse");
    }
  }
);

export const unAssignNurse = createAsyncThunk(
  "unAssignNurseToPatient",
  async (patientId, { _, rejectWithValue }) => {
    try {
      const response = await unAssignNurseToPatient(patientId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Admission Form submit.
//
// Owned by this slice rather than fired as a bare axios call from the form
// component: the response carries the admission's refreshed type timeline, and
// the reducer below patches it in place. That keeps the topbar and the summary
// card correct with no refetch of the whole patient — which would be an extra
// round trip for one field and could clobber fresher state mid-flight.
export const submitAdmissionForm = createAsyncThunk(
  "submitAdmissionForm",
  async ({ admissionId, formData }, { dispatch, rejectWithValue }) => {
    try {
      return await submitAdmissionFormApi({ admissionId, formData });
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue(
        error.message || "Failed to submit the admission form",
      );
    }
  },
);

export const assignEmergencyPatientType = createAsyncThunk(
  "assignPatientType",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await assignPatientType(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("Failed to assign patient type");
    }
  }
);

export const fetchSopOverview = createAsyncThunk(
  "patient/fetchSopOverview",
  async ({ admissionId, currentDate }, { rejectWithValue }) => {
    try {
      const response = await getSopOverview(admissionId, currentDate);
      return response;
    } catch (error) {
      return rejectWithValue("Failed to fetch SOP overview");
    }
  }
);


export const patientSlice = createSlice({
  name: "Patient",
  initialState,
  reducers: {
    togglePatientForm: (state, { payload }) => {
      state.patientForm = payload;
    },
    admitDischargePatient: (state, { payload }) => {
      state.admitDischargePatient = payload;
    },
    viewPatient: (state, { payload }) => {
      const findPatientInList = state.data?.find(
        (pt) => pt._id === payload._id
      );
      if (!findPatientInList) state.data = [payload, ...state.data];
      localStorage.setItem("activePatient", JSON.stringify(payload));
      state.patient = payload;
    },
    setPatient: (state, { payload }) => {
      state.patient = payload;
    },
    replacePatient: (state, { payload }) => {
      const findPatientIndex = state.data?.findIndex(
        (pt) => pt._id === payload._id
      );
      state.data[findPatientIndex] = payload;
      state.patient = payload;
    },
    viewProfile: (state, { payload }) => {
      state.viewProfile = payload;
    },
    switchCenter: (state, { payload }) => {
      state.switchCenter = payload;
    },
    searchPatient: (state) => {
      state.searchLoading = true;
    },
    searchPatientSuccess: (state, { payload }) => {
      state.searchLoading = false;
      state.searchedPatients = payload.payload;
    },
    searchPatientFail: (state) => {
      state.searchLoading = false;
    },
    searchPatientPhoneNumber: (state) => {
      state.phoneNumberLoading = true;
    },
    searchPatientPhoneNumberSuccess: (state, { payload }) => {
      state.phoneNumberLoading = false;
      state.phoneNumberPatients = payload.payload;
    },
    searchPatientPhoneNumberFail: (state) => {
      state.phoneNumberLoading = false;
    },
    searchUidPatient: (state) => {
      state.uidLoading = true;
    },
    searchUidPatientSuccess: (state, { payload }) => {
      state.uidLoading = false;
      state.uidPatient = payload.payload;
    },
    searchUidPatientFail: (state) => {
      state.uidLoading = false;
    },
    searchPatientReferral: (state) => {
      state.patientRefLoading = true;
    },
    searchPatientReferralSuccess: (state, { payload }) => {
      state.patientRefLoading = false;
      state.patientReferrel = payload.payload;
    },
    searchPatientReferralFail: (state) => {
      state.patientRefLoading = false;
    },
    setBillingStatus: (state, { payload }) => {
      const patient = state.data.find((p) => p._id === payload.patientId);
      if (patient) {
        patient.billingStatus = payload.billingStatus;
      }
    }
  },
  extraReducers: (builder) => {
    // Admission Type chart writes land in the chart slice, but the header's
    // Admission Type card reads the admission from THIS slice — so the timeline
    // has to be refreshed here too, or the card keeps showing the previous type
    // until the patient is refetched. The three responses carry the fresh array
    // (see controllers/chart/admissionType and chart/delete).
    const syncAdmissionTypeHistory = (state, { payload }) => {
      const history = payload?.admissionTypeHistory;
      if (!Array.isArray(history)) return; // other chart kinds send nothing
      const addmission = state.patient?.addmission;
      if (!addmission) return;
      if (
        payload.addmission &&
        String(addmission._id) !== String(payload.addmission)
      ) {
        return; // response is for a different admission
      }
      addmission.admissionTypeHistory = history;
    };

    // The direct setter returns the array nested under `data`, unlike the chart
    // responses which put it at the top level — normalise before reusing the
    // same patcher.
    const syncAdmissionTypeHistoryFromData = (state, { payload }) =>
      syncAdmissionTypeHistory(state, {
        payload: {
          addmission: payload?.data?._id,
          admissionTypeHistory: payload?.data?.admissionTypeHistory,
        },
      });

    builder
      .addCase(addAdmissionType.fulfilled, syncAdmissionTypeHistory)
      .addCase(updateAdmissionType.fulfilled, syncAdmissionTypeHistory)
      .addCase(removeChart.fulfilled, syncAdmissionTypeHistory)
      .addCase(setAdmissionTypeDirect.fulfilled, syncAdmissionTypeHistoryFromData)
      // Same `data: { _id, admissionTypeHistory }` envelope as the direct setter.
      .addCase(submitAdmissionForm.fulfilled, syncAdmissionTypeHistoryFromData);

    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatients.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(fetchPatients.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.patient = payload.payload;
      })
      .addCase(fetchPatientById.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchAllPatients.pending, (state) => {
        // state.loading = true;
      })
      .addCase(fetchAllPatients.fulfilled, (state, { payload }) => {
        // state.loading = false;
        state.allPatients = payload.payload;
      })
      .addCase(fetchAllPatients.rejected, (state) => {
        // state.loading = false;
      });

    builder
      .addCase(fetchMorePatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMorePatients.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = [...(state.data || []), ...(payload.payload || [])];
      })
      .addCase(fetchMorePatients.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchPatientId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientId.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.generatedPatientId = payload.payload;
      })
      .addCase(fetchPatientId.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPatient.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = [payload.payload, ...state.data];
        state.allPatients = [
          {
            name: payload?.payload?.name,
            phoneNumber: payload?.payload?.phoneNumber,
            gender: payload?.payload?.gender,
            center: payload?.payload?.center,
            id: payload?.payload?.id,
          },
          state.allPatients,
        ];
      })
      .addCase(addPatient.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePatient.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        localStorage.setItem("activePatient", JSON.stringify(payload.payload));
        state.patient = payload.payload;
        state.data[findIndex] = payload.payload;
      })
      .addCase(updatePatient.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updatePatientCenter.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePatientCenter.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload?.payload._id
        );
        state.patient = payload?.payload;
        state.data[findIndex] = payload?.payload;
      })
      .addCase(updatePatientCenter.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeAadhaarCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeAadhaarCard.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.patient = payload.payload;
        state.patientForm.data = payload.payload;
        state.data[findIndex] = payload.payload;
      })
      .addCase(removeAadhaarCard.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removePassportCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(removePassportCard.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.patient = payload.payload;
        state.patientForm.data = payload.payload;
        state.data[findIndex] = payload.payload;
      })
      .addCase(removePassportCard.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(admitIpdPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(admitIpdPatient.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.patient = payload.payload;
        state.data[findIndex] = payload.payload;
      })
      .addCase(admitIpdPatient.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(editAdmission.pending, (state) => {
        state.loading = true;
      })
      .addCase(editAdmission.fulfilled, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(editAdmission.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(editAdmissionAssignment.pending, (state) => {
        state.admissionLoading = true;
      })
      .addCase(editAdmissionAssignment.fulfilled, (state, { payload }) => {
        state.admissionLoading = false;
      })
      .addCase(editAdmissionAssignment.rejected, (state) => {
        state.admissionLoading = false;
      });

    builder
      .addCase(dischargeIpdPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(dischargeIpdPatient.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.data[findIndex] = payload.payload;
        state.patient = payload.payload;
      })
      .addCase(dischargeIpdPatient.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(undischargePatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(undischargePatient.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.data[findIndex] = payload.payload;
        state.patient = payload.payload;
      })
      .addCase(undischargePatient.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePatient.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = state.data.filter((el) => el._id !== payload.payload._id);
        state.patient = null;
      })
      .addCase(deletePatient.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(assignNurse.pending, (state) => {
        state.nurseLoading = true;
      })
      .addCase(assignNurse.fulfilled, (state, { payload }) => {
        state.patient = {
          ...state.patient,
          assignedNurse: payload.payload,
        };
        state.nurseLoading = false;
      })
      .addCase(assignNurse.rejected, (state) => {
        state.nurseLoading = false;
      });

    builder
      .addCase(unAssignNurse.pending, (state) => {
        state.nurseLoading = true;
      })
      .addCase(unAssignNurse.fulfilled, (state, { payload }) => {
        state.patient = {
          ...state.patient,
          assignedNurse: null,
        };
        state.nurseLoading = false;
      })
      .addCase(unAssignNurse.rejected, (state) => {
        state.nurseLoading = false;
      });
    builder.addCase(
      assignEmergencyPatientType.fulfilled,
      (state, { payload }) => {
        state.patient.addmission.patientType =
          payload.data.patientType;
      }
    );

    builder
      .addCase(fetchSopOverview.pending, (state) => {
        state.sopLoading = true;
      })
      .addCase(fetchSopOverview.fulfilled, (state, { payload }) => {
        state.sopLoading = false;
        state.sopOverview = payload;
      })
      .addCase(fetchSopOverview.rejected, (state) => {
        state.sopLoading = false;
      });
  },
});

export const {
  togglePatientForm,
  admitDischargePatient,
  viewPatient,
  replacePatient,
  viewProfile,
  switchCenter,
  searchPatient,
  setPatient,
  searchPatientSuccess,
  searchPatientFail,
  searchPatientPhoneNumber,
  searchPatientPhoneNumberSuccess,
  searchPatientPhoneNumberFail,
  searchUidPatient,
  searchUidPatientSuccess,
  searchUidPatientFail,
  searchPatientReferral,
  searchPatientReferralSuccess,
  searchPatientReferralFail,
  setBillingStatus
} = patientSlice.actions;

export default patientSlice.reducer;
