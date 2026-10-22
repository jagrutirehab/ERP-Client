import React from "react";
import { Row, Col, FormGroup, Label } from "reactstrap";
import Select from "react-select";
import Divider from "../../../../Components/Common/Divider";

export const FUNCTIONAL_ASSESSMENT_FIELDS = [
  {
    key: "supervisionRequired",
    label: "Supervision Required",
    options: ["None", "Intermittent", "Continuous"],
  },
  {
    key: "standingAbility",
    label: "Standing Ability",
    options: ["Independent", "Support required", "Unable"],
  },
  {
    key: "walkingMobility",
    label: "Walking / Mobility",
    options: ["Independent", "Walking aid", "Assistance required", "Unable"],
  },
  {
    key: "personalHygiene",
    label: "Personal Hygiene",
    options: ["Independent", "Needs assistance", "Dependent"],
  },
  {
    key: "selfCareAbility",
    label: "Self-Care Ability",
    options: ["Independent", "Partially dependent", "Fully dependent"],
  },
  {
    key: "levelOfAssistanceRequired",
    label: "Level of Assistance Required",
    options: ["None", "Minimal", "Moderate", "Maximum", "Total"],
  },
];

export const DAILY_LIVING_ASSESSMENT_FIELDS = [
  {
    key: "foodFluidIntake",
    label: "Food & Fluid Intake",
    options: ["Adequate", "Reduced", "Poor; feeding assistance required"],
  },
  {
    key: "urineBowelOutput",
    label: "Urine & Bowel Output",
    options: ["Normal", "Abnormal; continence status; catheter status"],
  },
  {
    key: "skinPressureAreas",
    label: "Skin & Pressure Areas",
    options: ["Intact", "Redness", "Wound", "Pressure sore"],
  },
];

const EMPTY_SECTION = {};

const ElderlyChecklistField = ({ field, value, onChange, readOnly }) => {
  if (readOnly) {
    return (
      <Col md={6} xs={12} className="mb-2">
        <p className="fs-xs-9 fs-md-11 mb-0">
          <span className="display-6 font-semi-bold fs-xs-10 fs-md-14 me-3">
            {field.label}:-
          </span>
          {value || "-"}
        </p>
      </Col>
    );
  }

  return (
    <Col md={6} className="mb-3">
      <FormGroup className="mb-0">
        <Label htmlFor={field.key}>{field.label}</Label>
        <Select
          inputId={field.key}
          name={field.key}
          classNamePrefix="select"
          placeholder="-- Select --"
          isClearable
          options={field.options.map((opt) => ({ value: opt, label: opt }))}
          value={value ? { value, label: value } : null}
          onChange={(selected) =>
            onChange(field.key, selected ? selected.value : "")
          }
        />
      </FormGroup>
    </Col>
  );
};

const ElderlyChecklistSection = ({
  title,
  fields,
  values,
  onChange,
  readOnly,
}) => (
  <div className="mb-4">
    <div className="d-flex align-items-center flex-wrap gap-2 gap-md-3 mb-3">
      <h6 className="fs-xs-12 fs-md-14 display-6 mb-0">{title}</h6>
      <Divider />
    </div>
    <Row>
      {fields.map((field) => (
        <ElderlyChecklistField
          key={field.key}
          field={field}
          value={values?.[field.key] || ""}
          onChange={onChange}
          readOnly={readOnly}
        />
      ))}
    </Row>
  </div>
);

const ElderlyChecklist = ({ value, onChange, readOnly = false }) => {
  const functionalAssessment = value?.functionalAssessment || EMPTY_SECTION;
  const dailyLivingAssessment = value?.dailyLivingAssessment || EMPTY_SECTION;

  const handleSectionChange = (section) => (key, fieldValue) => {
    onChange({
      ...value,
      [section]: {
        ...(value?.[section] || {}),
        [key]: fieldValue,
      },
    });
  };

  return (
    <div>
      <ElderlyChecklistSection
        title="Functional Assessment"
        fields={FUNCTIONAL_ASSESSMENT_FIELDS}
        values={functionalAssessment}
        onChange={readOnly ? undefined : handleSectionChange("functionalAssessment")}
        readOnly={readOnly}
      />
      <ElderlyChecklistSection
        title="Daily Living Assessment"
        fields={DAILY_LIVING_ASSESSMENT_FIELDS}
        values={dailyLivingAssessment}
        onChange={readOnly ? undefined : handleSectionChange("dailyLivingAssessment")}
        readOnly={readOnly}
      />
    </div>
  );
};

export default ElderlyChecklist;
