import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import Body from "../../../Charts/CounsellingNote/Body";

const CounsellingNote = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      {/* <Header
        chart={chart}
        center={center}
        patient={patient}
        admission={admission || {}}
      /> */}
      <Body chart={chart.counsellingNote} doctor={chart?.author} />
      {/* <Footer /> */}
    </React.Fragment>
  );
};

export default CounsellingNote;
