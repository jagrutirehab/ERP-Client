import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";

const NextButton = ({ setFormStep, step }) => {
  return (
    <React.Fragment>
      <div className="text-end">
        <Button
          className="text-white"
          onClick={() => setFormStep(step)}
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
