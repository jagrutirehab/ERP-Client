import React from "react";
import { Button } from "reactstrap";
import PropTypes from "prop-types";
import { REFUND } from "../../../../Components/constants/patient";

const SubmitForm = ({ toggleForm, bill, enteredRefundAmount }) => {
  const refundAmount = parseFloat(enteredRefundAmount);
  const isRefundInvalid = bill === REFUND && (!refundAmount || refundAmount <= 0 || Number.isNaN(refundAmount));

  return (
    <div className="d-flex justify-content-end gap-3">
      <Button
        size="sm"
        onClick={toggleForm}
        className="btn btn-danger ms-2"
        type="button"
      >
        Cancel
      </Button>
      <Button size="sm" type="submit" disabled={isRefundInvalid}>
        Save
      </Button>
    </div>
  );
};

SubmitForm.propTypes = {
  toggleForm: PropTypes.func,
  bill: PropTypes.string,
  enteredRefundAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SubmitForm;
