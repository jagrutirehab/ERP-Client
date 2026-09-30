import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/scss/themes.scss";
import Route from "./Routes";
import { connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <React.Fragment>
      <Route />
    </React.Fragment>
  );
}

const mapStateToProps = (state) => ({
  patients: state.Patient.allPatients,
});

export default connect(mapStateToProps)(App);
