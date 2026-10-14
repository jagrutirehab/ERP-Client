import React, { useState } from "react";
import { Row, Col, Label, Input, Button } from "reactstrap";
import { toast } from "react-toastify";
import { createDI } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const DIForm = ({ po, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [submitting, setSubmitting] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [challanFile, setChallanFile] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [remarks, setRemarks] = useState("");

  const [lines, setLines] = useState(
    po.linesWithRemaining
      .filter((li) => li.remaining > 0)
      .map((li) => ({
        itemName: li.itemName,
        orderedQty: li.orderedQty,
        remaining: li.remaining,
        intimatedQty: li.remaining,
        batchNumber: "",
        remarks: "",
      })),
  );

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invoiceNumber.trim()) return toast.error("Invoice number is required");
    if (!invoiceDate) return toast.error("Invoice date is required");
    if (!invoiceFile) return toast.error("Invoice attachment is required");

    const invalidLine = lines.find(
      (li) => Number(li.intimatedQty) <= 0 || Number(li.intimatedQty) > li.remaining,
    );
    if (invalidLine) {
      return toast.error(
        `"${invalidLine.itemName}" quantity must be between 1 and ${invalidLine.remaining}`,
      );
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("poId", po._id);
      formData.append("invoiceNumber", invoiceNumber);
      formData.append("invoiceDate", invoiceDate);
      if (expectedDeliveryDate) formData.append("expectedDeliveryDate", expectedDeliveryDate);
      formData.append("vehicleNumber", vehicleNumber);
      formData.append("carrierName", carrierName);
      formData.append("driverName", driverName);
      formData.append("driverPhone", driverPhone);
      formData.append("remarks", remarks);
      formData.append(
        "lineItems",
        JSON.stringify(
          lines.map((li) => ({
            itemName: li.itemName,
            intimatedQty: Number(li.intimatedQty),
            batchNumber: li.batchNumber,
            remarks: li.remarks,
          })),
        ),
      );
      formData.append("invoiceAttachment", invoiceFile);
      if (challanFile) formData.append("deliveryChallan", challanFile);

      await createDI(formData);
      toast.success("Delivery Intimation created successfully");
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
        <h4 className="uom-form-title mb-0">Create Delivery Intimation</h4>
        <Button color="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save DI"}
        </Button>
      </div>
      <p className="text-muted mb-4">
        Purchase Order: <strong>{po.poNumber}</strong>
      </p>

      <div className="uom-form-panel">
        <form onSubmit={handleSubmit}>
          <h6 className="uom-form-section-title">Header Information</h6>
          <Row>
            <Col md={4} className="mb-4">
              <Label>Vendor</Label>
              <Input
                value={po.vendorId?.tradeName || po.vendorId?.legalName || "—"}
                disabled
              />
            </Col>
            <Col md={4} className="mb-4">
              <Label>
                Invoice Number <span className="text-danger">*</span>
              </Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </Col>
            <Col md={4} className="mb-4">
              <Label>
                Invoice Date <span className="text-danger">*</span>
              </Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </Col>
          </Row>

          <Row>
            <Col md={4} className="mb-4">
              <Label>Expected Delivery</Label>
              <Input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </Col>
            <Col md={4} className="mb-4">
              <Label>
                Invoice Attachment <span className="text-danger">*</span>
              </Label>
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
              />
              <div className="text-muted small mt-1">PDF or image, up to 10 MB</div>
            </Col>
            <Col md={4} className="mb-4">
              <Label>Delivery Challan (PDF)</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setChallanFile(e.target.files?.[0] || null)}
              />
              <div className="text-muted small mt-1">Optional — PDF, up to 10 MB</div>
            </Col>
          </Row>

          <Row>
            <Col md={3} className="mb-4">
              <Label>Vehicle Number</Label>
              <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
            </Col>
            <Col md={3} className="mb-4">
              <Label>Carrier Name</Label>
              <Input value={carrierName} onChange={(e) => setCarrierName(e.target.value)} />
            </Col>
            <Col md={3} className="mb-4">
              <Label>Driver Name</Label>
              <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </Col>
            <Col md={3} className="mb-4">
              <Label>Driver Phone</Label>
              <Input value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} />
            </Col>
          </Row>

          <Row>
            <Col md={12} className="mb-4">
              <Label>Global Remarks</Label>
              <Input
                type="textarea"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Col>
          </Row>

          <h6 className="uom-form-section-title mt-2">
            Delivery Line Items ({lines.length} / {lines.length} Items)
          </h6>

          {lines.map((li, idx) => (
            <div key={idx} className="uom-table-card p-3 mb-3">
              <div className="fw-semibold mb-1">{li.itemName}</div>
              <div className="text-muted small mb-3">
                Qty Ordered: {li.orderedQty} · Remaining: {li.remaining}
              </div>
              <Row>
                <Col md={4} className="mb-2">
                  <Label className="small">
                    Intimated Qty (max: {li.remaining}) <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={li.remaining}
                    value={li.intimatedQty}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateLine(idx, "intimatedQty", e.target.value)}
                  />
                </Col>
                <Col md={4} className="mb-2">
                  <Label className="small">Batch #</Label>
                  <Input
                    value={li.batchNumber}
                    onChange={(e) => updateLine(idx, "batchNumber", e.target.value)}
                  />
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

          <div className="uom-form-footer d-flex justify-content-end gap-2">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save DI"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DIForm;