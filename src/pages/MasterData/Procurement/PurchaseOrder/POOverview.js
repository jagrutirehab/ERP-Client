import React, { useEffect, useState } from "react";
import { Row, Col, Button, Badge } from "reactstrap";
import { getPOById } from "../../../../helpers/backend_helper";
import "../../UnitOfMeasurement/uom.scss";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const PO_TYPE_LABELS = {
  pr_based: "PR-Based",
  direct: "Direct",
  contract_based: "Contract-Based",
};

const Field = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value ?? "—"}</div>
  </div>
);

const SectionCard = ({ icon, title, children }) => (
  <div className="uom-table-card p-3 mb-4">
    <div className="fw-semibold mb-3 d-flex align-items-center gap-2">
      <i className={`bx ${icon}`}></i> {title}
    </div>
    {children}
  </div>
);

const POOverview = ({ poId, onBack }) => {
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPOById(poId)
      .then((res) => setPo(res?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [poId]);

  if (loading || !po) {
    return <div className="p-4 text-muted">Loading purchase order...</div>;
  }

  const totalQty = po.lineItems.reduce((sum, li) => sum + (li.quantity || 0), 0);

  return (
    <div className="uom-page">
      {/* Header */}
      <div className="uom-list-header">
        <div>
          <h4>
            {po.poNumber}{" "}
            <Badge color={po.status === "approved" ? "success" : "secondary"} className="ms-2">
              {po.status === "approved" ? "Approved" : "Draft"}
            </Badge>{" "}
            <Badge color="light" className="text-dark border ms-1">
              {PO_TYPE_LABELS[po.poType]}
            </Badge>
          </h4>
          <p className="mb-0">
            {po.poTitle && <>{po.poTitle} · </>}
            Vendor: {po.vendorId?.tradeName || po.vendorId?.legalName || "—"}
          </p>
        </div>
        <Button color="light" onClick={onBack}>
          <i className="bx bx-arrow-back me-1"></i> Back
        </Button>
      </div>

      {/* Top summary strip */}
      <Row className="mb-4">
        <Col md={3}>
          <div className="uom-table-card p-3 h-100">
            <div className="text-muted small">Grand Total</div>
            <div className="fs-4 fw-bold">{money(po.netPayable)}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="uom-table-card p-3 h-100">
            <div className="text-muted small">Delivery Date</div>
            <div className="fs-5 fw-semibold">{dateFmt(po.expectedDeliveryDate)}</div>
            <div className="text-muted small">Ordered {dateFmt(po.poDate)}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="uom-table-card p-3 h-100">
            <div className="text-muted small">Lines</div>
            <div className="fs-5 fw-semibold">{po.lineItems.length}</div>
            <div className="text-muted small">{totalQty} qty ordered</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="uom-table-card p-3 h-100">
            <div className="text-muted small">Payment Terms</div>
            <div className="fs-6 fw-semibold">{po.paymentTermId?.name || po.paymentTermId?.description || "—"}</div>
            <div className="text-muted small">
              {po.poType === "direct" ? "Direct — no PR" : po.poType === "contract_based" ? "Contract-based" : "Linked to PR"}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={7}>
          <SectionCard icon="bx-purchase-tag" title="Order & Commercial">
            <Row>
              <Col md={6}><Field label="PO Number" value={po.poNumber} /></Col>
              <Col md={6}><Field label="PO Type" value={PO_TYPE_LABELS[po.poType]} /></Col>
              <Col md={6}><Field label="PO Date" value={dateFmt(po.poDate)} /></Col>
              <Col md={6}><Field label="Delivery Date" value={dateFmt(po.expectedDeliveryDate)} /></Col>
              <Col md={6}><Field label="Vendor" value={po.vendorId?.tradeName || po.vendorId?.legalName} /></Col>
              <Col md={6}><Field label="Currency" value={po.currency} /></Col>
              <Col md={6}><Field label="Criticality" value={po.criticality} /></Col>
              <Col md={6}><Field label="Linked PR" value={po.prId?.prNumber || "—"} /></Col>
              <Col md={6}><Field label="Contract Ref" value={po.contractRef || "—"} /></Col>
              <Col md={6}><Field label="Project Ref" value={po.projectRef || "—"} /></Col>
              <Col md={6}><Field label="Department" value={po.departmentId?.name || "—"} /></Col>
              <Col md={6}><Field label="Budget (FY)" value={po.budgetId?.fiscalYear || "—"} /></Col>
            </Row>
          </SectionCard>

          <SectionCard icon="bx-map-pin" title="Delivery Site">
            <Field label="Site" value={po.deliverySiteId?.title || "—"} />
          </SectionCard>

          <SectionCard icon="bx-list-ul" title={`Line Items (${po.lineItems.length})`}>
            <div style={{ overflowX: "auto" }}>
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Tax %</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {po.lineItems.map((li, idx) => (
                    <tr key={li._id || idx}>
                      <td>{idx + 1}</td>
                      <td>{li.itemName}</td>
                      <td>{li.quantity}</td>
                      <td>{money(li.unitPrice)}</td>
                      <td>{li.taxPercent}%</td>
                      <td className="fw-semibold">{money(li.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {po.remarks && (
            <SectionCard icon="bx-note" title="Remarks">
              <p className="mb-0">{po.remarks}</p>
            </SectionCard>
          )}
        </Col>

        <Col md={5}>
          <SectionCard icon="bx-money" title="Financials">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Sub Total</span>
              <span>{money(po.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Tax</span>
              <span>{money(po.taxAmount)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Grand Total</span>
              <span>{money(po.netPayable)}</span>
            </div>
          </SectionCard>

          <SectionCard icon="bx-store" title="Vendor Details">
            {po.vendorId ? (
              <>
                <Field label="Name" value={po.vendorId.tradeName || po.vendorId.legalName} />
                <Field label="Type" value={po.vendorId.vendorType} />
                <Field label="Contact Person" value={po.vendorId.primaryContact?.name} />
                <Field label="Phone" value={po.vendorId.primaryContact?.phone} />
                <Field label="Bank" value={po.vendorId.bankDetails?.bankName} />
              </>
            ) : (
              <div className="text-muted">No vendor selected</div>
            )}
          </SectionCard>

          <SectionCard icon="bx-check-shield" title="Approval">
            <Field label="Status" value={po.status === "approved" ? "Approved" : "Pending Approval"} />
            {po.status === "approved" && (
              <>
                <Field label="Approved By" value={po.approvedBy || "—"} />
                <Field label="Approved At" value={dateFmt(po.approvedAt)} />
              </>
            )}
          </SectionCard>

          <SectionCard icon="bx-truck" title="Fulfillment">
            <div className="text-muted small">Not started — no deliveries recorded yet.</div>
          </SectionCard>
        </Col>
      </Row>
    </div>
  );
};

export default POOverview;