import { call, put, takeEvery, takeLatest, all } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
  apiError,
  loginSuccess,
  searchUserFail,
  searchUserSuccess,
  setMicroLogin,
} from "./userSlice";
import {
  getUsers,
  postJwtLogin,
  PostLoginService,
  GetCsrf,
} from "../../../../helpers/backend_helper";

function* loginUser({ payload: { values, navigate } }) {
  try {
    const [mainLoginRes, csrfRes] = yield all([
      call(postJwtLogin, {
        email: values.email,
        password: values.password,
      }),
      call(GetCsrf),
    ]);
    let microLoginRes = null;
    if (csrfRes?.success || csrfRes?.status === 200) {
      microLoginRes = yield call(PostLoginService, {
        email: values.email,
        password: values.password,
      });
    }
    console.log(microLoginRes);
    if (mainLoginRes.success === true) {
      const authUser = {
        data: mainLoginRes.payload,
        token: mainLoginRes.token,
        status: "success",
      };
      localStorage.setItem("authUser", JSON.stringify(authUser));
      localStorage.setItem(
        "userCenters",
        JSON.stringify(mainLoginRes.userCenters)
      );

      yield put(loginSuccess(mainLoginRes));
      navigate("/dashboard");
    } else {
      toast.error(mainLoginRes.error?.message || "Invalid Credentials");
      yield put(apiError(mainLoginRes));
    }
    if (microLoginRes?.statusCode === 200) {
      const microdata = microLoginRes.data
      localStorage.setItem("micrologin", JSON.stringify(microdata));
      yield put(setMicroLogin(microLoginRes.data));
    } else if (microLoginRes) {
      toast.warn("Microservice login failed");
    }
  } catch (error) {
    toast.error(error.message || "Login failed");
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
