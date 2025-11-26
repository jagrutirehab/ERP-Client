import React from "react";
import Header from "../Header";
import Body from "./Body";
import Footer from "../Footer";

const ClinicalNote = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Header
        chart={chart}
        center={center}
        patient={patient}
        admission={admission || {}}
      />
      <Body chart={chart.clinicalNote} doctor={chart?.author} />
      <Footer />
    </React.Fragment>
  );
};

export default ClinicalNote;
