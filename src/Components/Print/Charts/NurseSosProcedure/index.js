import React from "react";
import Header from "../Header";
import NurseSosProcedureBody from "./Body";
import Footer from "../Footer";
import DoctorSignature from "../DoctorSignature";

const NurseSosProcedure = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Header
        chart={chart || {}}
        center={center || {}}
        patient={patient || {}}
        admission={admission || {}}
      />
      <NurseSosProcedureBody chart={chart.nurseSosProcedure || {}} />
      <DoctorSignature doctor={chart?.author} />
      <Footer />
    </React.Fragment>
  );
};

export default NurseSosProcedure;
