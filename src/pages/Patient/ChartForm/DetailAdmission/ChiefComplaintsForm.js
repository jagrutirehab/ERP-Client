import React from "react";
import NextButton from "./NextButton";
import RenderFields from "../../../../Components/Common/RenderFields";

const fields = [
  {
    label: "Complaint 1",
    name: "line1",
    type: "text",
  },
  {
    label: "Complaint 2",
    name: "line2",
    type: "text",
  },
  {
    label: "Complaint 3",
    name: "line3",
    type: "text",
  },
  {
    label: "Complaint 4",
    name: "line4",
    type: "text",
  },
];

const ChiefComplaintsForm = ({ validation, setFormStep, step }) => {
  return (
    <React.Fragment>
      <div>
        <div>
          <RenderFields fields={fields} validation={validation} />
        </div>
        <NextButton setFormStep={setFormStep} step={step} />
      </div>
    </React.Fragment>
  );
};

ChiefComplaintsForm.propTypes = {};

export default ChiefComplaintsForm;
