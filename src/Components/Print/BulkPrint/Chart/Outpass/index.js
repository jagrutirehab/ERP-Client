import React from "react";

//components
import Body from "../../../Charts/Outpass/Body";
import ChartHeader from "../ChartHeader";

const Outpass = ({ chart, center, patient }) => {
  return (
    <React.Fragment>
      <ChartHeader chart={chart} />
      <Body chart={chart.outpass} />
    </React.Fragment>
  );
};

export default Outpass;
