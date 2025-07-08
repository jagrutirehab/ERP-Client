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
    console.log("🔄 Starting login process for:", values.email);

    const response = yield call(postJwtLogin, {
      email: values.email,
      password: values.password,
    });

    console.log("✅ Login API response received:", {
      success: response.success,
      hasToken: !!response.token,
      hasPayload: !!response.payload,
      hasUserCenters: !!response.userCenters,
    });

    const authUser = {
      data: response.payload,
      token: response.token,
      status: "success",
    };

    console.log("💾 Storing auth data in localStorage:", {
      hasData: !!authUser.data,
      hasToken: !!authUser.token,
      tokenLength: authUser.token?.length,
    });

    localStorage.setItem("authUser", JSON.stringify(authUser));
    localStorage.setItem("userCenters", JSON.stringify(response.userCenters));

    console.log("✅ Auth data stored successfully");

    if (response.success === true) {
      console.log("🎉 Login successful, dispatching loginSuccess");
      yield put(loginSuccess(response));

      console.log("🚀 Navigating to dashboard...");
      navigate("/dashboard");
    } else {
      console.log("❌ Login failed:", response);
      toast.error(response.error.message || "Invalid Credentials");
      yield put(apiError(response));
    }
  } catch (error) {
    console.error("💥 Login error:", error);
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
