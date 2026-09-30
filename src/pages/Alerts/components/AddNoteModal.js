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

// Modal for adding a free-text note to an alert. Notes are independent of
// resolution — the user can add as many notes as they like without closing
// the alert. Resets its textarea whenever the target alert changes.
const AddNoteModal = ({ isOpen, alert, submitting, onClose, onSubmit }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (isOpen) setText("");
  }, [isOpen, alert?._id]);

  const trimmed = text.trim();

  const handleSubmit = () => {
    if (!trimmed || submitting) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd+Enter submits the form
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
  };

  return (
    <Modal isOpen={isOpen} toggle={submitting ? undefined : onClose} centered>
      <ModalHeader toggle={submitting ? undefined : onClose}>
        Add Note
      </ModalHeader>
      <ModalBody>
        {alert?.message && (
          <p className="text-muted fs-13 mb-3" style={{ lineHeight: 1.4 }}>
            <i className="bx bx-bell me-1" />
            {alert.message}
          </p>
        )}
        <Label for="alert-note-text" className="form-label">
          Note <span className="text-danger">*</span>
        </Label>
        <Input
          id="alert-note-text"
          type="textarea"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a note about this alert… (Ctrl+Enter to save)"
          disabled={submitting}
          autoFocus
        />
        <small className="text-muted">
          You can add multiple notes. Notes do not resolve the alert.
        </small>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          color="info"
          onClick={handleSubmit}
          disabled={submitting || !trimmed}
        >
          {submitting && <Spinner size="sm" className="me-1" />}
          Save Note
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddNoteModal;
