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
      state.patient = payload.patient;
      state.intern = payload.intern;
      state.admission = payload.admission;
      state.doctor = payload.doctor;
      state.center = payload.center;
    },
  },
});

export const { togglePrint } = printSlice.actions;

export default printSlice.reducer;
