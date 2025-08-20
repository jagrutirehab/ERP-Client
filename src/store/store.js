import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
// import storage from "redux-persist/lib/storage";
// import {
//   persistReducer,
//   persistStore,
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from "redux-persist";

// import userReducer from './features/auth/user/userSlice';
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
import { setUserCenters } from "./features/auth/user/userSlice";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["User"],
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware),
});

// Subscribe to the store and persist state changes
// store.subscribe(() => {
//   const state = store.getState();
//   localStorage.setItem('persistedUser', JSON.stringify(state));
// });

// Initialize the store with persisted state if available
const persistedUser =
  localStorage.getItem("authUser") &&
  localStorage.getItem("authUser") !== "undefined" &&
  JSON.parse(localStorage.getItem("authUser"));
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

// Dispatch the action to update the state
// store.dispatch(updateState({ /* update state here */ }));

sagaMiddleware.run(sagas);

export default store;
// export const persistor = persistStore(store);

// import { configureStore } from "@reduxjs/toolkit";
// import createSagaMiddleware from "redux-saga";
// import storage from "redux-persist/lib/storage";
// import {
//   persistReducer,
//   persistStore,
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from "redux-persist";

// // import userReducer from './features/auth/user/userSlice';
// import rootReducer from "./reducers";
// import sagas from "./sagas";

// const sagaMiddleware = createSagaMiddleware();
// const middleware = [sagaMiddleware];

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["User"],
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//       },
//     }).concat(middleware),
// });

// sagaMiddleware.run(sagas);

// export default store;
// export const persistor = persistStore(store);


// whole state persist

// import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
// import createSagaMiddleware from "redux-saga";
// import { persistReducer, persistStore } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import rootReducer from "./reducers";
// import sagas from "./sagas";

// const persistConfig = {
//   key: "root",
//   version: 1,
//   storage,
//   blacklist:["Recyclebin"]
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// const sagaMiddleware = createSagaMiddleware();

// const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }).concat(sagaMiddleware),
// });

// sagaMiddleware.run(sagas);

// export const persistor = persistStore(store);

// export default store;
