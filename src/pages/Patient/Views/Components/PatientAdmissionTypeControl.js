import React, { useState } from "react";
import PropTypes from "prop-types";
import { Input, Label, UncontrolledTooltip } from "reactstrap";
import { format, isValid } from "date-fns";
import {
  PATIENT_TYPE_OPTIONS,
  patientTypeLabel,
  PATIENT_ADMISSION_TYPE_SOURCE_LABEL,
} from "../../../../Components/constants/patientAdmissionType";

/**
 * The admission's clinical Patient Type (Psychiatric / Addiction / Geriatric)
 * on the IPD card. Editable while admitted, read-only after discharge (like the
 * Ramsay toggle). A Detail Admission save with a type overwrites it.
 *
 * Presentational: IPD.js owns the dispatch; `onChange` resolves when done.
 */
const PatientAdmissionTypeControl = ({ addmission, onChange }) => {
  const [saving, setSaving] = useState(false);
  const value = addmission?.patientAdmissionType || "";
  const meta = addmission?.patientAdmissionTypeMeta;
  const isDischarged = !!addmission?.dischargeDate;
  const id = `patient-admission-type-${addmission?._id}`;

  const setAt = meta?.setAt ? new Date(meta.setAt) : null;
  const provenance = [
    PATIENT_ADMISSION_TYPE_SOURCE_LABEL[meta?.source],
    meta?.setByName && `by ${meta.setByName}`,
    setAt && isValid(setAt) && format(setAt, "dd MMM yyyy, hh:mm a"),
  ]
    .filter(Boolean)
    .join(" · ");

  if (isDischarged) {
    return (
      <div className="d-flex align-items-center">
        <Label className="mb-0 text-nowrap me-2">Patient Type:</Label>
        <p className="mb-0">{patientTypeLabel(value) || "—"}</p>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center ms-2">
      <Label for={id} className="mb-0 text-nowrap me-2">
        Patient Type:
      </Label>
      <Input
        id={id}
        type="select"
        bsSize="sm"
        value={value}
        disabled={saving}
        style={{ width: "auto" }}
        onChange={async (e) => {
          const next = e.target.value;
          if (!next || next === value) return;
          setSaving(true);
          try {
            await onChange(addmission._id, next);
          } finally {
            setSaving(false);
          }
        }}
      >
        {/* Only shown until a type is recorded — there is no "clear". */}
        {!value && <option value="">Select...</option>}
        {PATIENT_TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Input>
      {provenance && (
        <>
          <i
            id={`${id}-info`}
            className="bx bx-info-circle ms-1 text-muted"
            style={{ cursor: "help" }}
          />
          <UncontrolledTooltip target={`${id}-info`} placement="top">
            {provenance}
          </UncontrolledTooltip>
        </>
      )}
    </div>
  );
};

PatientAdmissionTypeControl.propTypes = {
  addmission: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PatientAdmissionTypeControl;
