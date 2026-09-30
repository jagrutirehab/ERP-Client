import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";

const NextButton = ({ setFormStep, step, onBeforeNext }) => {
  const handleClick = () => {
    if (onBeforeNext) {
      const isValid = onBeforeNext();
      if (!isValid) return;
    }
    setFormStep(step);
  };

  return (
    <React.Fragment>
      <div className="text-end">
        <Button
          className="text-white"
          onClick={handleClick}
          size="sm"
          color="success"
        >
          Next
        </Button>
      </div>
    </React.Fragment>
  );
};

NextButton.propTypes = {};

export default NextButton;
