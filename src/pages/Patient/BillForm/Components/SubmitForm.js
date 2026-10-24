import React from "react";
import { Button } from "reactstrap";
import PropTypes from "prop-types";
import { REFUND } from "../../../../Components/constants/patient";

const SubmitForm = ({
  toggleForm,
  bill,
  enteredRefundAmount,
  // Save/cancel guards — see Components/billGuards.js.
  blockSave,
  saveReason,
  blockCancel,
  cancelReason,
}) => {
  const refundAmount = parseFloat(enteredRefundAmount);
  const isRefundInvalid = bill === REFUND && (!refundAmount || refundAmount <= 0 || Number.isNaN(refundAmount));

  return (
    <div>
      {(saveReason || cancelReason) && (
        <div className="text-danger fs-11 text-end mb-2">
          <i className="ri-error-warning-line me-1"></i>
          {saveReason || cancelReason}
        </div>
      )}
      <div className="d-flex justify-content-end gap-3">
        <Button
          size="sm"
          onClick={toggleForm}
          className="btn btn-danger ms-2"
          type="button"
          disabled={blockCancel}
          title={cancelReason || undefined}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          type="submit"
          disabled={isRefundInvalid || blockSave}
          title={saveReason || undefined}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

SubmitForm.propTypes = {
  toggleForm: PropTypes.func,
  bill: PropTypes.string,
  enteredRefundAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  blockSave: PropTypes.bool,
  saveReason: PropTypes.string,
  blockCancel: PropTypes.bool,
  cancelReason: PropTypes.string,
};

export default SubmitForm;
