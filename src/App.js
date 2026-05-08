import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/scss/themes.scss";
import Route from "./Routes";
import { connect } from "react-redux";
import { connectSopSocket } from "./workers/sopsocket";
import SOPAlertListener from "./Components/SOPAlertListener";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  useEffect(() => {
    connectSopSocket();
  }, []);

  return (
    <React.Fragment>
      <SOPAlertListener />
      <Route />
    </React.Fragment>
  );
}

const mapStateToProps = (state) => ({
  patients: state.Patient.allPatients,
});

export default connect(mapStateToProps)(App);