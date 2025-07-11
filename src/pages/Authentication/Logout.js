import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import withRouter from "../../Components/Hooks/withRouter";

import { logoutUser } from "../../store/actions";

//redux
import { useSelector, useDispatch } from "react-redux";

const Logout = (props) => {
  const dispatch = useDispatch();

  const { isUserLogout } = useSelector((state) => ({
    isUserLogout: state.User.isUserLogout,
  }));

  useEffect(() => {
    const handleLogout = async () => {
      dispatch(logoutUser());
      localStorage.clear();
      sessionStorage.clear();
    };

    handleLogout();
  }, [dispatch]);

  if (isUserLogout) {
    return <Navigate to="/login" />;
  }

  return <></>;
};

// Logout.propTypes = {
//   history: PropTypes.object,
// };

export default withRouter(Logout);

// import PropTypes from "prop-types";
// import React, { useEffect } from "react";
// import { Navigate } from "react-router-dom";
// import withRouter from "../../Components/Hooks/withRouter";
// import { persistor } from "../../store/store";

// import { logoutUser } from "../../store/actions";

// //redux
// import { useSelector, useDispatch } from "react-redux";

// const Logout = (props) => {
//   const dispatch = useDispatch();

//   const { isUserLogout } = useSelector((state) => ({
//     isUserLogout: state.User.isUserLogout,
//   }));

//   useEffect(() => {
//     dispatch(logoutUser());
//   }, [dispatch]);

//   if (isUserLogout) {
//     localStorage.removeItem('authUser');
//     // persistor.pause();
//     persistor.flush().then(() => {
//       return persistor.purge();
//     });
//     return <Navigate to="/login" />;
//   }

//   return <></>;
// };

// // Logout.propTypes = {
// //   history: PropTypes.object,
// // };

// export default withRouter(Logout);
