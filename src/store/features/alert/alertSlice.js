import { createSlice } from "@reduxjs/toolkit";
// import { extraAction } from "../extraAction";

export const AlertSlice = createSlice({
  name: "alert",
  initialState: {
    alerts: {},
  },
  reducers: {
    setAlert: (state, action) => {
      state.alerts = {
        message: action.payload.message,
        type: action.payload.type,
      };
    },
  },
  //   extraReducers: {
  //     [extraAction]: (state, action) => {
  //       state.alerts.push({ message: action.error.message, type: "error" });
  //     }
  //   }
});

export const { setAlert } = AlertSlice.actions;

export default AlertSlice.reducer;
