import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: null,
  modal: false,
  patient: null,
  doctor: null,
};

export const printSlice = createSlice({
  name: "Print",
  initialState,
  reducers: {
    togglePrint: (state, { payload }) => {
      state.data = payload.data;
      state.modal = payload.modal;
      state.patient = payload.patient && {
        ...payload.patient,
        name: payload.patient.name?.toUpperCase() || "",
        address: payload.patient.address?.toUpperCase() || "",
      };
      state.intern = payload.intern && {
        ...payload.intern,
        name: payload.intern.name.toUpperCase() || "",
      };
      state.admission = payload.admission;
      state.doctor = payload.doctor;
      state.center = payload.center;
    },
  },
});

export const { togglePrint } = printSlice.actions;

export default printSlice.reducer;
