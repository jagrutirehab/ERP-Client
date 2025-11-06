import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deleteChart,
  deleteClinicalNoteFile,
  deleteCounsellingNoteFile,
  deleteDetailAdmissionFile,
  deleteLabReportFile,
  editClinicalNote,
  editCounsellingNote,
  editDetailAdmission,
  editDischargeSummary,
  editLabReport,
  editPrescription,
  editRealtiveVisit,
  editVitalSign,
  getCharts,
  getChartsAddmissions,
  getCounsellingNote,
  getGeneralCharts,
  getLatestCharts,
  getOPDPrescription,
  postClinicalNote,
  postCounsellingNote,
  postDetailAdmission,
  postDischargeSummary,
  postGeneralCounsellingNote,
  postGeneralDetailAdmission,
  postGeneralLabReport,
  postGeneralPrescription,
  postGeneralRealtiveVisit,
  postGeneralVitalSign,
  postLabReport,
  postPrescription,
  postRealtiveVisit,
  postVitalSign,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";
import { IPD, OPD } from "../../../Components/constants/patient";
import { togglePrint } from "../print/printSlice";
import { removeEventChart, setEventChart } from "../booking/bookingSlice";
import { replacePatient, setMedicines, viewPatient } from "../../actions";

const initialState = {
  data: [],
  opdData: [],
  charts: [],
  chartForm: {
    data: null,
    chart: null,
    isOpen: false,
  },
  patientLatestOPDPrescription: null,
  chartDate: null,
  chartLoading: false,
  generalChartLoading: false,
  loading: false,
};

export const fetchChartsAddmissions = createAsyncThunk(
  "getChartsAddmissions",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getChartsAddmissions(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchCharts = createAsyncThunk(
  "getCharts",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getCharts(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchLatestCharts = createAsyncThunk(
  "getLatestCharts",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getLatestCharts(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchGeneralCharts = createAsyncThunk(
  "getGeneralCharts",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getGeneralCharts(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchOPDPrescription = createAsyncThunk(
  "getOPDPrescription",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getOPDPrescription(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchCounsellingNote = createAsyncThunk(
  "getCounsellingNote",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getCounsellingNote(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addPrescription = createAsyncThunk(
  "postPrescription",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postPrescription(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Prescription Saved Successfully",
        })
      );
      const payload = response?.payload;
      const patient = response?.patient;
      const appointment = response?.appointment;
      const doctor = response?.doctor;
      if (data?.type === OPD) {
        dispatch(setEventChart({ chart: payload, appointment, patient }));
        dispatch(viewPatient(patient));
        dispatch(togglePrint({ modal: true, data: payload, patient, doctor }));
      }
      if (response.medicines?.length)
        localStorage.setItem("medicines", JSON.stringify(response.medicines));
      dispatch(setMedicines(response.medicines));
      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addGeneralPrescription = createAsyncThunk(
  "postGeneralPrescription",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postGeneralPrescription(data);
      dispatch(
        setAlert({
          type: "success",
          message: "General Prescription Saved Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updatePrescription = createAsyncThunk(
  "editPrescription",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editPrescription(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Prescription Updated Successfully",
        })
      );

      const payload = response?.payload;
      const patient = response?.patient;
      const appointment = response.appointment;
      if (payload.type === OPD) {
        dispatch(
          setEventChart({
            chart: payload,
            appointment,
            patient: response.patient,
          })
        );
        dispatch(viewPatient(patient));
        if (data.shouldPrintAfterSave)
          dispatch(
            togglePrint({
              modal: true,
              data: payload,
              doctor: data.doctor,
              patient: response.patient,
            })
          );
      }

      if (response.medicines?.length)
        localStorage.setItem("medicines", JSON.stringify(response.medicines));
      dispatch(setMedicines(response.medicines));

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addVitalSign = createAsyncThunk(
  "postVitalSign",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postVitalSign(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Vital Sign Saved Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addGeneralVitalSign = createAsyncThunk(
  "postGeneralVitalSign",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postGeneralVitalSign(data);
      dispatch(
        setAlert({
          type: "success",
          message: "General Vital Sign Saved Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateVitalSign = createAsyncThunk(
  "editVitalSign",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editVitalSign(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Vital Sign Updated Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addClinicalNote = createAsyncThunk(
  "postClinicalNote",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postClinicalNote(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Clinical Note Saved Successfully",
        })
      );

      //FOR OPD PRESCRIPTION
      const payload = response?.payload;
      const patient = response?.patient;
      const appointment = response?.appointment;
      const doctor = response?.doctor;
      if (payload?.type === OPD) {
        dispatch(setEventChart({ chart: payload, appointment, patient }));
        // dispatch(viewPatient(patient));
        dispatch(togglePrint({ modal: true, data: payload, patient, doctor }));
      }

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addGeneralClinicalNote = createAsyncThunk(
  "postGeneralClinicalNote",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postClinicalNote(data);
      dispatch(
        setAlert({
          type: "success",
          message: "General Clinical Note Saved Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeClinicalNoteFile = createAsyncThunk(
  "deleteClinicalNoteFile",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteClinicalNoteFile(data);
      dispatch(
        setAlert({
          type: "success",
          message: "File Deleted Successfully",
        })
      );
      const payload = response?.payload;
      // const patient = response?.patient;
      const appointment = response?.appointment;
      if (payload.type === OPD) {
        dispatch(
          setEventChart({
            chart: payload,
            appointment,
            patient: response.patient,
          })
        );
        // dispatch(viewPatient(patient));
        // if (data.shouldPrintAfterSave)
        //   dispatch(
        //     togglePrint({
        //       modal: true,
        //       data: payload,
        //       doctor: data.doctor,
        //       patient: response.patient,
        //     })
        //   );
      }

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateClinicalNote = createAsyncThunk(
  "editClinicalNote",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editClinicalNote(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Clinical Note Updated Successfully",
        })
      );

      const payload = response?.payload;
      // const patient = response?.patient;
      const appointment = response?.appointment;
      if (payload.type === OPD) {
        dispatch(
          setEventChart({
            chart: payload,
            appointment,
            patient: response.patient,
          })
        );
        // dispatch(viewPatient(patient));
        if (response.shouldPrintAfterSave)
          dispatch(
            togglePrint({
              modal: true,
              data: payload,
              doctor: response.doctor,
              patient: response.patient,
            })
          );
      }

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addCounsellingNote = createAsyncThunk(
  "postCounsellingNote",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postCounsellingNote(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Counselling Note Saved Successfully",
        })
      );
      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addGeneralCounsellingNote = createAsyncThunk(
  "postGeneralCounsellingNote",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postGeneralCounsellingNote(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Counselling Note Saved Successfully",
        })
      );
      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateCounsellingNote = createAsyncThunk(
  "editCounsellingNote",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editCounsellingNote(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Counselling Note Updated Successfully",
        })
      );
      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeCounsellingNoteFile = createAsyncThunk(
  "deleteCounsellingNoteFile",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteCounsellingNoteFile(data);
      dispatch(
        setAlert({
          type: "success",
          message: "File Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addLabReport = createAsyncThunk(
  "postLabReport",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postLabReport(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Lab Report Saved Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addGeneralLabReport = createAsyncThunk(
  "postGeneralLabReport",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postGeneralLabReport(data);
      dispatch(
        setAlert({
          type: "success",
          message: "General Lab Report Saved Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeLabReportFile = createAsyncThunk(
  "deleteLabReportFile",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteLabReportFile(data);
      dispatch(
        setAlert({
          type: "success",
          message: "File Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateLabReport = createAsyncThunk(
  "editLabReport",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editLabReport(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Lab Report Updated Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addRelativeVisit = createAsyncThunk(
  "postRelativeVisit",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postRealtiveVisit(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Relative Visit Chart Saved Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addGeneralRelativeVisit = createAsyncThunk(
  "postGeneralRelativeVisit",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postGeneralRealtiveVisit(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Relative Visit Chart Saved Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateRelativeVisit = createAsyncThunk(
  "editRelativeVisit",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editRealtiveVisit(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Relative Visit Chart Updated Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addDischargeSummary = createAsyncThunk(
  "postDischargeSummary",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postDischargeSummary(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Discharge Summary Saved Successfully",
        })
      );

      if (response.medicines?.length)
        localStorage.setItem("medicines", JSON.stringify(response.medicines));
      dispatch(setMedicines(response.medicines));

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateDischargeSummary = createAsyncThunk(
  "editDischargeSummary",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editDischargeSummary(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Discharge Summary Updated Successfully",
        })
      );

      if (response.medicines?.length)
        localStorage.setItem("medicines", JSON.stringify(response.medicines));
      dispatch(setMedicines(response.medicines));

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addDetailAdmission = createAsyncThunk(
  "postDetailAdmission",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postDetailAdmission(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Detail Admission Saved Successfully",
        })
      );

      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addGeneralDetailAdmission = createAsyncThunk(
  "postGeneralDetailAdmission",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postGeneralDetailAdmission(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Detail Admission Saved Successfully",
        })
      );
      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeDetailAdissionFile = createAsyncThunk(
  "deleteDetailAdmissionFile",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteDetailAdmissionFile(data);
      dispatch(
        setAlert({
          type: "success",
          message: "File Deleted Successfully",
        })
      );

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateDetailAdmission = createAsyncThunk(
  "editDetailAdmission",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editDetailAdmission(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Detail Admission Updated Successfully",
        })
      );
      dispatch(createEditChart({ data: null, chart: null, isOpen: false }));

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeChart = createAsyncThunk(
  "deleteChart",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteChart(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Chart Deleted Successfully",
        })
      );

      if (response.payload?.type === OPD) {
        dispatch(removeEventChart(response.payload));
      }

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const chartSlice = createSlice({
  name: "Chart",
  initialState,
  reducers: {
    updateChartAdmission: (state, { payload }) => {
      const index = state.data?.findIndex((d) => d._id === payload._id);

      if (index >= 0) {
        state.data[index]["addmissionDate"] = payload.addmissionDate;
        state.data[index]["dischargeDate"] = payload.dischargeDate;
      }
    },
    createEditChart: (state, { payload }) => {
      state.chartForm = payload;
    },
    setChartDate: (state, { payload }) => {
      state.chartDate = payload;
    },
    setChartAdmission: (state, { payload }) => {
      const index = state.data?.findIndex((d) => d._id === payload._id);
      state.data[index] = payload;
    },
    // resetChartForm: (state, { payload }) => {
    //   payload.validation.resetForm();
    // },
    resetOpdPatientCharts: (state) => {
      state.data = [];
    },
    setPtLatestOPDPrescription: (state, { payload }) => {
      state.patientLatestOPDPrescription = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChartsAddmissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChartsAddmissions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(fetchChartsAddmissions.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchOPDPrescription.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOPDPrescription.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.patientLatestOPDPrescription = payload.payload;
      })
      .addCase(fetchOPDPrescription.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchCounsellingNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCounsellingNote.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.patientLatestCounsellingNote = payload.payload;
      })
      .addCase(fetchCounsellingNote.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchCharts.pending, (state) => {
        state.chartLoading = true;
      })
      .addCase(fetchCharts.fulfilled, (state, { payload }) => {
        state.chartLoading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.addmission
        );
        state.data[findIndex] = {
          charts: payload.payload,
          ...state.data[findIndex],
        };
      })
      .addCase(fetchCharts.rejected, (state) => {
        state.chartLoading = false;
      });
      
      builder
      .addCase(fetchLatestCharts.pending, (state) => {
        state.generalChartLoading = true;
      })
      .addCase(fetchLatestCharts.fulfilled, (state, { payload }) => {
        state.generalChartLoading = false;
        state.charts = payload.payload;
      })
      .addCase(fetchLatestCharts.rejected, (state) => {
        state.generalChartLoading = false;
      });

    builder
      .addCase(fetchLatestCharts.pending, (state) => {
        state.generalChartLoading = true;
      })
      .addCase(fetchLatestCharts.fulfilled, (state, { payload }) => {
        state.generalChartLoading = false;
        state.charts = payload.payload;
      })
      .addCase(fetchLatestCharts.rejected, (state) => {
        state.generalChartLoading = false;
      });

    builder
      .addCase(fetchGeneralCharts.pending, (state) => {
        state.generalChartLoading = true;
      })
      .addCase(fetchGeneralCharts.fulfilled, (state, { payload }) => {
        state.generalChartLoading = false;
        state.charts = payload.payload;
      })
      .addCase(fetchGeneralCharts.rejected, (state) => {
        state.generalChartLoading = false;
      });

    builder
      .addCase(addPrescription.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPrescription.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload?.payload?.type === OPD) {
          //OPD CHARTS
          state.opdData = [payload.payload, ...state.opdData];
        } else {
          //IPD CHARTS
          if (payload.isAddmissionAvailable) {
            const findIndex = state.data.findIndex(
              (el) => el._id === payload.addmission
            );
            state.data[findIndex].totalCharts += 1;
            state.data[findIndex].charts = [
              payload.payload,
              ...(state.data[findIndex].charts || []),
            ];
          } else {
            state.data = [...payload.payload, ...state.data];
          }
        }
      })
      .addCase(addPrescription.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addGeneralPrescription.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGeneralPrescription.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.charts = [payload.payload, ...(state.charts || [])];
      })
      .addCase(addGeneralPrescription.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addGeneralCounsellingNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGeneralCounsellingNote.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.charts = [payload.payload, ...(state.charts || [])];
      })
      .addCase(addGeneralCounsellingNote.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updatePrescription.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePrescription.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.type === "GENERAL") {
          const findIndex = state.charts.findIndex(
            (el) => el._id === payload.payload._id
          );
          state.charts[findIndex] = payload.payload;
        } else if (payload.type !== "OPD") {
          //IPD CHARTS
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          const findChartIndex = state.data[findIndex].charts.findIndex(
            (chart) => chart._id === payload.payload._id
          );
          state.data[findIndex].charts[findChartIndex] = payload.payload;
        }
      })
      .addCase(updatePrescription.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addVitalSign.pending, (state) => {
        state.loading = true;
      })
      .addCase(addVitalSign.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.isAddmissionAvailable) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          state.data[findIndex].totalCharts += 1;
          state.data[findIndex].charts = [
            payload.payload,
            ...(state.data[findIndex].charts || []),
          ];
        } else {
          state.data = [...payload.payload, ...state.data];
        }
      })
      .addCase(addVitalSign.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addGeneralVitalSign.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGeneralVitalSign.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.charts = [payload.payload, ...(state.charts || [])];
      })
      .addCase(addGeneralVitalSign.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateVitalSign.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateVitalSign.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.type === "GENERAL") {
          const findIndex = state.charts.findIndex(
            (el) => el._id === payload.payload._id
          );
          state.charts[findIndex] = payload.payload;
        } else {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          const findChartIndex = state.data[findIndex].charts.findIndex(
            (chart) => chart._id === payload.payload._id
          );
          state.data[findIndex].charts[findChartIndex] = payload.payload;
        }
      })
      .addCase(updateVitalSign.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addClinicalNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(addClinicalNote.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload?.payload?.type === OPD) {
          //OPD CHARTS
          state.opdData = [payload.payload, ...state.opdData];
        } else {
          //IPD CHARTS

          if (payload.isAddmissionAvailable) {
            const findIndex = state.data.findIndex(
              (el) => el._id === payload.addmission
            );
            state.data[findIndex].totalCharts += 1;
            state.data[findIndex].charts = [
              payload.payload,
              ...(state.data[findIndex].charts || []),
            ];
          } else {
            state.data = [...payload.payload, ...state.data];
          }
        }
      })
      .addCase(addClinicalNote.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addGeneralClinicalNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGeneralClinicalNote.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.charts = [payload.payload, ...(state.charts || [])];
      })
      .addCase(addGeneralClinicalNote.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeClinicalNoteFile.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeClinicalNoteFile.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.type === "GENERAL") {
          const findIndex = state.charts.findIndex(
            (el) => el._id === payload.payload._id
          );
          state.charts[findIndex] = payload.payload;
          state.chartForm.data = payload.payload;
        } else if (payload?.payload?.type === OPD) {
          //OPD CHARTS
          state.chartForm.data = payload.payload;
        } else {
          //IPD CHARTS
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          const findChartIndex = state.data[findIndex].charts.findIndex(
            (chart) => chart._id === payload.payload._id
          );
          state.data[findIndex].charts[findChartIndex] = payload.payload;
          state.chartForm.data = payload.payload;
        }
      })
      .addCase(removeClinicalNoteFile.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateClinicalNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateClinicalNote.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload.type === "GENERAL") {
          const findIndex = state.charts.findIndex(
            (el) => el._id === payload.payload._id
          );
          state.charts[findIndex] = payload.payload;
        } else if (payload.type !== "OPD") {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          const findChartIndex = state.data[findIndex].charts.findIndex(
            (chart) => chart._id === payload.payload._id
          );
          state.data[findIndex].charts[findChartIndex] = payload.payload;
        }
      })
      .addCase(updateClinicalNote.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addCounsellingNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCounsellingNote.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.isAddmissionAvailable) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          state.data[findIndex].totalCharts += 1;
          state.data[findIndex].charts = [
            payload.payload,
            ...(state.data[findIndex].charts || []),
          ];
        } else {
          state.data = [...payload.payload, ...state.data];
        }
      })
      .addCase(addCounsellingNote.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateCounsellingNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCounsellingNote.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload.addmission
        );
        const findChartIndex = state.data[findIndex].charts.findIndex(
          (chart) => chart._id === payload.payload._id
        );
        state.data[findIndex].charts[findChartIndex] = payload.payload;
      })
      .addCase(updateCounsellingNote.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeCounsellingNoteFile.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeCounsellingNoteFile.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload.addmission
        );
        const findChartIndex = state.data[findIndex].charts.findIndex(
          (chart) => chart._id === payload.payload._id
        );
        state.data[findIndex].charts[findChartIndex] = payload.payload;
        state.chartForm.data = payload.payload;
      })
      .addCase(removeCounsellingNoteFile.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addLabReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(addLabReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.isAddmissionAvailable) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          state.data[findIndex].totalCharts += 1;
          state.data[findIndex].charts = [
            payload.payload,
            ...(state.data[findIndex].charts || []),
          ];
        } else {
          state.data = [...payload.payload, ...state.data];
        }
      })
      .addCase(addLabReport.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addGeneralLabReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGeneralLabReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.charts = [payload.payload, ...(state.charts || [])];
      })
      .addCase(addGeneralLabReport.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeLabReportFile.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeLabReportFile.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.type === "GENERAL") {
          const findIndex = state.charts.findIndex(
            (el) => el._id === payload.payload._id
          );
          state.charts[findIndex] = payload.payload;
          state.chartForm.data = payload.payload;
        } else {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          const findChartIndex = state.data[findIndex].charts.findIndex(
            (chart) => chart._id === payload.payload._id
          );
          state.data[findIndex].charts[findChartIndex] = payload.payload;
          state.chartForm.data = payload.payload;
        }
      })
      .addCase(removeLabReportFile.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateLabReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateLabReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.type === "GENERAL") {
          const findIndex = state.charts.findIndex(
            (el) => el._id === payload.payload._id
          );
          state.charts[findIndex] = payload.payload;
        } else {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          const findChartIndex = state.data[findIndex].charts.findIndex(
            (chart) => chart._id === payload.payload._id
          );
          state.data[findIndex].charts[findChartIndex] = payload.payload;
        }
      })
      .addCase(updateLabReport.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addRelativeVisit.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRelativeVisit.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.isAddmissionAvailable) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          state.data[findIndex].totalCharts += 1;
          state.data[findIndex].charts = [
            payload.payload,
            ...(state.data[findIndex].charts || []),
          ];
        } else {
          state.data = [...payload.payload, ...state.data];
        }
      })
      .addCase(addRelativeVisit.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addGeneralRelativeVisit.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGeneralRelativeVisit.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.charts = [payload.payload, ...(state.charts || [])];
      })
      .addCase(addGeneralRelativeVisit.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateRelativeVisit.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRelativeVisit.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.type === "GENERAL") {
          const findIndex = state.charts.findIndex(
            (el) => el._id === payload.payload._id
          );
          state.charts[findIndex] = payload.payload;
        } else {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          const findChartIndex = state.data[findIndex].charts.findIndex(
            (chart) => chart._id === payload.payload._id
          );
          state.data[findIndex].charts[findChartIndex] = payload.payload;
        }
      })
      .addCase(updateRelativeVisit.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addDischargeSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDischargeSummary.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.isAddmissionAvailable) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          state.data[findIndex].totalCharts += 1;
          state.data[findIndex].charts = [
            payload.payload,
            ...(state.data[findIndex].charts || []),
          ];
        } else {
          state.data = [...payload.payload, ...state.data];
        }
      })
      .addCase(addDischargeSummary.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateDischargeSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDischargeSummary.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload.addmission
        );
        const findChartIndex = state.data[findIndex].charts.findIndex(
          (chart) => chart._id === payload.payload._id
        );
        state.data[findIndex].charts[findChartIndex] = payload.payload;
      })
      .addCase(updateDischargeSummary.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addDetailAdmission.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDetailAdmission.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.isAddmissionAvailable) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.addmission
          );
          state.data[findIndex].totalCharts += 1;
          state.data[findIndex].charts = [
            payload.payload,
            ...(state.data[findIndex].charts || []),
          ];
        } else {
          state.data = [...payload.payload, ...state.data];
        }
      })
      .addCase(addDetailAdmission.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addGeneralDetailAdmission.pending, (state) => {
        state.loading = true;
      })
      .addCase(addGeneralDetailAdmission.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.charts = [payload.payload, ...(state.charts || [])];
      })
      .addCase(addGeneralDetailAdmission.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeDetailAdissionFile.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeDetailAdissionFile.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.type === "GENERAL") {
          const findIndex = state.charts.findIndex(
            (el) => el._id === payload.payload._id
          );
          state.charts[findIndex] = payload.payload;
          state.chartForm.data = payload.payload;
        } else {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          const findChartIndex = state.data[findIndex].charts.findIndex(
            (chart) => chart._id === payload.payload._id
          );
          state.data[findIndex].charts[findChartIndex] = payload.payload;
          state.chartForm.data = payload.payload;
        }
      })
      .addCase(removeDetailAdissionFile.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateDetailAdmission.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDetailAdmission.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.type === "GENERAL") {
          const findIndex = state.charts.findIndex(
            (el) => el._id === payload.payload._id
          );
          state.charts[findIndex] = payload.payload;
        } else {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          const findChartIndex = state.data[findIndex].charts.findIndex(
            (chart) => chart._id === payload.payload._id
          );
          state.data[findIndex].charts[findChartIndex] = payload.payload;
        }
      })
      .addCase(updateDetailAdmission.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(removeChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeChart.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.payload.type === "GENERAL") {
          state.charts = state.charts.filter(
            (item) => item._id !== payload.chart._id
          );
        } else if (payload.payload.type === IPD) {
          const findIndex = state.data.findIndex(
            (el) => el._id === payload.payload.addmission
          );
          if (state?.data[findIndex]?.charts.length === 1) {
            state.data = state.data.filter(
              (item) => item._id !== payload.payload.addmission
            );
          } else {
            state.data[findIndex].charts = state.data[findIndex].charts.filter(
              (item) => item._id !== payload.payload._id
            );
            state.data[findIndex].totalCharts -= 1;
          }
        }
      })
      .addCase(removeChart.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  createEditChart,
  updateChartAdmission,
  setChartDate,
  setChartAdmission,
  resetOpdPatientCharts,
  setPtLatestOPDPrescription,
} = chartSlice.actions;

export default chartSlice.reducer;
