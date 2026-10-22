import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
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

  const updateField = (name, value) => {
    const next = { ...checklistValues, [name]: value };
    validation.setFieldValue("elderlyChecklistFields", JSON.stringify(next));
    if (attempted) {
      runValidation(next);
    }
  };

  const touchedObject = useMemo(() => {
    if (!attempted) return {};
    const touched = {};
    elderlyFunctionalChecklistFields.forEach((field) => {
      if (field.name) touched[field.name] = true;
    });
    return touched;
  }, [attempted]);

  const checklistAdapter = {
    values: checklistValues,
    handleChange: (e) => {
      const { name, value } = e.target;
      updateField(name, value);
    },
    setFieldValue: (name, value) => {
      updateField(name, value);
    },
    handleBlur: () => {},
    touched: touchedObject,
    errors: attempted ? errors : {},
  };

  const handleBeforeNext = () => {
    setAttempted(true);
    return runValidation(checklistValues);
  };

  return (
    <React.Fragment>
      <div>
        <RenderFields
          fields={elderlyFunctionalChecklistFields}
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
};

export default ElderlyChecklistForm;
