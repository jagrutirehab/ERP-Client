import React from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import { Col, Input, Label, Row } from "reactstrap";
import NextButton from "./NextButton";

const fields = [
  {
    label: "History / Onset Duration & Progress",
    name: "history",
    type: "textarea",
  },
  {
    label: "Negative History",
    name: "negativeHistory",
    type: "textarea",
  },
  {
    label: "Development History & Childhood/Adolescence",
    name: "developmentHistory",
    type: "textarea",
  },
  {
    label: "Family History",
    name: "familyHistory",
    type: "textarea",
  },
  {
    label: "Personal / Sexual / Marital History",
    name: "personalHistory",
    type: "textarea",
  },
  {
    label: "Personality",
    name: "personality",
    type: "textarea",
  },
];

const DetailHistoryForm = ({ validation, setFormStep, step }) => {
  return (
    <React.Fragment>
      <div>
        <RenderFields fields={fields} validation={validation} />
        <NextButton setFormStep={setFormStep} step={step} />
      </div>
    </React.Fragment>
  );
};

DetailHistoryForm.propTypes = {};

export default DetailHistoryForm;
