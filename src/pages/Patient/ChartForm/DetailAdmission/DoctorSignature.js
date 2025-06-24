import React from "react";
import PropTypes from "prop-types";
import RenderFields from "../../../../Components/Common/RenderFields";
import { Button } from "reactstrap";

const fields = [
  {
    label: "Diagnosis",
    name: "diagnosis",
    type: "text",
  },
  {
    label: "Managment Plan: (INDOOR - with reason for admission)",
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
    label: "Treatment",
    name: "treatment",
    type: "text",
  },
];

const DoctorSignature = ({ validation, closeForm }) => {
  return (
    <React.Fragment>
      <div>
        <RenderFields fields={fields} validation={validation} />
      </div>
      <div className="mt-3">
        <div className="d-flex gap-3 justify-content-end">
          <Button onClick={closeForm} size="sm" color="danger" type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit">
            Save
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

DoctorSignature.propTypes = {};

export default DoctorSignature;
