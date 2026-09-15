import React, { useState } from "react";
import { Row, Col, Label, Input, Button } from "reactstrap";
import { toast } from "react-toastify";
import { createGRN } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const GRNForm = ({ di, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [submitting, setSubmitting] = useState(false);
  const [remarks, setRemarks] = useState("");

  const [lines, setLines] = useState(
    di.lineItems.map((li) => ({
      itemName: li.itemName,
      orderedQty: li.orderedQty,
      intimatedQty: li.intimatedQty,
      receivedQty: li.intimatedQty,
      remarks: "",
    })),
  );

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalidLine = lines.find((li) => Number(li.receivedQty) < 0);
    if (invalidLine) return toast.error("Received quantity cannot be negative");

    setSubmitting(true);
    try {
      await createGRN({
        poId: di.poId._id || di.poId,
        deliveryIntimationId: di._id,
        remarks,
        lineItems: lines.map((li) => ({
          itemName: li.itemName,
          orderedQty: li.orderedQty,
          intimatedQty: li.intimatedQty,
          receivedQty: Number(li.receivedQty),
          remarks: li.remarks,
        })),
      });
      toast.success("Goods Receipt Note created successfully");
      onSaved();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="uom-form-page">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <h4 className="uom-form-title mb-0">Create Goods Receipt Note</h4>
        <Button color="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save GRN"}
        </Button>
      </div>
      <p className="text-muted mb-4">
        Delivery Intimation: <strong>{di.intimationNumber}</strong> · PO:{" "}
        <strong>{di.poId?.poNumber}</strong>
      </p>

      <div className="uom-form-panel">
        <form onSubmit={handleSubmit}>
          <h6 className="uom-form-section-title">Verify Received Quantities</h6>
          <p className="text-muted small mb-3">
            Confirm what physically arrived — this may differ from what was intimated.
          </p>

          {lines.map((li, idx) => (
            <div key={idx} className="uom-table-card p-3 mb-3">
              <div className="fw-semibold mb-1">{li.itemName}</div>
              <div className="text-muted small mb-3">
                Ordered: {li.orderedQty} · Intimated: {li.intimatedQty}
              </div>
              <Row>
                <Col md={4} className="mb-2">
                  <Label className="small">
                    Received Qty <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={li.receivedQty}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateLine(idx, "receivedQty", e.target.value)}
                  />
                  {Number(li.receivedQty) !== li.intimatedQty && (
                    <div className="text-warning small mt-1">
                      <i className="bx bx-error-circle me-1"></i>
                      Differs from intimated quantity
                    </div>
                  )}
                </Col>
                <Col md={8} className="mb-2">
                  <Label className="small">Remarks</Label>
                  <Input
                    value={li.remarks}
                    placeholder="e.g. 1 unit damaged in transit"
                    onChange={(e) => updateLine(idx, "remarks", e.target.value)}
                  />
                </Col>
              </Row>
            </div>
          ))}

          <Row>
            <Col md={12} className="mb-4">
              <Label>Overall Remarks</Label>
              <Input
                type="textarea"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Col>
          </Row>

          <div className="uom-form-footer d-flex justify-content-end gap-2">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save GRN"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GRNForm;