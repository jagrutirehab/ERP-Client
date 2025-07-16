import React from "react";
import { Button } from "reactstrap";

const SubmitForm = ({ toggleForm }) => {
  return (
    <React.Fragment>
      <div className="d-flex justify-content-end gap-3">
        <Button
          size="sm"
          onClick={() => {
            toggleForm();
          }}
          className="btn btn-danger ms-2"
          type="button"
        >
          Cancel
        </Button>
        <Button size="sm" type="submit">
          Save
        </Button>
      </div>
    </React.Fragment>
  );
};

SubmitForm.propTypes = {};

export default SubmitForm;
