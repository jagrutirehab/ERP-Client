/* eslint-disable no-throw-literal */
import { call, put, takeEvery, takeLatest, all } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
  apiError,
  loginSuccess,
  openChangePasswordModal,
  searchUserFail,
  searchUserSuccess,
  setMicroLogin,
  setUser,
  setUserCenters,
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

      if (microLoginRes?.statusCode === 200) {
        const microdata = microLoginRes.data;
        yield put(setMicroLogin(microLoginRes.data));
      } else if (microLoginRes) {
        toast.warn("Microservice login failed");
      }
    }

    if (mainLoginRes.success === true) {
      const authUser = {
        data: mainLoginRes.payload,
        token: mainLoginRes.token,
        status: "success",
      };

      yield put(setUser(authUser));
      yield put(setUserCenters(mainLoginRes.userCenters))
      yield put(loginSuccess(mainLoginRes));
      navigate("/dashboard");
      return { status: 200, payload: mainLoginRes };
    } else if (mainLoginRes.status === 403) {
      throw { response: { status: 403, data: mainLoginRes } };
    } else {
      toast.error(mainLoginRes.error?.message || "Invalid Credentials");
      yield put(apiError(mainLoginRes));
      throw {
        response: { status: mainLoginRes.status || 400, data: mainLoginRes },
      };
    }
  } catch (error) {
    const status = error?.data?.requirePasswordChange;
    const temptoken = error?.data?.tempToken;

    if (status === true) {
      yield put(openChangePasswordModal(temptoken));
    }
    toast.error(
      error.response?.data?.message || error.message || "Login failed"
    );
    yield put(apiError(error));
    throw error;
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
