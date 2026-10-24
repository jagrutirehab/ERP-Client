import React, { useEffect, useState } from "react";
import { Row, Col, Button, Badge } from "reactstrap";
import { getContractById } from "../../../helpers/backend_helper";
import "../UnitOfMeasurement/uom.scss";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const TYPE_LABELS = {
  service: "Service Contract",
  supply: "Supply Contract",
  maintenance: "Maintenance Contract",
  consultancy: "Consultancy Contract",
  lease: "Lease Agreement",
  license: "License Agreement",
  other: "Other",
};

const Field = ({ label, value }) => (
  <div className="mb-3">
    <div className="text-muted small">{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
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

const ContractOverview = ({ contractId, onBack }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getContractById(contractId)
      .then((res) => setContract(res?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contractId]);

  if (loading || !contract) {
    return <div className="p-4 text-muted">Loading contract...</div>;
  }

  const daysToEnd = contract.endDate
    ? Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>
            {contract.contractId}{" "}
            <Badge
              color={
                contract.status === "active"
                  ? "success"
                  : contract.status === "expired"
                    ? "secondary"
                    : "danger"
              }
              className="ms-2"
            >
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </Badge>
          </h4>
          <p className="mb-0">
            {contract.title} · {contract.contractNumber}
          </p>
        </div>
        <Button color="light" onClick={onBack}>
          <i className="bx bx-arrow-back me-1"></i> Back
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <div className="uom-table-card p-3 h-100">
            <div className="text-muted small">Contract Value</div>
            <div className="fs-4 fw-bold">{money(contract.contractValue)}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="uom-table-card p-3 h-100">
            <div className="text-muted small">End Date</div>
            <div className="fs-5 fw-semibold">{dateFmt(contract.endDate)}</div>
            {daysToEnd !== null && (
              <div className={`small ${daysToEnd < 30 ? "text-danger" : "text-muted"}`}>
                {daysToEnd >= 0 ? `${daysToEnd} days remaining` : "Expired"}
              </div>
            )}
          </div>
        </Col>
        <Col md={3}>
          <div className="uom-table-card p-3 h-100">
            <div className="text-muted small">Type</div>
            <div className="fs-6 fw-semibold">{TYPE_LABELS[contract.type]}</div>
            <div className="text-muted small text-capitalize">
              {contract.subType?.replace(/_/g, " ") || "—"}
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="uom-table-card p-3 h-100">
            <div className="text-muted small">Payment Frequency</div>
            <div className="fs-6 fw-semibold text-capitalize">
              {contract.paymentFrequency || "—"}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={7}>
          <SectionCard icon="bx-file" title="Core Details">
            <Row>
              <Col md={6}><Field label="Contract ID" value={contract.contractId} /></Col>
              <Col md={6}><Field label="Contract Number" value={contract.contractNumber} /></Col>
              <Col md={6}><Field label="Type" value={TYPE_LABELS[contract.type]} /></Col>
              <Col md={6}><Field label="Sub Type" value={contract.subType?.replace(/_/g, " ")} /></Col>
              <Col md={6}><Field label="Sub Sub Type" value={contract.subSubType} /></Col>
              <Col md={6}><Field label="Location" value={contract.centerId?.title} /></Col>
              <Col md={12}><Field label="Description" value={contract.description} /></Col>
            </Row>
          </SectionCard>

          <SectionCard icon="bx-calendar" title="Dates & Renewals">
            <Row>
              <Col md={4}><Field label="Contract Date" value={dateFmt(contract.contractDate)} /></Col>
              <Col md={4}><Field label="Effective Date" value={dateFmt(contract.effectiveDate)} /></Col>
              <Col md={4}><Field label="End Date" value={dateFmt(contract.endDate)} /></Col>
              <Col md={4}><Field label="Renewal Date" value={dateFmt(contract.renewalDate)} /></Col>
            </Row>
          </SectionCard>

          <SectionCard icon="bx-link" title="Links & References">
            <Row>
              <Col md={6}><Field label="Department" value={contract.departmentId?.name} /></Col>
              <Col md={6}>
                <Field
                  label="Budget"
                  value={
                    contract.budgetId
                      ? `${contract.budgetId.fiscalYear} — ${money(contract.budgetId.approvedAmount)}`
                      : "—"
                  }
                />
              </Col>
              <Col md={6}><Field label="Project Reference" value={contract.projectRef} /></Col>
            </Row>
          </SectionCard>

          {contract.notes && (
            <SectionCard icon="bx-note" title="Notes">
              <p className="mb-0">{contract.notes}</p>
            </SectionCard>
          )}
        </Col>

        <Col md={5}>
          <SectionCard icon="bx-money" title="Financials">
            <Field label="Currency" value={contract.currency} />
            <Field label="Contract Value" value={money(contract.contractValue)} />
            <Field label="Security Deposit" value={money(contract.securityDeposit)} />
          </SectionCard>

          <SectionCard icon="bx-store" title="Main Vendor">
            {contract.vendorId ? (
              <>
                <Field
                  label="Name"
                  value={contract.vendorId.tradeName || contract.vendorId.legalName}
                />
                <Field label="Contact Person" value={contract.vendorId.primaryContact?.name} />
                <Field label="Phone" value={contract.vendorId.primaryContact?.phone} />
              </>
            ) : (
              <div className="text-muted">No vendor</div>
            )}
          </SectionCard>

          {contract.subVendorId && (
            <SectionCard icon="bx-store-alt" title="Sub Vendor">
              <Field
                label="Name"
                value={contract.subVendorId.tradeName || contract.subVendorId.legalName}
              />
            </SectionCard>
          )}

          <SectionCard icon="bx-user-check" title="Ownership">
            <Field label="Contract Owner" value={contract.ownerId?.name} />
          </SectionCard>
        </Col>
      </Row>
    </div>
  );
};

export default ContractOverview;