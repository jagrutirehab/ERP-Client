import React from "react";
import Header from "../Header";
import Body from "./Body";
import Footer from "../Footer";

const Prescription = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Header
        chart={chart}
        doctor={chart?.author}
        center={center}
        patient={patient}
        admission={admission}
      />
      <Body chart={chart?.prescription} doctor={chart?.author} />
      <Footer />
    </React.Fragment>
  );
};

export default Prescription;
