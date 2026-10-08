import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Spinner, Alert } from "reactstrap";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { getAiFilledFields, getAiFieldLabel } from "./aiFilledFields";

const MedicineRequisitionReviewModal = ({
  isOpen,
  mode,
  row,
  reviewRemarks,
  setReviewRemarks,
  closeModal,
  submitReview,
  loading,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={closeModal} centered size="md">
      <ModalHeader
        toggle={closeModal}
      >
        {mode === "approve" ? "Approve Requisition" : "Reject Requisition"}
      </ModalHeader>
      <ModalBody>
        {row && (
          <div className="mb-4">
            <h6 className="fw-semibold mb-1">Requisition {row.requisitionNumber}</h6>
            <p className="text-muted mb-0">
              Proposed Medicine: {capitalizeWords(row.proposedMedicine?.name || "")} (
              {row.proposedMedicine?.type})
            </p>
          </div>
        )}
        {mode === "approve" && getAiFilledFields(row).length > 0 && (
          <Alert color="warning" className="mb-3 py-2" style={{ fontSize: 13 }}>
            <strong>AI generated fields:</strong>{" "}
            {getAiFilledFields(row).map(getAiFieldLabel).join(", ")}.
            These were suggested by AI (Gemini). Please verify them carefully before approving.
          </Alert>
        )}
        <div className="form-group">
          <label className={`form-label ${mode === "reject" ? "required" : ""}`}>
            Remarks {mode !== "reject" && "(Optional)"}
          </label>
          <Input
            type="textarea"
            rows={3}
            placeholder={mode === "approve" ? "Add approval remarks..." : "Reason for rejection..."}
            value={reviewRemarks}
            onChange={(e) => setReviewRemarks(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          color={mode === "approve" ? "success" : "danger"}
          onClick={submitReview}
          disabled={loading || (mode === "reject" && !reviewRemarks.trim())}
        >
          {loading ? <Spinner size="sm" /> : mode === "approve" ? "Approve" : "Reject"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MedicineRequisitionReviewModal;
