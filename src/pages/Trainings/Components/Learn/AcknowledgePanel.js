import React, { useCallback, useState } from "react";
import { Button, FormGroup, Input, Label } from "reactstrap";
import { toast } from "react-toastify";
import { acknowledgeTraining, getOwnSignedCopy } from "../../../../helpers/backend_helper";
import { getErrorMessage } from "../../Helpers/learnHelpers";
import ConfirmModal from "../ConfirmModal";
import SignedCopyViewer from "../Declaration/SignedCopyViewer";

const AcknowledgePanel = ({
  trainingId,
  acknowledged,
  hasDeclaration,
  canAcknowledge,
  onAcknowledged,
}) => {
  const [checked, setChecked] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewingCopy, setViewingCopy] = useState(false);
  const loadOwnCopy = useCallback(() => getOwnSignedCopy(trainingId), [trainingId]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await acknowledgeTraining(trainingId);
      toast.success("Acknowledged successfully");
      if (onAcknowledged) onAcknowledged();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to acknowledge"));
    } finally {
      setLoading(false);
      setConfirmModal(false);
    }
  };

  if (acknowledged) {
    return (
      <div className="d-flex align-items-center gap-2 text-success p-3 border rounded">
        <i className="ri-checkbox-circle-fill fs-5" />
        <span className="small fw-semibold">
          You have acknowledged this training
        </span>
        {hasDeclaration && (
          <button
            type="button"
            className="btn btn-outline-success btn-sm ms-auto"
            onClick={() => setViewingCopy(true)}
          >
            View my signed declaration
          </button>
        )}
        <SignedCopyViewer
          isOpen={viewingCopy}
          onClose={() => setViewingCopy(false)}
          title="My signed declaration"
          loader={loadOwnCopy}
        />
      </div>
    );
  }

  if (!canAcknowledge) {
    return (
      <div className="p-3 border rounded text-muted small">
        You do not have permission to acknowledge trainings.
      </div>
    );
  }

  return (
    <div className="p-3 border rounded">
      <FormGroup check className="mb-3">
        <Input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <Label check className="small">
          I acknowledge that I have read, understood, and will adhere to the
          instructions and policies described in this training.
        </Label>
      </FormGroup>
      <Button
        color="primary"
        disabled={!checked}
        onClick={() => setConfirmModal(true)}
      >
        I Acknowledge
      </Button>

      <ConfirmModal
        isOpen={confirmModal}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(false)}
        loading={loading}
      />
    </div>
  );
};

export default AcknowledgePanel;
