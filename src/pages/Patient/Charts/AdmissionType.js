import React from "react";
import PropTypes from "prop-types";
import {
  admissionTypeLabel,
  getVisibleAdmissionTypeRows,
} from "../../../utils/admissionType";

const AdmissionType = ({ data }) => {
  if (!data) return null;

  // Only the fields relevant to the recorded branch.
  const rows = getVisibleAdmissionTypeRows(data);

  if (rows.length === 0) return null;

  return (
    <React.Fragment>
      <div>
        {rows.map((field) => (
          <div className="d-flex" key={field.name}>
            <h6 className="fs-xs-10 fs-md-14">{field.label}:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">
              {admissionTypeLabel(field.name, data[field.name])}
            </p>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};

AdmissionType.propTypes = {
  data: PropTypes.object,
};

export default AdmissionType;
