import React from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { Eye, Download, FileText } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDate } from "./data";

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

const ItemDetailModal = ({ isOpen, toggle, item }) => {
  if (!item) return null;

  const issuedOn =
    item.validTill && item.termDays ? new Date(item.validTill.getTime() - item.termDays * 86400000) : null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>Compliance item details</ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-0">{item.categoryName}</h5>
            <span className="text-muted" style={{ fontSize: 13 }}>
              {item.centreName}
            </span>
          </div>
          <StatusBadge statusKey={item.statusKey} />
        </div>

        <Field label="Licence / reg. no.">{item.licenceNo || "—"}</Field>
        <Field label="Issuing authority">{item.authority || "—"}</Field>
        <Field label="Issued on">{issuedOn ? formatDate(issuedOn) : "—"}</Field>
        <Field label="Valid till">
          {item.statusKey === "lt"
            ? "No expiry (lifetime)"
            : item.validTill
            ? `${formatDate(item.validTill)} · ${
                item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d overdue` : `${item.daysLeft}d left`
              }`
            : "—"}
        </Field>
        {item.statusKey !== "lt" && item.statusKey !== "missing" && (
          <Field label="Renewal lead time">60 days</Field>
        )}
        <Field label="Responsible owner">{item.owner || "—"}</Field>

        <div className="mt-3">
          <div className="text-muted mb-2" style={{ fontSize: 13 }}>
            Documents
          </div>
          {item.statusKey === "missing" ? (
            <div className="text-muted" style={{ fontSize: 13 }}>
              No document uploaded yet.
            </div>
          ) : (
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
                <div className="fw-medium text-truncate">
                  {item.categoryId.toUpperCase()}_{item.centreId.toUpperCase()}_v{item.documentVersion}.pdf
                </div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  PDF · 1.4 MB · v{item.documentVersion} · verified by {item.owner}
                </div>
              </div>
              <Button color="light" className="border p-2" size="sm">
                <Eye size={14} />
              </Button>
              <Button color="light" className="border p-2" size="sm">
                <Download size={14} />
              </Button>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ItemDetailModal;
