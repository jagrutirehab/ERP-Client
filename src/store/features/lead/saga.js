import { call, put, takeLatest } from "redux-saga/effects";
import { postSearchLead } from "../../../helpers/backend_helper";
import { searchLeadFail, searchLeadSuccess } from "./leadSlice";

function* searchLead({ payload }) {
  try {
    const leads = yield call(postSearchLead, payload);
    yield put(searchLeadSuccess(leads));
  } catch (error) {
    yield put(searchLeadFail(error));
  }
}

function* leadSaga() {
  yield takeLatest("Lead/searchLead", searchLead);
}

export default leadSaga;
