import React from "react";
import NextButton from "./NextButton";

const fullLine = {
  border: "none",
  borderBottom: "1px solid #000",
  width: "100%",
  marginTop: "3px",
  fontSize: "12px",
};

const ChiefComplaintsForm = ({ validation, setFormStep, step }) => {
  return (
    <React.Fragment>
      <div>
        <ol style={{ marginLeft: "20px", marginBottom: "10px" }}>
          <li>
            <input
              type="text"
              name="Independent_Admission_adult_symptom1"
              style={fullLine}
            />
          </li>
          <li>
            <input
              type="text"
              name="Independent_Admission_adult_symptom2"
              style={fullLine}
            />
          </li>
          <li>
            <input
              type="text"
              name="Independent_Admission_adult_symptom3"
              style={fullLine}
            />
          </li>
        </ol>
        <NextButton setFormStep={setFormStep} step={step} />
      </div>
    </React.Fragment>
  );
};

ChiefComplaintsForm.propTypes = {};

export default ChiefComplaintsForm;
