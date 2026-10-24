import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Button, Spinner } from "reactstrap";
import { Eye, Download, FileText, Check } from "lucide-react";
import { toast } from "react-toastify";
import StatusBadge from "./StatusBadge";
import RenewalBadge from "./RenewalBadge";
import PreviewFile from "../../../Components/Common/PreviewFile";
import VersionDetailModal from "./VersionDetailModal";
import { getComplianceRecordById } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

// Backend status -> StatusBadge key
const STATUS_KEY = {
  VALID: "valid",
  DUE_30: "due30",
  DUE_90: "due90",
  EXPIRED: "expired",
  IN_RENEWAL: "renewal",
  DOC_MISSING: "missing",
  NO_EXPIRY: "lt",
};

const ROLE_LABEL = {
  PRIMARY_CERTIFICATE: "Primary certificate",
  FEE_CHALLAN: "Fee challan",
  INSPECTION_REPORT: "Inspection report",
  APPLICATION: "Application",
  OTHER: "Other",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const formatSize = (bytes) =>
  !bytes ? "" : bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
const centreLabel = (c) => c?.displayName || c?.title || c?.name || "—";
const personLabel = (u) => u?.name || u?.email || "—";

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
    <Button
      type="button"
      color="light"
      className="border p-2"
      size="sm"
      title="Preview"
      onClick={() => onPreview(doc)}
    >
      <Eye size={14} />
    </Button>
    <Button tag="a" href={doc.url} download color="light" className="border p-2" size="sm" title="Download">
      <Download size={14} />
    </Button>
  </div>
);

const ItemDetailModal = ({ isOpen, toggle, recordId }) => {
  const handleAuthError = useAuthError();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState(null);

  const openPreview = (doc) => {
    setPreviewFile({ url: doc.url, type: doc.type, originalName: doc.originalName || doc.name });
    setPreviewOpen(true);
  };

  useEffect(() => {
    if (!isOpen || !recordId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setRecord(null);
      try {
        const res = await getComplianceRecordById(recordId);
        if (!cancelled) setRecord(res?.data || null);
      } catch (error) {
        if (!cancelled) {
          if (!handleAuthError(error)) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to load details");
          }
          toggle();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, recordId]);

  const daysText =
    record?.daysLeft == null
      ? ""
      : record.daysLeft < 0
      ? ` · ${Math.abs(record.daysLeft)}d overdue`
      : ` · ${record.daysLeft}d left`;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
      <ModalHeader toggle={toggle}>Compliance item details</ModalHeader>
      <ModalBody>
        {loading || !record ? (
          <div className="text-center py-5 text-muted">
            <Spinner size="sm" className="me-2" /> Loading...
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="mb-0 text-capitalize">{record.complianceType?.name}</h5>
                <span className="text-muted" style={{ fontSize: 13 }}>
                  {centreLabel(record.center)}
                  {record.category?.name ? ` · ${record.category.name}` : ""}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <StatusBadge statusKey={STATUS_KEY[record.status]} />
                <RenewalBadge inRenewal={record.inRenewal} />
              </div>
            </div>

            <Field label="Licence / reg. no.">{record.licenceNumber || "—"}</Field>
            <Field label="Issuing authority">
              <span className="text-capitalize">{record.issuingAuthority || "—"}</span>
            </Field>
            <Field label="Issued on">{formatDate(record.issueDate)}</Field>
            <Field label="Valid till">
              {record.noExpiry ? "No expiry (lifetime)" : `${formatDate(record.expiryDate)}${daysText}`}
            </Field>
            {!record.noExpiry && <Field label="Renewal lead time">{record.renewalLeadDays} days</Field>}
            <Field label="Responsible owner">{record.responsibleOwner || "—"}</Field>
            <Field label="Escalate to">{record.escalateTo || "—"}</Field>
            <Field label="Last approved">
              {formatDate(record.lastApprovedAt)} · {personLabel(record.lastApprovedBy)}
            </Field>
            {record.notes && <Field label="Notes / conditions">{record.notes}</Field>}

            <div className="mt-3">
              <div className="text-muted mb-2" style={{ fontSize: 13 }}>
                Current documents (v{record.currentVersion || 1})
              </div>
              {record.documents?.length ? (
                <div className="d-flex flex-column gap-2">
                  {record.documents.map((d) => (
                    <DocRow key={d._id || d.url} doc={d} onPreview={openPreview} />
                  ))}
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  No document uploaded yet.
                </div>
              )}
            </div>

            {!!record.complianceType?.checklistSteps?.length && (
              <div className="mt-4">
                <div className="text-muted mb-2" style={{ fontSize: 13 }}>
                  Renewal checklist
                </div>
                <div className="d-flex flex-column gap-2">
                  {record.complianceType.checklistSteps.map((step) => {
                    const done = (record.checklistCompleted || []).includes(step.text);
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
                        <span className={done ? "" : "text-muted"} style={{ fontSize: 13 }}>
                          {step.text}
                        </span>
                        {step.mandatory && <span className="text-danger fw-semibold">*</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="text-muted mb-2" style={{ fontSize: 13 }}>
                Version history
              </div>
              <button
                type="button"
                className="d-flex align-items-center gap-3 py-2 border-top border-0 bg-transparent w-100 text-start"
                style={{ fontSize: 13 }}
                onClick={() =>
                  setViewingVersion({
                    version: record.currentVersion || 1,
                    isCurrent: true,
                    licenceNumber: record.licenceNumber,
                    issuingAuthority: record.issuingAuthority,
                    issueDate: record.issueDate,
                    expiryDate: record.expiryDate,
                    noExpiry: record.noExpiry,
                    documents: record.documents,
                    checklistCompleted: record.checklistCompleted || [],
                    approvedBy: record.lastApprovedBy,
                    approvedAt: record.lastApprovedAt,
                    submission: record.lastApprovedSubmission,
                  })
                }
              >
                <span className="fw-semibold" style={{ fontFamily: "monospace", width: 32 }}>
                  v{record.currentVersion || 1}
                </span>
                <span className="flex-grow-1 text-body">
                  {record.noExpiry
                    ? "Lifetime"
                    : `${formatDate(record.issueDate)} → ${formatDate(record.expiryDate)}`}
                  <span className="text-muted"> · {record.licenceNumber}</span>
                </span>
                <span className="text-success fw-medium">Current</span>
              </button>
              {(record.versions || []).map((v) => (
                <button
                  key={v.version}
                  type="button"
                  className="d-flex align-items-center gap-3 py-2 border-top border-0 bg-transparent w-100 text-start"
                  style={{ fontSize: 13 }}
                  onClick={() => setViewingVersion({ ...v, isCurrent: false })}
                >
                  <span className="fw-semibold" style={{ fontFamily: "monospace", width: 32 }}>
                    v{v.version}
                  </span>
                  <span className="flex-grow-1 text-body">
                    {v.noExpiry ? "Lifetime" : `${formatDate(v.issueDate)} → ${formatDate(v.expiryDate)}`}
                    <span className="text-muted"> · {v.licenceNumber}</span>
                  </span>
                  <span className="text-muted">Archived</span>
                </button>
              ))}
              {!record.versions?.length && (
                <div className="text-muted py-2 border-top" style={{ fontSize: 12 }}>
                  No earlier versions yet.
                </div>
              )}
            </div>
          </>
        )}
      </ModalBody>
      <VersionDetailModal
        isOpen={!!viewingVersion}
        toggle={() => setViewingVersion(null)}
        version={viewingVersion}
        checklistSteps={record?.complianceType?.checklistSteps}
      />
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

export default ItemDetailModal;