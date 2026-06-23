import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";

// Confirmation modal for resolving an alert. No note required — resolution
// is a simple one-click action. Free-text notes have their own "Add Note" flow.
const ResolveAlertModal = ({ isOpen, alert, submitting, onClose, onSubmit }) => {
  const handleSubmit = () => {
    if (submitting) return;
    onSubmit();
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
          className="p-3 rounded"
          style={{
            background: "rgba(25, 135, 84, 0.08)",
            borderLeft: "4px solid #198754",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="bx bx-check-circle text-success fs-18" />
            <span className="fw-medium">
              Mark this alert as resolved?
            </span>
          </div>
          <small className="text-muted d-block mt-1">
            This action will close the alert. You can still add notes before or
            after resolving.
          </small>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          color="success"
          onClick={handleSubmit}
          disabled={submitting}
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
