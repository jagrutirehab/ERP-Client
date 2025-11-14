import React from "react";
import Header from "../../ModifiedHeader";
import PrescriptionBody from "./Body";
import Footer from "../../Footer";

const Prescription = ({ chart, center, patient, doctor, admission }) => {
  let primaryDoctor;

  if (chart?.type === "IPD") {
    if (chart?.author?.author === doctor?._id) {
      primaryDoctor = doctor;
    } else {
      primaryDoctor = chart?.author || doctor;
    }
  } else {
    primaryDoctor = doctor || chart?.author;
  }

  return (
    <React.Fragment>
      <Header
        chart={chart}
        doctor={primaryDoctor}
        center={center}
        patient={patient}
        admission={admission}
      />
      <PrescriptionBody
        author={chart?.author}
        chart={chart?.prescription}
        doctor={primaryDoctor}
      />
      <Footer />
    </React.Fragment>
  );
};

export default Prescription;
