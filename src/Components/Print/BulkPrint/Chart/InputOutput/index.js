import React from "react";
import InputOutputTable from "../../../Charts/InputOutput/Table";
import ChartHeader from "../ChartHeader";

const InputOutput = ({ chart }) => {
  return (
    <React.Fragment>
      <ChartHeader chart={chart} />
      <InputOutputTable chart={chart.inputOutput || {}} />
    </React.Fragment>
  );
};

export default InputOutput;
