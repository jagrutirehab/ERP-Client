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

// Confirmation modal for resolving an alert. A note explaining WHY is
// MANDATORY — an alert closed with no recorded reason is unanswerable months
// later. The note is stored as a normal notes[] entry tagged "RESOLUTION", so
// it shows in the alert's notes column alongside any follow-up commentary.
//
// Deliberately mirrors AddNoteModal's textarea behaviour (trimmed state, reset
// on open, Ctrl/Cmd+Enter to submit) rather than inventing a second pattern for
// what is the same interaction.
const ResolveAlertModal = ({ isOpen, alert, submitting, onClose, onSubmit }) => {
  const [text, setText] = useState("");

  // Reset whenever the modal opens or the target changes, so a cancelled
  // attempt never prefills the next alert's note.
  useEffect(() => {
    if (isOpen) setText("");
  }, [isOpen, alert?._id]);

  const trimmed = text.trim();

  const handleSubmit = () => {
    if (!trimmed || submitting) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
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

        <div
          className="p-3 rounded mb-3"
          style={{
            background: "rgba(25, 135, 84, 0.08)",
            borderLeft: "4px solid #198754",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bx bx-check-circle text-success fs-18" />
            <span className="fw-medium">Mark this alert as resolved?</span>
          </div>
          <small className="text-muted d-block mt-1">
            This action will close the alert. You can still add further notes
            afterwards.
          </small>
        </div>

        <Label for="alert-resolution-note" className="form-label">
          Resolution note <span className="text-danger">*</span>
        </Label>
        <Input
          id="alert-resolution-note"
          type="textarea"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What was done about this alert? (Ctrl+Enter to resolve)"
          disabled={submitting}
          autoFocus
        />
        <small className="text-muted">
          Required. This is recorded against the alert as the reason it was
          closed, and appears in its notes.
        </small>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          color="success"
          onClick={handleSubmit}
          disabled={submitting || !trimmed}
        >
          {submitting && <Spinner size="sm" className="me-1" />}
          <i className="bx bx-check me-1" />
          Resolve
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ResolveAlertModal;
