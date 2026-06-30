import React from "react";
import NurseSosProcedureBody from "../../../Charts/NurseSosProcedure/Body";
import ChartHeader from "../ChartHeader";

const NurseSosProcedure = ({ chart }) => {
  return (
    <React.Fragment>
      <ChartHeader chart={chart} />
      <NurseSosProcedureBody chart={chart.nurseSosProcedure || {}} />
    </React.Fragment>
  );
};

export default NurseSosProcedure;
