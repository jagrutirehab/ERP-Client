import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/scss/themes.scss";
import Route from "./Routes";
import { connect } from "react-redux";

function App({ patients }) {
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
