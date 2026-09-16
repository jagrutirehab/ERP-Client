import React, { useEffect, useState } from "react";
import { Row, Col, Label, Input, Button } from "reactstrap";
import { toast } from "react-toastify";
import { createPutaway, getStorageLocations } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const PutawayForm = ({ grn, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState([]);
  const [remarks, setRemarks] = useState("");

  const centerId = grn.poId?.deliverySiteId?._id || grn.poId?.deliverySiteId;

  useEffect(() => {
    if (!centerId) return;
    getStorageLocations({ centerId, status: "active" })
      .then((res) => setLocations(res?.data || []))
      .catch(() => {});
  }, [centerId]);

  const [lines, setLines] = useState(
    grn.lineItems.map((li) => ({
      itemName: li.itemName,
      receivedQty: li.receivedQty,
      putawayQty: li.receivedQty,
      storageLocationId: "",
      remarks: "",
    })),
  );

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingLocation = lines.find((li) => !li.storageLocationId);
    if (missingLocation) return toast.error(`Select a storage location for "${missingLocation.itemName}"`);

    const invalidQty = lines.find(
      (li) => Number(li.putawayQty) <= 0 || Number(li.putawayQty) > li.receivedQty,
    );
    if (invalidQty) {
      return toast.error(`Putaway qty for "${invalidQty.itemName}" must be between 1 and ${invalidQty.receivedQty}`);
    }

    setSubmitting(true);
    try {
      await createPutaway({
        grnId: grn._id,
        remarks,
        lineItems: lines.map((li) => ({
          itemName: li.itemName,
          putawayQty: Number(li.putawayQty),
          storageLocationId: li.storageLocationId,
          remarks: li.remarks,
        })),
      });
      toast.success("Putaway recorded successfully");
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
        <h4 className="uom-form-title mb-0">Assign Storage Locations</h4>
        <Button color="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save Putaway"}
        </Button>
      </div>
      <p className="text-muted mb-4">
        GRN: <strong>{grn.grnNumber}</strong> · PO: <strong>{grn.poId?.poNumber}</strong>
      </p>

      <div className="uom-form-panel">
        <form onSubmit={handleSubmit}>
          {lines.map((li, idx) => (
            <div key={idx} className="uom-table-card p-3 mb-3">
              <div className="fw-semibold mb-1">{li.itemName}</div>
              <div className="text-muted small mb-3">Received: {li.receivedQty}</div>
              <Row>
                <Col md={4} className="mb-2">
                  <Label className="small">
                    Putaway Qty <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={li.receivedQty}
                    value={li.putawayQty}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateLine(idx, "putawayQty", e.target.value)}
                  />
                </Col>
                <Col md={4} className="mb-2">
                  <Label className="small">
                    Storage Location <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={li.storageLocationId}
                    onChange={(e) => updateLine(idx, "storageLocationId", e.target.value)}
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </Input>
                  {locations.length === 0 && (
                    <div className="text-muted small mt-1">
                      No locations set up for this center yet.
                    </div>
                  )}
                </Col>
                <Col md={4} className="mb-2">
                  <Label className="small">Remarks</Label>
                  <Input
                    value={li.remarks}
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
              {submitting ? "Saving..." : "Save Putaway"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PutawayForm;