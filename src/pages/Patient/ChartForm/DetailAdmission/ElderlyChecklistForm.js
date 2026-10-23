import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Input, Label } from "reactstrap";
import RenderFields from "../../../../Components/Common/RenderFields";
import { elderlyFunctionalChecklistFields } from "../../../../Components/constants/patient";
import NextButton from "./NextButton";
import {
  parseElderlyChecklist,
  validateElderlyChecklist,
} from "../../../../utils/elderlyChecklistValidation";

const ElderlyChecklistForm = ({
  validation,
  setFormStep,
  step,
  forceShowErrors,
  patient,
}) => {
  const [attempted, setAttempted] = useState(Boolean(forceShowErrors));
  const [errors, setErrors] = useState({});

  const checklistValues = useMemo(() => {
    return parseElderlyChecklist(validation.values.elderlyChecklistFields);
  }, [validation.values.elderlyChecklistFields]);

  const runValidation = (currentValues) => {
    const res = validateElderlyChecklist(currentValues);
    setErrors(res.errors);
    return res.isValid;
  };

  useEffect(() => {
    if (forceShowErrors) {
      setAttempted(true);
      runValidation(checklistValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceShowErrors]);

  const latestValuesRef = React.useRef(checklistValues);
  latestValuesRef.current = checklistValues;

  const updateField = (name, value) => {
    const key = name.includes(".") ? name.split(".").pop() : name;
    const next = { ...latestValuesRef.current, [key]: value };
    latestValuesRef.current = next;
    validation.setFieldValue("elderlyChecklistFields", JSON.stringify(next));
    if (attempted) {
      runValidation(next);
    }
  };

  // const centerId = patient?.center?._id || patient?.center || "";

  // useEffect(() => {
  //   if (!latestValuesRef.current.checklistDateTime) {
  //     updateField("checklistDateTime", new Date().toISOString().slice(0, 10));
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   if (centerId && latestValuesRef.current.center !== centerId) {
  //     updateField("center", centerId);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [centerId]);

  const touchedObject = useMemo(() => {
    if (!attempted) return {};
    const touched = {};
    elderlyFunctionalChecklistFields.forEach((field) => {
      if (field.name) touched[field.name] = true;
    });
    return touched;
  }, [attempted]);

  const checklistAdapter = {
    values: {
      ...checklistValues,
      elderlyChecklistFields: checklistValues,
    },
    handleChange: (e) => {
      const { name, value } = e.target;
      updateField(name, value);
    },
    setFieldValue: (name, value) => {
      updateField(name, value);
    },
    handleBlur: () => {},
    touched: {
      ...touchedObject,
      elderlyChecklistFields: touchedObject,
    },
    errors: attempted
      ? {
          ...errors,
          elderlyChecklistFields: errors,
        }
      : {},
  };

  const handleBeforeNext = () => {
    setAttempted(true);
    return runValidation(latestValuesRef.current || checklistValues);
  };

  return (
    <React.Fragment>
      <div>
        {/* <Row>
          <Col xs={12}>
            <div className="mb-3">
              <Label htmlFor="residentNameId" className="form-label">
                Resident Name / ID <span className="text-danger">*</span>
              </Label>
              <Input
                name="residentNameId"
                id="residentNameId"
                className="form-control"
                type="text"
                onChange={(e) => updateField("residentNameId", e.target.value)}
                value={checklistValues.residentNameId || ""}
                invalid={attempted && Boolean(errors.residentNameId)}
              />
              {attempted && errors.residentNameId && (
                <div className="text-danger small mt-1">
                  {errors.residentNameId}
                </div>
              )}
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={6}>
            <div className="mb-3">
              <Label htmlFor="checklistCentre" className="form-label">
                Centre <span className="text-danger">*</span>
              </Label>
              <Input
                name="checklistCentre"
                id="checklistCentre"
                className="form-control"
                type="text"
                value={patient?.center?.title || ""}
                disabled
                invalid={attempted && Boolean(errors.center)}
              />
              {attempted && errors.center && (
                <div className="text-danger small mt-1">{errors.center}</div>
              )}
            </div>
          </Col>
          <Col xs={12} lg={6}>
            <div className="mb-3">
              <Label htmlFor="checklistDateTime" className="form-label">
                Date / Time <span className="text-danger">*</span>
              </Label>
              <Input
                name="checklistDateTime"
                id="checklistDateTime"
                className="form-control"
                type="date"
                onChange={(e) =>
                  updateField("checklistDateTime", e.target.value)
                }
                value={checklistValues.checklistDateTime || ""}
                invalid={attempted && Boolean(errors.checklistDateTime)}
              />
              {attempted && errors.checklistDateTime && (
                <div className="text-danger small mt-1">
                  {errors.checklistDateTime}
                </div>
              )}
            </div>
          </Col>
        </Row> */}
        <RenderFields
          fields={elderlyFunctionalChecklistFields.filter(
            (field) =>
              field.name !== "residentNameId" &&
              field.name !== "checklistDateTime",
          )}
          validation={checklistAdapter}
        />
        {attempted && Object.keys(errors).length > 0 && (
          <p className="text-danger small mt-2">
            Please fill in all required checklist fields before continuing.
          </p>
        )}
      </div>
      <NextButton
        setFormStep={setFormStep}
        step={step}
        onBeforeNext={handleBeforeNext}
      />
    </React.Fragment>
  );
};

ElderlyChecklistForm.propTypes = {
  validation: PropTypes.object.isRequired,
  setFormStep: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired,
  forceShowErrors: PropTypes.bool,
  patient: PropTypes.object,
};

export default ElderlyChecklistForm;
