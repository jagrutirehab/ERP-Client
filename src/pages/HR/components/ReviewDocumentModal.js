import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Alert,
  Spinner,
} from "reactstrap";

const ReviewDocumentModal = ({
  isOpen,
  toggle,
  actionType,
  fileName,
  onConfirm,
  loading,
}) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRemarks("");
      setError("");
    }
  }, [isOpen]);

  const isReject = actionType === "rejected";

  const handleSubmit = () => {
    setError("");
    if (isReject && !remarks.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    onConfirm(remarks.trim());
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        {isReject ? "Reject Document" : "Approve Document"}
      </ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}

        <p className="mb-3">
          {isReject ? "Reject" : "Approve"}{" "}
          <strong>{fileName || "this document"}</strong>?
        </p>

        <Label htmlFor="remarks">
          Remarks {isReject && <span className="text-danger">*</span>}
          {!isReject && <span className="text-muted small"> (optional)</span>}
        </Label>
        <Input
          id="remarks"
          type="textarea"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder={
            isReject
              ? "Explain why this document is being rejected..."
              : "Add any notes (optional)..."
          }
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle} disabled={loading}>
          Cancel
        </Button>
        <Button
          color={isReject ? "danger" : "success"}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-1" /> Processing...
            </>
          ) : isReject ? (
            "Reject"
          ) : (
            "Approve"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReviewDocumentModal;
