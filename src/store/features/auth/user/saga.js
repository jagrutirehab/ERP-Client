import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
  apiError,
  loginSuccess,
  searchUserFail,
  searchUserSuccess,
} from "./userSlice";
import { getUsers, postJwtLogin } from "../../../../helpers/backend_helper";
function* loginUser({ payload: { values, navigate } }) {
  try {
    const response = yield call(postJwtLogin, {
      email: values.email,
      password: values.password,
    });

    const authUser = {
      data: response.payload,
      token: response.token,
      status: "success",
    };

    localStorage.setItem("authUser", JSON.stringify(authUser));
    localStorage.setItem("userCenters", JSON.stringify(response.userCenters));

    if (response.success === true) {
      yield put(loginSuccess(response));
      navigate("/dashboard");
    } else {
      toast.error(response.error.message || "Invalid Credentials");
      yield put(apiError(response));
    }
  } catch (error) {
    toast.error(error.message || "Invalid Credentials");
    yield put(apiError(error));
  }
}

function* searchUser({ payload }) {
  try {
    const response = yield call(getUsers, payload);
    if (response.success === true) {
      yield put(searchUserSuccess(response));
    } else {
      yield put(searchUserFail(response));
    }
  } catch (error) {
    yield put(searchUserFail(error));
  }
}

function* authSaga() {
  yield takeEvery("user/loginUser", loginUser);
  yield takeLatest("user/searchUser", searchUser);
}

export default authSaga;
