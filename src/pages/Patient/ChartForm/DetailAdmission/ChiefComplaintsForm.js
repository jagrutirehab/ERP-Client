import React, { useState } from "react";
import NextButton from "./NextButton";
import RenderFields from "../../../../Components/Common/RenderFields";

const fields = [
  {
    label: "Informant (Self +)",
    name: "informant",
    type: "text",
    required: true,
  },
  {
    label: "Reliable",
    name: "reliable",
    type: "select",
    options: ["Reliable", "Unreliable"],
    required: true,
  },
  {
    label: "Adequate",
    name: "adequate",
    type: "select",
    options: ["Adequate", "Inadequate"],
    required: true,
  },
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
  const [attempted, setAttempted] = useState(false);

  const validate = () => {
    setAttempted(true);
    return (
      !!validation.values.informant &&
      !!validation.values.reliable &&
      !!validation.values.adequate
    );
  };

  return (
    <React.Fragment>
      <div>
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
      </div>
    </React.Fragment>
  );
};

ChiefComplaintsForm.propTypes = {};

export default ChiefComplaintsForm;
