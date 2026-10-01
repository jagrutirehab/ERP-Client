import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from "reactstrap";
import moment from "moment";

const ExpiredStockDiscardModal = ({
  isOpen,
  row,
  remarks,
  setRemarks,
  closeModal,
  submitDiscard,
  loading,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);


  useEffect(() => {
    if (isOpen) setAcknowledged(false);
  }, [isOpen, row?._id]);

  const expiry = row?.expiryDate
    ? moment.utc(row.expiryDate).format("DD MMM YYYY")
    : row?.Expiry || "—";

  return (
    <Modal isOpen={isOpen} toggle={closeModal} centered size="xl">
      <ModalHeader toggle={closeModal}>Discard Expired Stock</ModalHeader>
      <ModalBody>
        <div
          className="d-flex align-items-start gap-2 p-3 mb-3"
          style={{
            background: "#fff5f5",
            border: "1px solid #ffc9c9",
            borderRadius: 8,
          }}
        >
          <i className="bx bx-error-circle fs-5 text-danger" />
          <div style={{ fontSize: 13 }}>
            This will remove this batch from{" "}
            <strong>{row?.center?.title}</strong>'s inventory. If this is the
            only center stocking it, the batch will be deleted entirely.
            <div className="text-muted mt-1" style={{ fontSize: 12 }}>
              This cannot be undone.
            </div>
          </div>
        </div>

        {row && (
          <div
            className="bg-light bg-opacity-50 p-3 rounded mb-3"
            style={{ fontSize: 13 }}
          >
            <div className="fw-semibold mb-1">
              {[row.medicine?.type, row.medicineName, row.Strength]
                .filter(Boolean)
                .join(" ")}
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              {row.id} · Batch {row.Batch || "—"} · Expired {expiry}
            </div>
            <div className="mt-2">
              Stock to discard:{" "}
              <span className="fw-bold text-danger">
                {row.stock} {row.medicine?.baseUnit || ""}
              </span>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Remarks (Optional)</label>
          <Input
            type="textarea"
            rows={3}
            placeholder="Reason or reference for this write-off..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="form-check mt-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="discard-ack"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <label
            className="form-check-label fw-semibold"
            htmlFor="discard-ack"
            style={{ fontSize: 13 }}
          >
            I acknowledge that this expired stock has been physically discarded
            and should be cleared from inventory.
          </label>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={closeModal} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="success"
          className="text-white"
          onClick={submitDiscard}
          disabled={loading || !acknowledged}
        >
          {loading ? <Spinner size="sm" /> : "Discard"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ExpiredStockDiscardModal;
