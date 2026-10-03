import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from "reactstrap";
import moment from "moment";
import { capitalizeWords } from "../../../utils/toCapitalize";

const unitLabel = (baseUnit) => (baseUnit ? `${capitalizeWords(baseUnit)}(s)` : "");

const AUDIT_PAGE_SIZE = 10;

const InventoryHealthDetailModal = ({ isOpen, toggle, row }) => {
  const [auditPage, setAuditPage] = useState(1);

  // Reset to page 1 whenever a different row's detail is opened, not just
  // on isOpen toggling (the modal can be reused for a new row while staying
  // open-ish in some flows, and the page shouldn't carry over regardless).
  useEffect(() => {
    setAuditPage(1);
  }, [row?.pharmacyId, row?.centerId]);

  if (!isOpen || !row) return null;

  const auditHistory = row.auditHistory || [];
  const auditTotalPages = Math.max(1, Math.ceil(auditHistory.length / AUDIT_PAGE_SIZE));
  const auditPageRows = auditHistory.slice(
    (auditPage - 1) * AUDIT_PAGE_SIZE,
    auditPage * AUDIT_PAGE_SIZE
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
      <ModalHeader toggle={toggle}>
        {row.batchDeleted ? (
          <span
            className="text-muted"
            title="This batch's record was removed from inventory after this event happened — the event itself is still real"
          >
            Batch deleted
          </span>
        ) : (
          <>
            {row.medicineName} — Batch {row.Batch || "—"}
          </>
        )}
      </ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between mb-3 fs-13">
          <span className="text-muted">Center</span>
          <span className="fw-medium">{row.center || "—"}</span>
        </div>

        <div className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: 10 }}>
          Transit Loss
        </div>
        {row.transitLoss ? (
          <p className="fs-13 mb-1">
            <span className="fw-bold text-danger">
              {row.transitLoss} {unitLabel(row.baseUnit)}
            </span>{" "}
            lost across {row.transferCount} transfer{row.transferCount === 1 ? "" : "s"} this
            period (dispatched vs. actually received).
          </p>
        ) : (
          <p className="text-muted fs-13 mb-1">No confirmed transfer loss this period.</p>
        )}
        {row.overdueCount ? (
          <p className="fs-13">
            <span className="fw-bold text-warning">
              {row.overdueQty} {unitLabel(row.baseUnit)}
            </span>{" "}
            stuck in transit across {row.overdueCount} transfer{row.overdueCount === 1 ? "" : "s"} —
            dispatched over a week ago and not yet received. Not counted as loss yet, just worth
            following up on.
          </p>
        ) : (
          <p className="text-muted fs-13">Nothing stuck in transit.</p>
        )}

        <div className="text-uppercase text-muted fw-bold mb-2 mt-3" style={{ fontSize: 10 }}>
          Audit History
        </div>
        {auditHistory.length ? (
          <>
            <Table size="sm" bordered responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Old Stock</th>
                  <th>New Stock</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {auditPageRows.map((a) => (
                  <tr key={a.auditId}>
                    <td>{a.auditDate ? moment(a.auditDate).format("DD MMM YYYY") : "—"}</td>
                    <td>{a.oldStock}</td>
                    <td>{a.newStock}</td>
                    <td className={a.variance < 0 ? "text-danger" : a.variance > 0 ? "text-success" : ""}>
                      {a.variance > 0 ? `+${a.variance}` : a.variance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {auditTotalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-1">
                <Button
                  size="sm"
                  color="light"
                  disabled={auditPage === 1}
                  onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-muted fs-13">
                  Page {auditPage} of {auditTotalPages}
                </span>
                <Button
                  size="sm"
                  color="light"
                  disabled={auditPage === auditTotalPages}
                  onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted fs-13">No audits recorded this period.</p>
        )}

        <div className="text-uppercase text-muted fw-bold mb-2 mt-3" style={{ fontSize: 10 }}>
          Expiry
        </div>
        {row.expiredQty ? (
          <p className="fs-13 mb-1">
            <span className="fw-bold text-danger">
              {row.expiredQty} {unitLabel(row.baseUnit)}
            </span>{" "}
            still in stock, expired
            {row.expiryDate ? ` on ${moment.utc(row.expiryDate).format("DD MMM YYYY")}` : ""} — not yet
            discarded.
          </p>
        ) : row.missingExpiry ? (
          <p className="fs-13 mb-1">
            <span className="fw-bold text-secondary">No expiry date</span> on record for this batch
            — it can never be flagged as expired automatically until that's filled in.
          </p>
        ) : (
          <p className="text-muted fs-13 mb-1">Nothing currently sitting expired for this batch.</p>
        )}
        {row.discardCount ? (
          <p className="fs-13">
            <span className="fw-bold text-dark">
              {row.discardedQty} {unitLabel(row.baseUnit)}
            </span>{" "}
            discarded across {row.discardCount} removal{row.discardCount === 1 ? "" : "s"} this
            period.
          </p>
        ) : (
          <p className="text-muted fs-13">Nothing discarded this period.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InventoryHealthDetailModal;
