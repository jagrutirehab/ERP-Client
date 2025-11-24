import React from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import NextButton from "./NextButton";

// old
const fields = [
  {
    label: "Appearance & Behavior",
    name: "appearance",
    type: "text",
  },
  {
    label: "Eye to Eye contact and Rapport",
    name: "ecc",
    type: "text",
  },
  {
    label: "Speech",
    name: "speech",
    type: "text",
  },
  {
    label: "Mood",
    name: "mood",
    type: "text",
  },
  {
    label: "Affect",
    name: "effect",
    type: "text",
  },
  {
    label: "Thinking",
    name: "thinking",
    type: "text",
  },
  {
    label: "Perception",
    name: "perception",
    type: "text",
  },
  {
    label: "Memory",
    name: "memory",
    type: "text",
  },
  {
    label: "Abstract Thinking",
    name: "abstractThinking",
    type: "text",
  },
  {
    label: "Social Judgment",
    name: "socialJudgment",
    type: "text",
  },
  {
    label: "Insight",
    name: "insight",
    type: "text",
  },
];

const MentalExamination = ({ validation, setFormStep, step }) => {
  return (
    <React.Fragment>
      <div>
        <RenderFields fields={fields} validation={validation} />
      </div>
      <NextButton setFormStep={setFormStep} step={step} />
    </React.Fragment>
  );
};

MentalExamination.propTypes = {};

export default MentalExamination;
