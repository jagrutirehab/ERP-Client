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

const ReviewModal = ({ isOpen, toggle, submission, onApprove, onReject, busy = false }) => {
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRejecting(false);
      setRejectNote("");
    }
  }, [isOpen, submission?.id]);

  if (!submission) return null;

  const handleApprove = async () => {
    const ok = await onApprove(submission.id);
    if (ok) toggle();
  };

  const handleReject = async () => {
    const ok = await onReject(submission.id, rejectNote.trim());
    if (ok) toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={busy ? undefined : toggle} centered size="lg">
      <ModalHeader toggle={busy ? undefined : toggle}>Review submission</ModalHeader>
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
            {(submission.files || []).map((f) => (
              <a
                key={f._id || f.url}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="d-flex align-items-center gap-2 border rounded p-2 text-decoration-none text-body"
              >
                <FileText size={16} className="text-muted flex-shrink-0" />
                <span className="text-truncate flex-grow-1" style={{ fontSize: 13 }}>
                  {f.originalName || f.name}
                </span>
                {f.role === "PRIMARY_CERTIFICATE" && (
                  <span className="badge bg-success-subtle text-success" style={{ fontSize: 11 }}>
                    Primary
                  </span>
                )}
              </a>
            ))}
            {!submission.files?.length && (
              <span className="text-muted" style={{ fontSize: 13 }}>
                No files
              </span>
            )}
          </div>
        </div>

        {submission.status === "rejected" && submission.note && (
          <div className="mt-2 p-2 rounded" style={{ background: "#F9DEDA", fontSize: 13 }}>
            <strong>Rejection reason:</strong> {submission.note}
          </div>
        )}

        {submission.status === "approved" && submission.note && (
          <div className="mt-2 p-2 rounded" style={{ background: "#E3F1EA", fontSize: 13 }}>
            <strong>Reviewer comment:</strong> {submission.note}
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
              placeholder="e.g. Certificate is not readable, please re-upload"
              autoFocus
            />
          </div>
        )}
      </ModalBody>

      {submission.status === "pending" && (
        <ModalFooter>
          {rejecting ? (
            <>
              <Button color="light" className="border" disabled={busy} onClick={() => setRejecting(false)}>
                Back
              </Button>
              <Button
                color="danger"
                className="text-white"
                disabled={busy || rejectNote.trim().length < 3}
                onClick={handleReject}
              >
                {busy ? "Rejecting..." : "Confirm reject"}
              </Button>
            </>
          ) : (
            <>
              <Button
                color="light"
                className="border text-danger"
                disabled={busy}
                onClick={() => setRejecting(true)}
              >
                <XCircle size={14} className="me-1" /> Reject
              </Button>
              <Button color="success" className="text-white" disabled={busy} onClick={handleApprove}>
                <CheckCircle2 size={14} className="me-1" /> {busy ? "Approving..." : "Approve"}
              </Button>
            </>
          )}
        </ModalFooter>
      )}
    </Modal>
  );
};

export default ReviewModal;