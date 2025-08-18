import React from "react";
import PatientTopBar from "./Views/Components/PatientTopBar";
import Views from "./Views";
import { connect } from "react-redux";

const PatientDetails = () => {
  return (
    <React.Fragment>
      <div
        className="w-100"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "82vh",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "white",
          }}
        >
          <PatientTopBar />
        </div>
        <Views />
      </div>
    </React.Fragment>
  );
};

export default PatientDetails;
