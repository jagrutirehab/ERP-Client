import React, { useEffect, useState } from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import { getICDCodes } from "../../../../helpers/backend_helper";
import NextButton from "./NextButton";

const DoctorSignature = ({ validation, setFormStep, step }) => {
  const [icdOptions, setIcdOptions] = useState([]);
  const [attempted, setAttempted] = useState(false);

  const validate = () => {
    setAttempted(true);
    const provisionalMissing =
      !Array.isArray(validation.values.provisionaldiagnosis) ||
      validation.values.provisionaldiagnosis.length === 0;
    const diagnosisMissing =
      !Array.isArray(validation.values.diagnosis) ||
      validation.values.diagnosis.length === 0;
    return !provisionalMissing && !diagnosisMissing;
  };

  useEffect(() => {
    const loadICD = async () => {
      try {
        const res = await getICDCodes();
        console.log("res", res);

        const formatted = res?.map((icd) => ({
          value: icd._id,
          label: `${icd.code} - ${icd.text}`,
        }));

        setIcdOptions(formatted);
      } catch (err) {
        console.log(err);
      }
    };

    loadICD();
  }, []);

  const fields = [
    {
      label: "Provisional Diagnosis",
      name: "provisionaldiagnosis",
      type: "select2",
      isMulti: true,
      options: icdOptions,
      required: true,
    },
    {
      label: "Final Diagnosis",
      name: "diagnosis",
      type: "select2",
      isMulti: true,
      options: icdOptions,
      required: true,
    },
    {
      label: "Managment Plan: (INDOOR / Out Patient)",
      name: "managmentPlan",
      type: "text",
    },
    {
      label: "Investigations",
      name: "investigation",
      type: "checkbox",
      options: ["CBC", "BSL", "LFT", "RFT", "HIV", "TFT", "VIT B-12", "VIT D3"],
    },
    {
      label: "Special Test",
      name: "specialTest",
      type: "text",
    },
    {
      label: "Psychological Testing",
      name: "treatment",
      type: "text",
    },
  ];

  return (
    <>
      <RenderFields fields={fields} validation={validation} />
      {attempted && (
        <p className="text-danger small">
          Please fill in all required fields before continuing.
        </p>
      )}
      <NextButton
        setFormStep={setFormStep}
        step={step}
        onBeforeNext={validate}
      />
    </>
  );
};

export default DoctorSignature;
