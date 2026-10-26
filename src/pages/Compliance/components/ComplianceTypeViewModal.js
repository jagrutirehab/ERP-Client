import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { formatDateTime } from "../../../utils/time";

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

const ComplianceTypeViewModal = ({ isOpen, toggle, type }) => {
  if (!type) return null;

  const centreLabel = type.applicableCenters?.length
    ? type.applicableCenters.map((c) => capitalizeWords(c.title)).filter(Boolean).join(", ")
    : "No centres";

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>Compliance type details</ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-0">{capitalizeWords(type.name)}</h5>
            <span className="text-muted" style={{ fontSize: 13 }}>
              {capitalizeWords(type.shortName)}
            </span>
          </div>
          <span
            className="fw-medium"
            style={{ fontSize: 13, color: type.active ? "#1D5A41" : "#66706C" }}
          >
            {type.active ? "Active" : "Inactive"}
          </span>
        </div>

        <Field label="Category">
          {type.category?.name ? capitalizeWords(type.category.name) : "—"}
        </Field>
        <Field label="Issuing authority">
          {type.issuingAuthorityHint ? capitalizeWords(type.issuingAuthorityHint) : "—"}
        </Field>
        <Field label="Has expiry">{type.hasExpiry ? "Yes" : "No"}</Field>
        {type.hasExpiry && <Field label="Default renewal lead time">{type.defaultLeadDays} days</Field>}
        <Field label="Applicable centres">{centreLabel}</Field>
        <Field label="Author">{type.createdBy?.name ? capitalizeWords(type.createdBy.name) : "—"}</Field>
        <Field label="Created on">{formatDateTime(type.createdAt)}</Field>
        <Field label="Last updated by">
          {type.updatedBy?.name ? capitalizeWords(type.updatedBy.name) : "—"}
        </Field>
        <Field label="Last updated">{formatDateTime(type.updatedAt)}</Field>

        {!!type.checklistSteps?.length && (
          <div className="mt-3">
            <div className="text-muted mb-2" style={{ fontSize: 13 }}>
              Renewal checklist
            </div>
            <ol className="ps-3 mb-0" style={{ fontSize: 13 }}>
              {type.checklistSteps.map((step) => (
                <li key={step.text || step} className="d-flex align-items-center gap-2">
                  <span>{capitalizeWords(step.text || step)}</span>
                  {step.mandatory && (
                    <span className="badge bg-danger-subtle text-danger" style={{ fontSize: 11 }}>
                      Mandatory
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ComplianceTypeViewModal;
