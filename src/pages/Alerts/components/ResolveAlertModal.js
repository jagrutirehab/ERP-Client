import { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Input,
  Spinner,
} from "reactstrap";

// Small modal for closing the loop on an alert. The user types what action
// they took and clicks Resolve. The note is required — the Resolve button stays
// disabled until there's non-whitespace text. Resets its textarea whenever it
// opens for a different alert.
const ResolveAlertModal = ({ isOpen, alert, submitting, onClose, onSubmit }) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) setNote("");
  }, [isOpen, alert?._id]);

  const trimmed = note.trim();

  const handleSubmit = () => {
    if (!trimmed || submitting) return;
    onSubmit(trimmed);
  };

  return (
    <Modal isOpen={isOpen} toggle={submitting ? undefined : onClose} centered>
      <ModalHeader toggle={submitting ? undefined : onClose}>
        Resolve Alert
      </ModalHeader>
      <ModalBody>
        {alert?.message && (
          <p className="text-muted fs-13 mb-3" style={{ lineHeight: 1.4 }}>
            <i className="bx bx-bell me-1" />
            {alert.message}
          </p>
        )}
        <Label for="sop-resolution-note" className="form-label">
          Resolution note <span className="text-danger">*</span>
        </Label>
        <Input
          id="sop-resolution-note"
          type="textarea"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe the action taken to resolve this alert…"
          disabled={submitting}
          autoFocus
        />
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={submitting || !trimmed}
        >
          {submitting && <Spinner size="sm" className="me-1" />}
          Resolve
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ResolveAlertModal;
