import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteAppointment,
  editAppointment,
  getAppointments,
  getPatientAppointmentData,
  getPatientAppointments,
  getPatientPreviousDoctor,
  postAppointment,
  postCancelAppointment,
} from "../../../helpers/backend_helper";
import { setAlert } from "../alert/alertSlice";

const initialState = {
  data: [],
  event: {
    isOpen: false,
    data: null,
  },
  form: {
    open: false,
    data: null,
  },
  eventDate: new Date().toISOString(),
  patient: {
    appointments: [],
  },
  patientPreviousDoctor: null,
  loading: false,
  appointmentLoading: false,
};

export const fetchAppointments = createAsyncThunk(
  "getAppointments",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAppointments(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchPatientAppointments = createAsyncThunk(
  "getPatientAppointments",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPatientAppointments(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchPatientAppointmentData = createAsyncThunk(
  "getPatientAppointmentData",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPatientAppointmentData(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const fetchPatientPreviousDoctor = createAsyncThunk(
  "getPatientPreviousDoctor",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await getPatientPreviousDoctor(data);
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.response }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const addAppointment = createAsyncThunk(
  "postAppointment",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postAppointment(data);
      dispatch(
        setAlert({ type: "success", message: "Appointment Saved Successfully" })
      );

      dispatch(toggleAppointmentForm({ open: false, data: null }));

      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const updateAppointment = createAsyncThunk(
  "editAppointment",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await editAppointment(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Appointment Updated Successfully",
        })
      );

      dispatch(toggleAppointmentForm({ open: false, data: null }));
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  "cancelAppointment",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await postCancelAppointment(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Appointment Cancelled Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

export const removeAppointment = createAsyncThunk(
  "deleteAppointment",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteAppointment(data);
      dispatch(
        setAlert({
          type: "success",
          message: "Appointment Deleted Successfully",
        })
      );
      return response;
    } catch (error) {
      dispatch(setAlert({ type: "error", message: error.message }));
      return rejectWithValue("something went wrong");
    }
  }
);

const bookingSlice = createSlice({
  name: "center",
  initialState,
  reducers: {
    toggleAppointmentForm: (state, { payload }) => {
      state.form = payload;
    },
    setEventDate: (state, { payload }) => {
      state.eventDate = payload;
    },
    setCurrentEvent: (state, { payload }) => {
      state.event = payload;
    },
    setEventChart: (state, { payload }) => {
      const findIndex = state.data?.findIndex(
        (_) => _._id === payload.appointment
      );
      console.log(
        { findIndex, payload, data: state.data, event: state.event },
        "setEventChart"
      );

      if (findIndex >= 0) {
        state.data[findIndex].chart = payload.chart;
        state.data[findIndex].patient = payload.patient;
        if (state.event?.data) {
          state.event.data.patient = payload.patient;
          state.event.data.chart = payload.chart;
        }
      }
      const findIndexInPatientAppointments =
        state.patient.appointments?.findIndex(
          (_) => _._id === payload.appointment
        );

      if (findIndexInPatientAppointments >= 0)
        state.patient.appointments[findIndexInPatientAppointments].chart =
          payload.chart;
    },
    setEventBill: (state, { payload }) => {
      const findIndex = state.data?.findIndex(
        (_) => _._id === payload.appointment
      );
      if (findIndex >= 0) {
        state.data[findIndex].bill = payload.bill;
        state.event.data.bill = payload.bill;
      }
      const findIndexInPatientAppointments =
        state.patient.appointments?.findIndex(
          (_) => _._id === payload.appointment
        );
      if (findIndexInPatientAppointments >= 0)
        state.patient.appointments[findIndexInPatientAppointments].bill =
          payload.bill;
    },
    removeEventBill: (state, { payload }) => {
      const findIndex = state.patient.appointments?.findIndex(
        (_) => _.bill?._id === payload._id
      );

      if (findIndex >= 0) state.patient.appointments[findIndex].bill = null;
    },
    removeEventChart: (state, { payload }) => {
      const findIndex = state.patient.appointments?.findIndex(
        (_) => _.chart?._id === payload._id
      );

      if (findIndex >= 0) state.patient.appointments[findIndex].chart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload.payload;
      })
      .addCase(fetchAppointments.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchPatientAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientAppointments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.patient.appointments = payload.payload;
      })
      .addCase(fetchPatientAppointments.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchPatientAppointmentData.pending, (state) => {
        state.appointmentLoading = true;
      })
      .addCase(fetchPatientAppointmentData.fulfilled, (state, { payload }) => {
        state.appointmentLoading = false;

        const appointmentIndex = state.patient.appointments?.findIndex(
          (_) => _._id === payload.appointment
        );
        if (appointmentIndex >= 0) {
          state.patient.appointments[appointmentIndex].chart =
            payload.payload?.chart;
          state.patient.appointments[appointmentIndex].bill =
            payload.payload?.bill;
        }
      })
      .addCase(fetchPatientAppointmentData.rejected, (state) => {
        state.appointmentLoading = false;
      });

    builder
      .addCase(fetchPatientPreviousDoctor.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientPreviousDoctor.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.patientPreviousDoctor = payload.payload;
      })
      .addCase(fetchPatientPreviousDoctor.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(addAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAppointment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = [payload.payload, ...state.data];
      })
      .addCase(addAppointment.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelAppointment.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.data[findIndex] = payload.payload;
        state.event = { ...state.event, data: payload.payload };
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
      });

    builder
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAppointment.fulfilled, (state, { payload }) => {
        state.loading = false;
        const findIndex = state.data.findIndex(
          (el) => el._id === payload.payload._id
        );
        state.data[findIndex] = payload.payload;
        state.event = { ...state.event, data: payload.payload };
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
      });

    builder
      .addCase(removeAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeAppointment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = state.data.filter(
          (item) => item._id !== payload.payload._id
        );
      })
      .addCase(removeAppointment.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const {
  toggleAppointmentForm,
  setCurrentEvent,
  setEventDate,
  setEventChart,
  setEventBill,
  removeEventBill,
  removeEventChart,
} = bookingSlice.actions;

export default bookingSlice.reducer;
