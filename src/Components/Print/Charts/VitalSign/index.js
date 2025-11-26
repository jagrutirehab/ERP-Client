import React from "react";
import Header from "../Header";
import VitalSignsTable from "./Table";
import Footer from "../Footer";
import DoctorSignature from "../DoctorSignature";

const VitalSign = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Header
        chart={chart || {}}
        center={center || {}}
        patient={patient || {}}
        admission={admission || {}}
      />
      <VitalSignsTable chart={chart.vitalSign || {}} />
      <DoctorSignature doctor={chart?.author} />
      <Footer />
    </React.Fragment>
  );
};

export default VitalSign;
