import React from "react";
import NextButton from "./NextButton";
import RenderFields from "../../../../Components/Common/RenderFields";

const fields = [
  {
    label: "Provisional Diagnosis",
    name: "diagnosis1",
    type: "text",
  },
];

const ProvisionalDiagnosisForm = ({ validation, setFormStep, step }) => {
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

ProvisionalDiagnosisForm.propTypes = {};

export default ProvisionalDiagnosisForm;
