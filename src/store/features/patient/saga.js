import { call, put, takeLatest } from "redux-saga/effects";

//Include Both Helper File with needed methods
import {
  getPatientReferral,
  getSearchPatientPhoneNumber,
  getSearchPatients,
} from "../../../helpers/backend_helper";
import {
  searchPatientFail,
  searchPatientPhoneNumberFail,
  searchPatientPhoneNumberSuccess,
  searchPatientReferralFail,
  searchPatientReferralSuccess,
  searchPatientSuccess,
  searchUidPatientFail,
  searchUidPatientSuccess,
} from "./patientSlice";

function* searchPatient({ payload }) {
  try {
    const patients = yield call(getSearchPatients, payload);
    yield put(searchPatientSuccess(patients));
  } catch (error) {
    yield put(searchPatientFail(error));
  }
}

function* searchPatientPhoneNumber({ payload }) {
  try {
    const patients = yield call(getSearchPatientPhoneNumber, payload);
    yield put(searchPatientPhoneNumberSuccess(patients));
  } catch (error) {
    yield put(searchPatientPhoneNumberFail(error));
  }
}

function* searchUidPatient({ payload }) {
  try {
    const patients = yield call(getSearchPatientPhoneNumber, payload);
    yield put(searchUidPatientSuccess(patients));
  } catch (error) {
    yield put(searchUidPatientFail(error));
  }
}

function* searchPatientReferral({ payload }) {
  try {
    const patients = yield call(getPatientReferral, payload);
    yield put(searchPatientReferralSuccess(patients));
  } catch (error) {
    yield put(searchPatientReferralFail(error));
  }
}

function* patientSaga() {
  yield takeLatest("Patient/searchPatient", searchPatient);
  yield takeLatest(
    "Patient/searchPatientPhoneNumber",
    searchPatientPhoneNumber
  );
  yield takeLatest("Patient/searchUidPatient", searchUidPatient);
  yield takeLatest("Patient/searchPatientReferral", searchPatientReferral);
}

export default patientSaga;
