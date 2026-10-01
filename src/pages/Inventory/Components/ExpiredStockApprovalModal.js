import React from "react";
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

const ExpiredStockApprovalModal = ({
  isOpen,
  row,
  remarks,
  setRemarks,
  closeModal,
  submitApproval,
  loading,
}) => {
  // expiryDate is stored at UTC midnight of the labelled day, so read it in
  // UTC — local formatting would shift it a day west of GMT.
  const expiry = row?.expiryDate
    ? moment.utc(row.expiryDate).format("DD MMM YYYY")
    : row?.Expiry || "—";

  return (
    <Modal isOpen={isOpen} toggle={closeModal} centered size="xl">
      <ModalHeader toggle={closeModal}>Approve Stock Removal</ModalHeader>
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
            This will set stock to <strong>0</strong> for this batch at{" "}
            <strong>{row?.center?.title}</strong>.
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
              Stock to remove:{" "}
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
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={closeModal} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="success"
          className="text-white"
          onClick={submitApproval}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : "Approve & Remove"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ExpiredStockApprovalModal;
