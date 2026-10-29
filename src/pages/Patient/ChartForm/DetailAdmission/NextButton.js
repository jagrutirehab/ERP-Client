import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { DetailHistoryClearContext } from "./DetailHistoryClearContext";

const NextButton = ({
  setFormStep,
  step,
  onBeforeNext,
  onClearForm: propOnClearForm,
}) => {
  const context = useContext(DetailHistoryClearContext);
  const onClear = propOnClearForm || context?.onClearForm;
  const isGenerating = context?.isGenerating || false;

  const handleClick = () => {
    if (onBeforeNext) {
      const isValid = onBeforeNext();
      if (!isValid) return;
    }
    setFormStep(step);
  };

  return (
    <React.Fragment>
      <div className="d-flex justify-content-end align-items-center gap-2 mt-3">
        {onClear && (
          <Button
            type="button"
            color="outline-danger"
            size="sm"
            onClick={onClear}
            disabled={isGenerating}
            title="Clear all form fields and saved draft"
          >
            <i className="ri-delete-bin-line me-1"></i> Clear Form
          </Button>
        )}
        <Button
          className="text-white"
          onClick={handleClick}
          size="sm"
          color="success"
          disabled={isGenerating}
        >
          Next
        </Button>
      </div>
    </React.Fragment>
  );
};

NextButton.propTypes = {
  setFormStep: PropTypes.func,
  step: PropTypes.string,
  onBeforeNext: PropTypes.func,
  onClearForm: PropTypes.func,
};

export default NextButton;
