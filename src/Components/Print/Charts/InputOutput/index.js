import React from "react";
import Header from "../Header";
import InputOutputTable from "./Table";
import Footer from "../Footer";
import DoctorSignature from "../DoctorSignature";

const InputOutput = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Header
        chart={chart || {}}
        center={center || {}}
        patient={patient || {}}
        admission={admission || {}}
      />
      <InputOutputTable chart={chart.inputOutput || {}} />
      <DoctorSignature doctor={chart?.author} />
      <Footer />
    </React.Fragment>
  );
};

export default InputOutput;
