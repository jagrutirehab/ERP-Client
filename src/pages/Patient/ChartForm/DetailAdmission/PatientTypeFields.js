import React, { useEffect, useRef, useState } from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import { getIn } from "formik";
import NextButton from "./NextButton";
import psychiatricConfig from "./Helpers/psychiatricConfig";
import geriatricConfig from "./Helpers/geriatricConfig";
import addictionConfig from "./Helpers/addictionConfig";
import SectionRenderer from "../Components/SectionRenderer";
import { setInPath } from "./Helpers/Fields";
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

const PatientTypeFields = ({ validation, setFormStep, step }) => {
  const patientType = validation.values.patientType || "";
  const activeConfig = CONFIG_BY_TYPE[patientType];
  const activeKey = patientType ? fieldKeyFor(patientType) : null;

  const values = activeKey
    ? { [activeKey]: parseGroup(validation.values[activeKey]) }
    : {};

  const handleChange = (path, value) => {
    const next = setInPath(values, path, value);
    const topLevelKey = path.split(".")[0];
    validation.setFieldValue(
      topLevelKey,
      JSON.stringify(getIn(next, topLevelKey) || {}),
    );
  };

  return (
    <div>
      <Row className="mb-4">
        <Col md={6}>
          <FormGroup>
            <Label htmlFor="patientType">Patient Type</Label>
            <Select
              inputId="patientType"
              name="patientType"
              classNamePrefix="select"
              placeholder="-- Select Patient Type --"
              options={PATIENT_TYPE_OPTIONS}
              isClearable
              value={
                PATIENT_TYPE_OPTIONS.find((opt) => opt.value === patientType) ||
                null
              }
              onChange={(selected) =>
                validation.setFieldValue(
                  "patientType",
                  selected ? selected.value : "",
                )
              }
            />
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
        />
      )}

      <NextButton setFormStep={setFormStep} step={step} />
    </div>
  );
};

export default PatientTypeFields;
