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

// Approval happens inline in the table — only rejection needs a modal, because
// it requires a written reason.
const RejectPhotoModal = ({
  isOpen,
  toggle,
  locationLabel,
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

  const handleSubmit = () => {
    setError("");
    if (!remarks.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    onConfirm(remarks.trim());
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Reject Location</ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}

        <p className="mb-3">
          Reject <strong>{locationLabel || "this location"}</strong>? The
          uploader will be able to replace the photos and resubmit.
        </p>

        <Label htmlFor="reject-remarks">
          Reason <span className="text-danger">*</span>
        </Label>
        <Input
          id="reject-remarks"
          type="textarea"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Explain what needs to be corrected..."
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle} disabled={loading}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-1" /> Processing...
            </>
          ) : (
            "Reject"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RejectPhotoModal;
