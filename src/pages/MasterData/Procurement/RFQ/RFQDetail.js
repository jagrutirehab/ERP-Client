import React, { useEffect, useState } from "react";
import { Row, Col, Label, Input, Button, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import {
  getRFQById,
  recordVendorQuote,
  closeRFQ,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const RFQDetail = ({ rfqId, onBack }) => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canEdit = hasPermission("MASTERDATA", "RFQ", "WRITE");

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [quoteModalFor, setQuoteModalFor] = useState(null); // vendorQuote being edited
  const [draftLines, setDraftLines] = useState([]);
  const [draftRemarks, setDraftRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRFQById(rfqId)
      .then((res) => setRfq(res?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rfqId, refreshFlag]);

  const openQuoteModal = (vendorQuote) => {
    setQuoteModalFor(vendorQuote);
    setDraftLines(
      vendorQuote.lineItemQuotes.length > 0
        ? vendorQuote.lineItemQuotes.map((li) => ({ ...li }))
        : rfq.lineItems.map((li) => ({
            itemName: li.itemName,
            quantity: li.quantity,
            unitPrice: 0,
            taxPercent: 0,
          })),
    );
    setDraftRemarks(vendorQuote.remarks || "");
  };

  const updateDraftLine = (idx, field, value) => {
    setDraftLines((prev) => prev.map((li, i) => (i === idx ? { ...li, [field]: value } : li)));
  };

  const saveQuote = async () => {
    setSaving(true);
    try {
      await recordVendorQuote(rfq._id, quoteModalFor._id, {
        lineItemQuotes: draftLines.map((li) => ({
          ...li,
          quantity: Number(li.quantity) || 0,
          unitPrice: Number(li.unitPrice) || 0,
          taxPercent: Number(li.taxPercent) || 0,
        })),
        remarks: draftRemarks,
      });
      toast.success("Vendor quote recorded");
      setQuoteModalFor(null);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't save quote");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      await closeRFQ(rfq._id);
      toast.success("RFQ closed");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't close RFQ");
      }
    } finally {
      setClosing(false);
    }
  };

  if (loading || !rfq) {
    return <div className="p-4 text-muted">Loading RFQ...</div>;
  }

  const quotedVendors = rfq.vendorQuotes.filter((vq) => vq.quotedAt);
  const lowestAmount =
    quotedVendors.length > 0 ? Math.min(...quotedVendors.map((vq) => vq.totalAmount)) : null;

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>{rfq.rfqNumber}</h4>
          <p>
            Reference: {rfq.prId?.prNumber} — {rfq.prId?.prTitle}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button color="light" onClick={onBack}>
            <i className="bx bx-arrow-back me-1"></i> Back
          </Button>
          {canEdit && rfq.status === "draft" && (
            <Button color="dark" onClick={handleClose} disabled={closing}>
              {closing ? "Closing..." : "Close RFQ"}
            </Button>
          )}
        </div>
      </div>

      <div className="uom-table-card p-3 mb-4">
        <div className="fw-semibold small mb-2">Items Requested</div>
        {rfq.lineItems.map((li, idx) => (
          <div key={idx} className="d-flex justify-content-between small text-muted mb-1">
            <span>{li.itemName}</span>
            <span>Qty: {li.quantity}</span>
          </div>
        ))}
      </div>

      <h6 className="uom-form-section-title">Vendor Quotes — Comparative Statement</h6>
      <p className="text-muted small mb-3">
        Contact each vendor manually (phone/WhatsApp/email), then record their quote here.
      </p>

      <div className="uom-table-card mb-4" style={{ overflowX: "auto" }}>
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Status</th>
              <th>Total Quote</th>
              <th>Remarks</th>
              <th style={{ width: 140 }}></th>
            </tr>
          </thead>
          <tbody>
            {rfq.vendorQuotes.map((vq) => {
              const isLowest = vq.quotedAt && vq.totalAmount === lowestAmount;
              return (
                <tr key={vq._id} style={isLowest ? { background: "#ecfdf3" } : undefined}>
                  <td className="align-middle">
                    {vq.vendorId?.tradeName || vq.vendorId?.legalName || "—"}
                  </td>
                  <td className="align-middle">
                    {vq.quotedAt ? (
                      <span className="uom-status-pill status-active">Received</span>
                    ) : (
                      <span className="uom-status-pill status-inactive">Pending</span>
                    )}
                  </td>
                  <td className="align-middle fw-semibold">
                    {vq.quotedAt ? (
                      <>
                        {money(vq.totalAmount)}
                        {isLowest && (
                          <span className="uom-status-pill status-active ms-2">Lowest</span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="align-middle small text-muted">{vq.remarks || "—"}</td>
                  <td className="align-middle">
                    {canEdit && rfq.status === "draft" && (
                      <Button size="sm" color="light" onClick={() => openQuoteModal(vq)}>
                        {vq.quotedAt ? "Edit Quote" : "Record Quote"}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!quoteModalFor} toggle={() => setQuoteModalFor(null)} centered size="lg">
        <ModalBody className="p-4">
          <h5 className="mb-1">
            Record Quote — {quoteModalFor?.vendorId?.tradeName || quoteModalFor?.vendorId?.legalName}
          </h5>
          <p className="text-muted small mb-3">
            Enter the rate this vendor gave you over phone/WhatsApp/email.
          </p>

          <div className="uom-table-card mb-3" style={{ overflowX: "auto" }}>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ width: 90 }}>Qty</th>
                  <th style={{ width: 130 }}>Rate</th>
                  <th style={{ width: 90 }}>Tax %</th>
                </tr>
              </thead>
              <tbody>
                {draftLines.map((li, idx) => (
                  <tr key={idx}>
                    <td className="align-middle">{li.itemName}</td>
                    <td>
                      <Input
                        bsSize="sm"
                        type="number"
                        min={0}
                        value={li.quantity}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateDraftLine(idx, "quantity", e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        bsSize="sm"
                        type="number"
                        min={0}
                        value={li.unitPrice}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateDraftLine(idx, "unitPrice", e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        bsSize="sm"
                        type="select"
                        value={li.taxPercent}
                        onChange={(e) => updateDraftLine(idx, "taxPercent", e.target.value)}
                      >
                        <option value={0}>0%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </Input>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Label>Remarks</Label>
          <Input
            type="textarea"
            rows={2}
            value={draftRemarks}
            onChange={(e) => setDraftRemarks(e.target.value)}
            placeholder="e.g. Delivery in 5 days, warranty included"
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button color="light" onClick={() => setQuoteModalFor(null)} disabled={saving}>
              Cancel
            </Button>
            <Button color="primary" onClick={saveQuote} disabled={saving}>
              {saving ? "Saving..." : "Save Quote"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default RFQDetail;