import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, Input } from "reactstrap";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { renderStatusBadge } from "../../../Components/Common/renderStatusBadge";
import { formatDateTime } from "../../../utils/time";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Field = ({ label, children }) => (
  <div className="d-flex justify-content-between py-2 border-bottom">
    <span className="text-muted" style={{ fontSize: 13 }}>
      {label}
    </span>
    <span className="fw-medium text-end" style={{ fontSize: 13 }}>
      {children}
    </span>
  </div>
);

const ReviewModal = ({ isOpen, toggle, submission, onApprove, onReject }) => {
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRejecting(false);
      setRejectNote("");
    }
  }, [isOpen, submission?.id]);

  if (!submission) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>Review submission</ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-0">{submission.categoryName}</h5>
            <span className="text-muted" style={{ fontSize: 13 }}>
              {submission.centreName}
            </span>
          </div>
          {renderStatusBadge(submission.status.toUpperCase())}
        </div>

        <Field label="Submitted by">{submission.submittedBy}</Field>
        <Field label="Submitted on">{formatDateTime(submission.submittedAt)}</Field>
        <Field label="Issuing authority">{submission.issuingAuthority || "—"}</Field>
        <Field label="Licence / registration no.">{submission.licenceNo || "—"}</Field>
        <Field label="Issued on">{formatDate(submission.issuedOn)}</Field>
        <Field label="Valid till">
          {submission.noExpiry ? "No expiry (lifetime)" : formatDate(submission.validTill)}
        </Field>
        {!submission.noExpiry && <Field label="Renewal lead time">{submission.leadDays} days</Field>}
        <Field label="Responsible owner">{submission.owner || "—"}</Field>
        <Field label="Escalate to">{submission.escalateTo || "—"}</Field>

        {submission.notes && (
          <div className="py-2 border-bottom">
            <div className="text-muted mb-1" style={{ fontSize: 13 }}>
              Notes / conditions
            </div>
            <div style={{ fontSize: 13 }}>{submission.notes}</div>
          </div>
        )}

        <div className="py-2">
          <div className="text-muted mb-2" style={{ fontSize: 13 }}>
            Documents
          </div>
          <div className="d-flex flex-column gap-2">
            {submission.fileNames.map((f) => (
              <div key={f} className="d-flex align-items-center gap-2 border rounded p-2">
                <FileText size={16} className="text-muted flex-shrink-0" />
                <span className="text-truncate" style={{ fontSize: 13 }}>
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>

        {submission.status === "rejected" && submission.note && (
          <div className="mt-2 p-2 rounded" style={{ background: "#F9DEDA", fontSize: 13 }}>
            <strong>Rejection reason:</strong> {submission.note}
          </div>
        )}

        {submission.status === "pending" && rejecting && (
          <div className="mt-3">
            <Label>Reason for rejecting (shown to the centre)</Label>
            <Input
              type="textarea"
              rows={2}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </ModalBody>
      {submission.status === "pending" && (
        <ModalFooter>
          {rejecting ? (
            <>
              <Button color="light" className="border" onClick={() => setRejecting(false)}>
                Back
              </Button>
              <Button
                color="danger"
                className="text-white"
                disabled={!rejectNote.trim()}
                onClick={() => {
                  onReject(submission.id, rejectNote.trim());
                  toggle();
                }}
              >
                Confirm reject
              </Button>
            </>
          ) : (
            <>
              <Button color="light" className="border text-danger" onClick={() => setRejecting(true)}>
                <XCircle size={14} className="me-1" /> Reject
              </Button>
              <Button
                color="success"
                className="text-white"
                onClick={() => {
                  onApprove(submission.id);
                  toggle();
                }}
              >
                <CheckCircle2 size={14} className="me-1" /> Approve
              </Button>
            </>
          )}
        </ModalFooter>
      )}
    </Modal>
  );
};

export default ReviewModal;
