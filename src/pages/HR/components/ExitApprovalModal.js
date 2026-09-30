import { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Spinner,
} from "reactstrap";
import { updateExitBiometricStatus } from "../../../helpers/backend_helper";

const ExitApprovalModal = ({ isOpen, toggle, row, status, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRejection = status === "rejected";

  const handleSubmit = async () => {
    if (isRejection && !reason.trim()) {
      setError("Reason is mandatory for rejection.");
      return;
    }

    setLoading(true);
    try {
      await updateExitBiometricStatus(row?._id, {
        status,
        ...(reason.trim() && { reason: reason.trim() }),
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setError("");
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>
        {isRejection ? "Reject Request" : "Approve Request"}
      </ModalHeader>
      <ModalBody>
        <p className="text-muted mb-3">
          {isRejection
            ? "You are rejecting the exit biometric request for "
            : "You are approving the exit biometric request for "}
          <strong>{row?.employee?.name || "this employee"}</strong>.
        </p>
        <FormGroup>
          <Label for="reason">
            Reason {isRejection && <span className="text-danger">*</span>}
          </Label>
          <Input
            type="textarea"
            id="reason"
            rows={4}
            placeholder={
              isRejection
                ? "Enter reason for rejection (required)"
                : "Enter reason (optional)"
            }
            value={reason}
            invalid={!!error}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
          />
          {error && <FormFeedback>{error}</FormFeedback>}
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          outline
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          color={isRejection ? "danger" : "success"}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : isRejection ? "Reject" : "Approve"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ExitApprovalModal;
