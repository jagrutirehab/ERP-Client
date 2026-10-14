import React, { useState } from "react";
import NextButton from "./NextButton";
import RenderFields from "../../../../Components/Common/RenderFields";

const fields = [
  {
    label: "Informant (Self +)",
    name: "informant",
    type: "select",
    options: [
      "Self",
      "Parents",
      "Mother",
      "Father",
      "Spouse",
      "Son",
      "Daughter",
      "Siblings",
      "Others",
    ],
    required: true,
  },
  {
    label: "Informant Name",
    name: "informantName",
    type: "text",
    showIf: {
      field: "informant",
      notEquals: "Self",
    },
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
    required: true,
  },
  {
    label: "Complaint 2",
    name: "line2",
    type: "text",
    required: true,
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

  const informantIsNotSelf =
    validation.values.informant && validation.values.informant !== "Self";

  const fields = [
    {
      label: "Informant (Self +)",
      name: "informant",
      type: "select",
      options: [
        "Self",
        "Parents",
        "Mother",
        "Father",
        "Spouse",
        "Son",
        "Daughter",
        "Siblings",
        "Others",
      ],
      required: true,
    },
    {
      label: "Informant Name",
      name: "informantName",
      type: "text",
      required: informantIsNotSelf,
      showIf: {
        field: "informant",
        notEquals: "Self",
      },
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
      required: true,
    },
    {
      label: "Complaint 2",
      name: "line2",
      type: "text",
      required: true,
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

  const validate = () => {
    setAttempted(true);
    return (
      !!validation.values.informant &&
      !!validation.values.reliable &&
      !!validation.values.adequate &&
      !!validation.values.line1 &&
      !!validation.values.line2 &&
      (!informantIsNotSelf || !!validation.values.informantName)
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
