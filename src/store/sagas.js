import { all, fork } from "redux-saga/effects";
//Auth
import AuthSaga from "./features/auth/user/saga";
import leadSaga from "./features/lead/saga";
import patientSaga from "./features/patient/saga";

export default function* rootSaga() {
  yield all([
    //public
    fork(AuthSaga),
    fork(leadSaga),
    fork(patientSaga),
  ]);
}
