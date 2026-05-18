import React from "react";
import Body from "../../../Charts/ExpirySummary/Body";
import ChartHeader from "../ChartHeader";

const ExpirySummary = ({ chart, center, patient }) => {
  return (
    <React.Fragment>
      <ChartHeader chart={chart} />
      <Body chart={chart} />
    </React.Fragment>
  );
};

export default ExpirySummary;
