/* eslint-disable no-throw-literal */
import { call, put, takeEvery, takeLatest, all } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
  apiError,
  loginSuccess,
  openChangePasswordModal,
  searchUserFail,
  searchUserSuccess,
  setLoading,
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
    yield put(setLoading(true));
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
        localStorage.setItem("micrologin", JSON.stringify(microdata));
        yield put(setMicroLogin(microLoginRes.data));
      } else if (microLoginRes) {
        toast.dismiss();
        toast.warn("Microservice login failed", { toastId: "micoservice-error" });
      }
    }

    localStorage.setItem("loginResponse", JSON.stringify(mainLoginRes));

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

      yield put(setUser(authUser));
      yield put(setUserCenters(mainLoginRes.userCenters));
      yield put(loginSuccess(mainLoginRes));
      yield put(setLoading(false));
      toast.dismiss();
      toast.success("Login successful", { toastId: "login-success" });
      navigate("/dashboard");
      return { status: 200, payload: mainLoginRes };
    } else if (mainLoginRes.status === 403) {
      yield put(setLoading(false));
      throw { response: { status: 403, data: mainLoginRes } };
    } else {
      toast.error("Invalid credentials", { toastId: "login-error" });
      yield put(setLoading(false));
      yield put(apiError(mainLoginRes));
      throw {
        response: { status: mainLoginRes.status || 400, data: mainLoginRes },
      };
    }
  } catch (error) {
    yield put(setLoading(false));
    const status = error?.data?.requirePasswordChange;
    const temptoken = error?.data?.tempToken;

    if (status === true) {
      yield put(openChangePasswordModal(temptoken));
    }
    toast.dismiss();
    toast.error(
      error.response?.data?.message || error.message || "Login failed"
    );
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
