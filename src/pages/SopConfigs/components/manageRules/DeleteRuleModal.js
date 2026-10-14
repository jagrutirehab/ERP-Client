import { useState } from "react";
import {
  Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Spinner,
} from "reactstrap";

/**
 * Type-to-confirm deletion. The Delete button only enables when the typed
 * text matches the rule name exactly — guards against fat-finger destructive
 * clicks (PagerDuty pattern).
 */
const DeleteRuleModal = ({ target, onCancel, onConfirm }) => {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const canDelete = !!target && confirmText === target.ruleName;

  const handleCancel = () => {
    setConfirmText("");
    onCancel();
  };

  const handleConfirm = async () => {
    if (!canDelete) return;
    setDeleting(true);
    const ok = await onConfirm(target);
    setDeleting(false);
    if (ok) setConfirmText("");
  };

  return (
    <Modal isOpen={!!target} toggle={handleCancel} centered>
      <ModalHeader toggle={handleCancel}>Delete rule</ModalHeader>
      <ModalBody>
        <p>
          This soft-deletes <strong>{target?.ruleName}</strong>. Historical alerts
          will keep pointing at it but it won't fire new ones.
        </p>
        <p className="mb-2">Type the rule name to confirm:</p>
        <Input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={target?.ruleName}
          autoFocus
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={handleCancel} disabled={deleting}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleConfirm} disabled={!canDelete || deleting}>
          {deleting ? <Spinner size="sm" /> : "Delete rule"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteRuleModal;
