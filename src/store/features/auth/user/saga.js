import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

// Login Redux States
import {
  apiError,
  loginSuccess,
  searchUserFail,
  searchUserSuccess,
} from "./userSlice";

//Include Both Helper File with needed methods
import { getUsers, postJwtLogin } from "../../../../helpers/backend_helper";

//navigation
import history from "../../../../Routes/HistoryRoute";

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
      //user access auth
      navigate("/dashboard");
      // if (response.payload.centerAccess.length === 1) navigate("/center");
      // else navigate("/patient");
    } else {
      console.log(response, "Login error 1");
      toast.error(response.error.message || "Invalid Credentials");
      yield put(apiError(response));
    }
  } catch (error) {
    console.log(error, "Login error 2");
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

// function* searchSaga() {
//   yield takeEvery("user/searchUser", searchUser);
// }

export default authSaga;

// if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
//   const response = yield call(postJwtLogin, {
//     email: user.email,
//     password: user.password,
//   });
//   sessionStorage.setItem("authUser", JSON.stringify(response));
//   yield put(loginSuccess(response));
// } else if (process.env.REACT_APP_API_URL) {
//     const response = yield call(postFakeLogin, {
//       email: user.email,
//       password: user.password,
//     });
//   const authUser = {
//     data: payload.payload,
//     token: payload.token,
//     status: "success",
//   };
//   sessionStorage.setItem("authUser", JSON.stringify(authUser));
//   if (response.success === true) {
//     yield put(loginSuccess(response));
//     navigate.push("/dashboard");
//   } else {
//     yield put(apiError(response));
//   }
// }
