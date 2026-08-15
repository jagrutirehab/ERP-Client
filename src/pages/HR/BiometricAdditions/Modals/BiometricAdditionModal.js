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
import { actionOnBiometricAdditionRequest } from "../../../../helpers/backend_helper";
import { toast } from "react-toastify";

const BiometricAdditionModal = ({
  isOpen,
  toggle,
  row,
  status,
  assignedTo,
  onSuccess,
}) => {
  const [additionReason, setAdditionReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRejection = status === "addition_rejected";

  const handleSubmit = async () => {
    if (isRejection && !additionReason.trim()) {
      setError("Reason is mandatory for rejection.");
      return;
    }

    setLoading(true);
    try {
      await actionOnBiometricAdditionRequest({
        doc_id: row?._id,
        status,
        ...(assignedTo && { assignedTo }),
        ...(additionReason.trim() && { additionReason: additionReason.trim() }),
      });
      toast.success(
        isRejection
          ? "Biometric addition request rejected successfully"
          : "Biometric addition request approved successfully",
      );
      onSuccess?.();
      handleClose();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to action request";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setAdditionReason("");
    setError("");
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>
        {isRejection ? "Reject Addition Request" : "Approve Addition Request"}
      </ModalHeader>
      <ModalBody>
        <p className="text-muted mb-3">
          {isRejection
            ? "You are rejecting the biometric addition request for "
            : "You are approving the biometric addition request for "}
          <strong>{row?.employee?.name || "this employee"}</strong>.
        </p>
        <FormGroup>
          <Label for="additionReason">
            Reason {isRejection && <span className="text-danger">*</span>}
          </Label>
          <Input
            type="textarea"
            id="additionReason"
            rows={4}
            placeholder={
              isRejection
                ? "Enter reason for rejection (required)"
                : "Enter reason (optional)"
            }
            value={additionReason}
            invalid={!!error}
            onChange={(e) => {
              setAdditionReason(e.target.value);
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

export default BiometricAdditionModal;
