import React from "react";
import Header from "../Header";
import MedicineGivenBody from "./Body";
import Footer from "../Footer";

const MedicineGiven = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Header
        chart={chart || {}}
        center={center || {}}
        patient={patient || {}}
        admission={admission || {}}
      />
      <MedicineGivenBody chart={chart.nurseGivenMedicine || {}} />
      <Footer />
    </React.Fragment>
  );
};

export default MedicineGiven;
