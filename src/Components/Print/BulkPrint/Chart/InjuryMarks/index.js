import React from "react";
import InjuryMarksBody from "../../../Charts/InjuryMarks/Body";
import ChartHeader from "../ChartHeader";

const InjuryMarks = ({ chart }) => {
  return (
    <React.Fragment>
      <ChartHeader chart={chart} />
      <InjuryMarksBody chart={chart.injuryMarks || {}} />
    </React.Fragment>
  );
};

export default InjuryMarks;
