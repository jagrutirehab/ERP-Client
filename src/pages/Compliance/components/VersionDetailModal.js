import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Button, Spinner } from "reactstrap";
import { Eye, Download, FileText, Check } from "lucide-react";
import { toast } from "react-toastify";
import PreviewFile from "../../../Components/Common/PreviewFile";
import { getComplianceSubmissionById } from "../../../helpers/backend_helper";
import { formatDateTime } from "../../../utils/time";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const formatSize = (bytes) =>
  !bytes ? "" : bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
const personLabel = (u) => u?.name || u?.email || "—";

const ROLE_LABEL = {
  PRIMARY_CERTIFICATE: "Primary certificate",
  FEE_CHALLAN: "Fee challan",
  INSPECTION_REPORT: "Inspection report",
  APPLICATION: "Application",
  OTHER: "Other",
};

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

const DocRow = ({ doc, onPreview }) => (
  <div
    className="d-flex align-items-center gap-3 rounded p-2"
    style={{ background: "#F8F9FA", border: "1px solid #E9ECEF" }}
  >
    <div
      className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
      style={{ width: 36, height: 36, background: "#E6EEF8", color: "#1F4E8C" }}
    >
      <FileText size={16} />
    </div>
    <div className="flex-grow-1" style={{ minWidth: 0 }}>
      <div className="fw-medium text-truncate" style={{ fontSize: 13 }}>
        {doc.originalName || doc.name}
      </div>
      <div className="text-muted" style={{ fontSize: 12 }}>
        {[doc.type === "application/pdf" ? "PDF" : "Image", formatSize(doc.size), ROLE_LABEL[doc.role]]
          .filter(Boolean)
          .join(" · ")}
      </div>
    </div>
    <Button type="button" color="light" className="border p-2" size="sm" title="Preview" onClick={() => onPreview(doc)}>
      <Eye size={14} />
    </Button>
    <Button tag="a" href={doc.url} download color="light" className="border p-2" size="sm" title="Download">
      <Download size={14} />
    </Button>
  </div>
);

// `version` is either the "current" term (built from the live Compliance
// record) or a past entry from record.versions — same shape either way:
// { version, isCurrent, licenceNumber, issuingAuthority, issueDate, expiryDate,
//   noExpiry, documents, checklistCompleted, approvedBy, approvedAt }
const VersionDetailModal = ({ isOpen, toggle, version, checklistSteps }) => {
  const handleAuthError = useAuthError();
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  // Past versions only carry the minimal list fields until opened; this holds
  // the documents + checklistCompleted fetched on demand for that submission.
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openPreview = (doc) => {
    setPreviewFile({ url: doc.url, type: doc.type, originalName: doc.originalName || doc.name });
    setPreviewOpen(true);
  };

  useEffect(() => {
    setDetail(null);
    // Submitted-by/on isn't carried on the version summary either way, so
    // always fetch the submission — documents/checklist just reuse what's
    // already on hand for the current version instead of waiting on it.
    if (!isOpen || !version || !version.submission) return;
    let cancelled = false;
    const load = async () => {
      setDetailLoading(true);
      try {
        const res = await getComplianceSubmissionById(version.submission);
        if (!cancelled) setDetail(res?.data || null);
      } catch (error) {
        if (!cancelled && !handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Failed to load version details");
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, version]);

  if (!version) return null;

  // Current version already carries documents/checklist; a past one fills
  // those in once `detail` loads. Submitted-by/on only ever comes from `detail`.
  const documents = version.documents || detail?.documents;
  const completed = version.checklistCompleted || detail?.checklistCompleted || [];
  const documentsLoading = !documents && detailLoading;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        Version {version.version} {version.isCurrent ? "· Current" : "· Superseded"}
      </ModalHeader>
      <ModalBody>
        <Field label="Licence / reg. no.">{version.licenceNumber || "—"}</Field>
        <Field label="Issuing authority">
          <span className="text-capitalize">{version.issuingAuthority || "—"}</span>
        </Field>
        <Field label="Issued on">{formatDate(version.issueDate)}</Field>
        <Field label="Valid till">
          {version.noExpiry ? "No expiry (lifetime)" : formatDate(version.expiryDate)}
        </Field>
        {!version.noExpiry && (
          <Field label="Renewal lead time">
            {detail ? `${detail.renewalLeadDays} days` : detailLoading ? "…" : "—"}
          </Field>
        )}
        <Field label="Responsible owner">
          {detail ? detail.responsibleOwner || "—" : detailLoading ? "…" : "—"}
        </Field>
        <Field label="Escalate to">
          {detail ? detail.escalateTo || "—" : detailLoading ? "…" : "—"}
        </Field>
        {version.approvedAt && (
          <Field label="Approved">
            {formatDate(version.approvedAt)}
            {version.approvedBy ? ` · ${version.approvedBy.name || version.approvedBy.email}` : ""}
          </Field>
        )}
        <Field label="Submitted by">
          {detail ? personLabel(detail.submittedBy) : detailLoading ? "…" : "—"}
        </Field>
        <Field label="Submitted on">
          {detail ? formatDateTime(detail.submittedAt) : detailLoading ? "…" : "—"}
        </Field>
        {detail?.notes && (
          <div className="py-2 border-bottom">
            <div className="text-muted mb-1" style={{ fontSize: 13 }}>
              Notes / conditions
            </div>
            <div style={{ fontSize: 13 }}>{detail.notes}</div>
          </div>
        )}

        <div className="mt-3">
          <div className="text-muted mb-2" style={{ fontSize: 13 }}>
            Documents
          </div>
          {documentsLoading ? (
            <div className="text-center text-muted py-3">
              <Spinner size="sm" className="me-2" /> Loading...
            </div>
          ) : documents?.length ? (
            <div className="d-flex flex-column gap-2">
              {documents.map((d) => (
                <DocRow key={d._id || d.url} doc={d} onPreview={openPreview} />
              ))}
            </div>
          ) : (
            <div className="text-muted" style={{ fontSize: 13 }}>
              No documents on this version.
            </div>
          )}
        </div>

        {!documentsLoading && !!checklistSteps?.length && (
          <div className="mt-4">
            <div className="text-muted mb-2" style={{ fontSize: 13 }}>
              Renewal checklist at this version
            </div>
            <div className="d-flex flex-column gap-2">
              {checklistSteps.map((step) => {
                const done = completed.includes(step.text);
                return (
                  <div key={step.text} className="d-flex align-items-center gap-2">
                    <span
                      className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                      style={{
                        width: 18,
                        height: 18,
                        border: `1px solid ${done ? "#1D5A41" : "#C9CFCB"}`,
                        background: done ? "#1D5A41" : "transparent",
                      }}
                    >
                      {done && <Check size={12} color="#fff" />}
                    </span>
                    <span
                      className={done ? "" : "text-muted"}
                      style={{ fontSize: 13, textDecoration: done ? "none" : undefined }}
                    >
                      {step.text}
                    </span>
                    {step.mandatory && <span className="text-danger fw-semibold">*</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ModalBody>

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

export default VersionDetailModal;
