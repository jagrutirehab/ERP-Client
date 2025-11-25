import React from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import NextButton from "./NextButton";

const fields = [
  // {
  //   label: "General Examination",
  //   name: "generalExamination",
  //   type: "text",
  // },
  {
    label: "CNS",
    name: "cns",
    type: "text",
  },
  {
    label: "CVS",
    name: "cvs",
    type: "text",
  },
  {
    label: "Pulse",
    name: "pulse",
    type: "text",
  },
  {
    label: "BP",
    name: "bp",
    type: "text",
  },
  {
    label: "RS",
    name: "rs",
    type: "text",
  },
  {
    label: "PA",
    name: "pa",
    type: "text",
  },
  {
    label: "Formulation",
    name: "formulation",
    type: "text",
  },
];

const PhysicalExamination = ({ validation, setFormStep, step }) => {
  return (
    <React.Fragment>
      <div>
        <RenderFields fields={fields} validation={validation} />
      </div>
      <NextButton setFormStep={setFormStep} step={step} />
    </React.Fragment>
  );
};

PhysicalExamination.propTypes = {};

export default PhysicalExamination;
