import React, { useState } from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import NextButton from "./NextButton";

const fields = [
  {
    label: "Negative History",
    name: "negativeHistory",
    type: "checkbox",
    required: true,
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
    options: ["Yes", "No", "Not Available"],
    required: true,
  },
  {
    label: "Development Delay Details",
    name: "developmentDelayDetails",
    type: "checkboxWithText",
    options: [
      { value: "Sitting", textName: "developmentDelaySittingDetails" },
      { value: "Standing", textName: "developmentDelayStandingDetails" },
      { value: "Speech", textName: "developmentDelaySpeechDetails" },
      {
        value: "Toilet Training",
        textName: "developmentDelayToiletTrainingDetails",
      },
    ],
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
    label: "Pre-morbid personality break-up",
    name: "personality",
    type: "textarea",
    required: true,
  },
];

const DetailHistoryForm = ({ validation, setFormStep, step }) => {
  const [attempted, setAttempted] = useState(false);

  const validate = () => {
    setAttempted(true);
    const negativeHistoryMissing =
      !Array.isArray(validation.values.negativeHistory) ||
      validation.values.negativeHistory.length === 0;
    const developmentDelayMissing = !validation.values.developmentDelay;
    const personalityMissing = !validation.values.personality;
    return (
      !negativeHistoryMissing && !developmentDelayMissing && !personalityMissing
    );
  };

  return (
    <React.Fragment>
      <div>
        <RenderFields fields={fields} validation={validation} />
        {attempted && (
          <p className="text-danger small">
            Please fill in all required fields before continuing.
          </p>
        )}
      </div>
      <NextButton
        setFormStep={setFormStep}
        step={step}
        onBeforeNext={validate}
      />
    </React.Fragment>
  );
};

DetailHistoryForm.propTypes = {};

export default DetailHistoryForm;
