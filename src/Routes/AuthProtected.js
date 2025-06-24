import React, { useEffect } from "react";
import { Navigate, Route } from "react-router-dom";
import { setAuthorization } from "../helpers/api_helper";
import { connect, useDispatch } from "react-redux";

import { useProfile } from "../Components/Hooks/UserHooks";

import { logoutUser } from "../store/actions";
import { addData, getStoreData } from "../lib/db";

const AuthProtected = (props) => {
  const dispatch = useDispatch();
  let { userProfile, loading, token } = useProfile();

  useEffect(() => {
    if (userProfile && !loading && token) {
      setAuthorization(token);
    } else if (!userProfile && loading && !token) {
      dispatch(logoutUser());
    }
  }, [token, userProfile, loading, dispatch]);

  //cache patients
  // useEffect(() => {
  //   const pts = async () => {
  //     const cachedPatients = await getStoreData("patients");
  //     // (patients);
  //     console.log("----------------------------------");
  //     console.log(cachedPatients, "cached patients");
  //     console.log(props.patients?.length, "all patients length");

  //     if (
  //       !cachedPatients &&
  //       cachedPatients?.length === 0 &&
  //       props.patients?.length > 0
  //     ) {
  //       console.log("add data");
  //       await addData("patients", props.patients);
  //     }
  //   };

  //   if (userProfile) pts().then();
  // }, [props.patients, userProfile]);

  /*
    redirect is un-auth access protected routes via url
    */
  if (!userProfile && loading && !token) {
    return <Navigate to="/login" state={{ from: props.location }} />;
  }

  return <>{props.children}</>;
};

const mapStateToProps = (state) => ({
  patients: state.Patient.allPatients,
});

export default connect(mapStateToProps)(AuthProtected);

const AccessRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        return (
          <>
            {" "}
            <Component {...props} />{" "}
          </>
        );
      }}
    />
  );
};

export { AccessRoute };
