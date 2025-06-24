// import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
// import { useNavigate } from "react-router-dom";

// // Login Redux States
// import { apiError, loginSuccess } from "./loginSlice";

// //Include Both Helper File with needed methods
// import { postJwtLogin } from "../../../../helpers/backend_helper";

// function* getCenters({ payload: { values } }) {
//   try {
//     const response = yield call(postJwtLogin, {
//       email: values.email,
//       password: values.password,
//     });
//     const authUser = {
//       data: response.payload,
//       token: response.token,
//       status: "success",
//     };
//     sessionStorage.setItem("authUser", JSON.stringify(authUser));
//     if (response.success === true) {
//       yield put(loginSuccess(response));
//     } else {
//       yield put(apiError(response));
//     }
//   } catch (error) {
//     yield put(apiError(error));
//   }
// }

// function* centerSaga() {
//   yield takeEvery("center/getCenters", getCenters);
// }

// export default centerSaga;
