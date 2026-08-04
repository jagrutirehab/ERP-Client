import React from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import NextButton from "./NextButton";

const fields = [
  {
    label: "Negative History",
    name: "negativeHistory",
    type: "checkbox",
    options: [
      "Head Injury",
      "Seizures",
      "Loss of Consciousness",
      "CNS Infection",
      "Significant Medical Illness",
      "Medico-Legal Issues",
      "Abuse/Trauma",
      "Overdose",
      "Withdrawal delirium",
      "Substance induced Psychosis",
      "Epilepsy",
      "Other",
    ],
  },
  {
    label: "Negative History — Other (specify)",
    name: "negativeHistoryOther",
    type: "text",
    showIf: {
      field: "negativeHistory",
      includes: "Other",
    },
  },
  {
    label: "Development Delay",
    name: "developmentDelay",
    type: "select",
    options: ["Yes", "No"],
  },
  {
    label: "Development Delay Details",
    name: "developmentDelayDetails",
    type: "checkbox",
    options: ["Sitting", "Standing", "Speech", "Toilet Training"],
    showIf: {
      field: "developmentDelay",
      value: "Yes",
    },
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
