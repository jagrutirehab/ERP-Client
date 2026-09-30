import React, { useEffect, useRef, useState } from "react";
import { Row, Col, FormGroup, Label, Input, Button } from "reactstrap";
import { getIn } from "formik";
import NextButton from "./NextButton";
import psychiatricConfig from "./Helpers/psychiatricConfig";
import geriatricConfig from "./Helpers/geriatricConfig";
import addictionConfig from "./Helpers/addictionConfig";
import SectionRenderer from "../Components/SectionRenderer";
import { setInPath, validateSections } from "./Helpers/Fields";
import Select from "react-select";

export const PATIENT_TYPE_OPTIONS = [
  { value: "psychiatric", label: "Psychiatric" },
  { value: "addiction", label: "Addiction" },
  { value: "geriatric", label: "Geriatric / Dementia / Palliative" },
];

const CONFIG_BY_TYPE = {
  psychiatric: psychiatricConfig,
  addiction: addictionConfig,
  geriatric: geriatricConfig,
};

const fieldKeyFor = (patientType) => `${patientType}Fields`;

const parseGroup = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const validatePatientTypeFields = (formikValues) => {
  const patientType = formikValues?.patientType || "";
  if (!patientType) {
    return {
      isValid: false,
      errors: { patientType: "Please select a patient type." },
    };
  }
  const config = CONFIG_BY_TYPE[patientType];
  const key = fieldKeyFor(patientType);
  const groupValues = { [key]: parseGroup(formikValues[key]) };
  const errors = config ? validateSections(config, groupValues) : {};
  return { isValid: Object.keys(errors).length === 0, errors };
};


const PatientTypeFields = ({
  validation,
  setFormStep,
  step,
  forceShowErrors,
}) => {
  const patientType = validation.values.patientType || "";
  const activeConfig = CONFIG_BY_TYPE[patientType];
  const activeKey = patientType ? fieldKeyFor(patientType) : null;

  const values = activeKey
    ? { [activeKey]: parseGroup(validation.values[activeKey]) }
    : {};

  const [attempted, setAttempted] = useState(Boolean(forceShowErrors));
  const [errors, setErrors] = useState({});
  const [patientTypeError, setPatientTypeError] = useState(null);

  const runValidation = (currentValues) => {
    const fieldErrors = activeConfig
      ? validateSections(activeConfig, currentValues)
      : {};
    setErrors(fieldErrors);
    setPatientTypeError(patientType ? null : "Please select a patient type.");
    return Boolean(patientType) && Object.keys(fieldErrors).length === 0;
  };

  useEffect(() => {
    if (forceShowErrors) {
      runValidation(values);
    }
  }, []);

  const handleChange = (path, value) => {
    const next = setInPath(values, path, value);
    const topLevelKey = path.split(".")[0];
    validation.setFieldValue(
      topLevelKey,
      JSON.stringify(getIn(next, topLevelKey) || {}),
    );
    if (attempted) {
      runValidation(next);
    }
  };

  const handlePatientTypeChange = (selected) => {
    const nextType = selected ? selected.value : "";
    validation.setFieldValue("patientType", nextType);
    if (attempted) {
      setPatientTypeError(nextType ? null : "Please select a patient type.");
      const nextKey = nextType ? fieldKeyFor(nextType) : null;
      const nextValues = nextKey
        ? { [nextKey]: parseGroup(validation.values[nextKey]) }
        : {};
      const nextConfig = CONFIG_BY_TYPE[nextType];
      setErrors(nextConfig ? validateSections(nextConfig, nextValues) : {});
    }
  };

  const handleNextClick = () => {
    setAttempted(true);
    const isValid = runValidation(values);
    if (isValid) {
      setFormStep(step);
    }
  };

  return (
    <div>
      <Row className="mb-4">
        <Col md={6}>
          <FormGroup>
            <Label htmlFor="patientType">
              Patient Type <span className="text-danger">*</span>
            </Label>
            <Select
              inputId="patientType"
              name="patientType"
              classNamePrefix="select"
              placeholder="-- Select Patient Type --"
              options={PATIENT_TYPE_OPTIONS}
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: patientTypeError ? "#dc3545" : base.borderColor,
                  "&:hover": {
                    borderColor: patientTypeError
                      ? "#dc3545"
                      : base.borderColor,
                  },
                }),
              }}
              value={
                PATIENT_TYPE_OPTIONS.find((opt) => opt.value === patientType) ||
                null
              }
              onChange={handlePatientTypeChange}
            />
            {patientTypeError && (
              <div className="text-danger small mt-1">{patientTypeError}</div>
            )}
          </FormGroup>
        </Col>
      </Row>

      {!patientType && (
        <p className="text-muted">
          Select a patient type above to show the matching assessment fields.
        </p>
      )}

      {activeConfig && (
        <SectionRenderer
          sections={activeConfig}
          values={values}
          onChange={handleChange}
          errors={errors}
        />
      )}

      {attempted && (patientTypeError || Object.keys(errors).length > 0) && (
        <p className="text-danger small">
          Please fill in all required fields before continuing.
        </p>
      )}

      <div className="text-end">
        <Button
          className="text-white"
          onClick={handleNextClick}
          size="sm"
          color="success"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PatientTypeFields;
