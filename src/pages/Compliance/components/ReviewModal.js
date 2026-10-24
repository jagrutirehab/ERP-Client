import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, Input } from "reactstrap";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { renderStatusBadge } from "../../../Components/Common/renderStatusBadge";
import PreviewFile from "../../../Components/Common/PreviewFile";
import { formatDateTime } from "../../../utils/time";
import { capitalizeWords } from "../../../utils/toCapitalize";

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

const ReviewModal = ({ isOpen, toggle, submission, onApprove, onReject, busy = false, readOnly = false }) => {
  const [remarks, setRemarks] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRemarks("");
    }
  }, [isOpen, submission?.id]);

  const openPreview = (f) => {
    setPreviewFile({ url: f.url, type: f.type, originalName: f.originalName || f.name });
    setPreviewOpen(true);
  };

  if (!submission) return null;

  const canReject = remarks.trim().length >= 3;

  const handleApprove = async () => {
    const ok = await onApprove(submission.id, remarks.trim());
    if (ok) toggle();
  };

  const handleReject = async () => {
    if (!canReject) return;
    const ok = await onReject(submission.id, remarks.trim());
    if (ok) toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={busy ? undefined : toggle} centered size="lg">
      <ModalHeader toggle={busy ? undefined : toggle}>Review submission</ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-0">{capitalizeWords(submission.categoryName)}</h5>
            <span className="text-muted" style={{ fontSize: 13 }}>
              {capitalizeWords(submission.centreName)}
            </span>
          </div>
          {renderStatusBadge(submission.status.toUpperCase())}
        </div>

        <Field label="Submitted by">{capitalizeWords(submission.submittedBy) || "—"}</Field>
        <Field label="Submitted on">{formatDateTime(submission.submittedAt)}</Field>
        <Field label="Issuing authority">{capitalizeWords(submission.issuingAuthority) || "—"}</Field>
        <Field label="Licence / registration no.">{submission.licenceNo || "—"}</Field>
        <Field label="Issued on">{formatDate(submission.issuedOn)}</Field>
        <Field label="Valid till">
          {submission.noExpiry ? "No expiry (lifetime)" : formatDate(submission.validTill)}
        </Field>
        {!submission.noExpiry && <Field label="Renewal lead time">{submission.leadDays} days</Field>}
        <Field label="Responsible owner">{capitalizeWords(submission.owner) || "—"}</Field>
        <Field label="Escalate to">{capitalizeWords(submission.escalateTo) || "—"}</Field>

        {submission.notes && (
          <div className="py-2 border-bottom">
            <div className="text-muted mb-1" style={{ fontSize: 13 }}>
              Notes / conditions
            </div>
            <div style={{ fontSize: 13 }}>{capitalizeWords(submission.notes)}</div>
          </div>
        )}

        <div className="py-2">
          <div className="text-muted mb-2" style={{ fontSize: 13 }}>
            Documents
          </div>
          <div className="d-flex flex-column gap-2">
            {(submission.files || []).map((f) => (
              <button
                key={f._id || f.url}
                type="button"
                className="d-flex align-items-center gap-2 border rounded p-2 text-decoration-none text-body bg-white"
                onClick={() => openPreview(f)}
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
              </button>
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

        {submission.status === "pending" && !readOnly && (
          <div className="mt-3">
            <Label>
              Remarks{" "}
              <span className="text-muted fw-normal">
                (optional to approve · required to reject)
              </span>
            </Label>
            <Input
              type="textarea"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Certificate is not readable, please re-upload"
            />
          </div>
        )}
      </ModalBody>

      {submission.status === "pending" && !readOnly && (
        <ModalFooter>
          <Button
            color="danger"
            className="text-white"
            disabled={busy || !canReject}
            title={!canReject ? "Enter at least 3 characters in Remarks to reject" : undefined}
            onClick={handleReject}
          >
            <XCircle size={14} className="me-1" /> {busy ? "Rejecting..." : "Reject"}
          </Button>
          <Button color="success" className="text-white" disabled={busy} onClick={handleApprove}>
            <CheckCircle2 size={14} className="me-1" /> {busy ? "Approving..." : "Approve"}
          </Button>
        </ModalFooter>
      )}

      <PreviewFile
        title={previewFile?.originalName || "Compliance document"}
        file={previewFile}
        isOpen={previewOpen}
        toggle={() => setPreviewOpen(false)}
        allowDownload
      />
    </Modal>
  );
};

export default ReviewModal;