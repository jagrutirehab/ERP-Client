import React from "react";
import Header from "../Header";
import Body from "./Body";
import Footer from "./Footer";

const DischargeSummary = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Header
        chart={chart}
        center={center}
        patient={patient}
        admission={admission}
      />
      <Body chart={chart} patient={patient} />
      <Footer chart={chart} patient={patient} center={center} />
    </React.Fragment>
  );
};

export default DischargeSummary;
