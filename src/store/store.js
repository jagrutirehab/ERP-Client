import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./reducers";
import sagas from "./sagas";
import {
  setBillItems,
  setCenters,
  setMedicines,
  setUser,
  viewPatient,
} from "./actions";
import { setPaymentAccounts } from "./features/setting/settingSlice";
import { setMicroLogin, setUserCenters } from "./features/auth/user/userSlice";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware),
});
const persistedUser =
  localStorage.getItem("authUser") &&
  localStorage.getItem("authUser") !== "undefined" &&
  JSON.parse(localStorage.getItem("authUser"));
const microdata =
  localStorage.getItem("micrologin") &&
  localStorage.getItem("micrologin") !== "undefined" &&
  JSON.parse(localStorage.getItem("micrologin"));
const persistedPatient =
  localStorage.getItem("activePatient") &&
  localStorage.getItem("activePatient") !== "undefined" &&
  JSON.parse(localStorage.getItem("activePatient"));
const persistedUserCenters =
  localStorage.getItem("userCenters") &&
  localStorage.getItem("userCenters") !== "undefined" &&
  JSON.parse(localStorage.getItem("userCenters"));
const persistedMedicines =
  localStorage.getItem("medicines") &&
  localStorage.getItem("medicines") !== "undefined" &&
  JSON.parse(localStorage.getItem("medicines"));
const persistedBillItems =
  localStorage.getItem("billItems") &&
  localStorage.getItem("billItems") !== "undefined" &&
  JSON.parse(localStorage.getItem("billItems"));
const persistedPaymentAccounts =
  localStorage.getItem("paymentAccounts") &&
  localStorage.getItem("paymentAccounts") !== "undefined" &&
  JSON.parse(localStorage.getItem("paymentAccounts"));
const persistedCenters =
  localStorage.getItem("centers") &&
  localStorage.getItem("centers") !== "undefined" &&
  JSON.parse(localStorage.getItem("centers"));
if (persistedUser) {
  store.dispatch(setUser(persistedUser.data));
}
if (microdata) {
  store.dispatch(setMicroLogin(microdata));
}
if (persistedPatient) {
  store.dispatch(viewPatient(persistedPatient));
}
if (persistedUserCenters) {
  store.dispatch(setUserCenters(persistedUserCenters));
}
if (persistedMedicines) {
  store.dispatch(setMedicines(persistedMedicines));
}
if (persistedCenters) {
  store.dispatch(setCenters(persistedCenters));
}
if (persistedBillItems) {
  store.dispatch(setBillItems(persistedBillItems));
}
if (persistedPaymentAccounts) {
  store.dispatch(setPaymentAccounts(persistedPaymentAccounts));
}

sagaMiddleware.run(sagas);

export default store;
