import React from "react";
import Header from "../Header";
import InjuryMarksBody from "./Body";
import Footer from "../Footer";

const InjuryMarks = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Header
        chart={chart || {}}
        center={center || {}}
        patient={patient || {}}
        admission={admission || {}}
      />
      <InjuryMarksBody chart={chart.injuryMarks || {}} />
      <Footer />
    </React.Fragment>
  );
};

export default InjuryMarks;
