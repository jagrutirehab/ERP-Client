import React from "react";
import Header from "../Header";
import Body from "./Body";
import Footer from "../Footer";

// Print layout for an auto-generated Round Note chart.
// `chart.roundNoteChart` holds session/floor/date/note/roundTakenBy.
// `chart.author` is the user who triggered the chart creation.
const RoundNote = ({ chart, center, patient, admission }) => {
  return (
    <React.Fragment>
      <Header
        chart={chart}
        center={center}
        patient={patient}
        admission={admission || {}}
      />
      <Body chart={chart.roundNoteChart} />
      <Footer />
    </React.Fragment>
  );
};

export default RoundNote;
