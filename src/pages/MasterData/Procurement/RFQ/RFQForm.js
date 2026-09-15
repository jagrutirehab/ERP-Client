import React, { useEffect, useState } from "react";
import { Row, Col, Label, Input, FormFeedback, Button, Modal, ModalBody } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { createRFQ, getPRs, getVendors } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const RFQForm = ({ onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [approvedPRs, setApprovedPRs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [detailVendor, setDetailVendor] = useState(null);

  useEffect(() => {
    getPRs({ status: "approved" })
      .then((res) => setApprovedPRs(res?.data || []))
      .catch(() => {});
    getVendors({})
      .then((res) => setVendors(res?.data || []))
      .catch(() => {});
  }, []);

  const validation = useFormik({
    initialValues: {
      prId: "",
      dueDate: "",
      remarks: "",
      vendorIds: [],
    },
    validationSchema: Yup.object({
      prId: Yup.string().required("Select a Purchase Requisition"),
      vendorIds: Yup.array().min(1, "Select at least one vendor").required(),
    }),
    onSubmit: async (values, { setTouched }) => {
      const errors = await validation.validateForm();
      if (Object.keys(errors).length > 0) {
        setTouched({ prId: true, vendorIds: true });
        toast.error("Please fill in all required fields");
        return;
      }
      try {
        await createRFQ(values);
        toast.success("RFQ created successfully");
        onSaved();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message || error?.message || "Something went wrong",
          );
        }
      }
    },
  });

  const v = validation.values;
  const selectedPR = approvedPRs.find((pr) => pr._id === v.prId);

  const toggleVendor = (vendorId) => {
    const current = v.vendorIds;
    if (current.includes(vendorId)) {
      validation.setFieldValue(
        "vendorIds",
        current.filter((id) => id !== vendorId),
      );
    } else {
      validation.setFieldValue("vendorIds", [...current, vendorId]);
    }
  };

  return (
    <div className="uom-form-page">
      <h4 className="uom-form-title">Create RFQ</h4>
      <p className="text-muted mb-4">
        Select an approved PR and choose vendors to request quotes from
      </p>

      <div className="uom-form-panel">
        <form onSubmit={validation.handleSubmit}>
          <h6 className="uom-form-section-title">Reference</h6>
          <Row>
            <Col md={6} className="mb-4">
              <Label>
                Purchase Requisition (Approved only) <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={v.prId}
                onChange={(e) => validation.setFieldValue("prId", e.target.value)}
                onBlur={validation.handleBlur}
                invalid={validation.touched.prId && !!validation.errors.prId}
              >
                <option value="">Select PR</option>
                {approvedPRs.map((pr) => (
                  <option key={pr._id} value={pr._id}>
                    {pr.prNumber} — {pr.prTitle}
                  </option>
                ))}
              </Input>
              <FormFeedback>{validation.errors.prId}</FormFeedback>
              {approvedPRs.length === 0 && (
                <div className="text-muted small mt-1">
                  No approved PRs available. Approve a PR first.
                </div>
              )}
            </Col>
            <Col md={6} className="mb-4">
              <Label>Due Date (Optional)</Label>
              <Input
                type="date"
                value={v.dueDate}
                onChange={(e) => validation.setFieldValue("dueDate", e.target.value)}
              />
            </Col>
          </Row>

          {selectedPR && (
            <div className="uom-table-card p-3 mb-4">
              <div className="fw-semibold small mb-2">Items in this PR</div>
              {(selectedPR.lineItems || []).map((li, idx) => (
                <div key={idx} className="d-flex justify-content-between small text-muted mb-1">
                  <span>{li.itemName}</span>
                  <span>Qty: {li.quantity}</span>
                </div>
              ))}
            </div>
          )}

          <h6 className="uom-form-section-title mt-2">
            Select Vendors <span className="text-danger">*</span>
          </h6>
          <p className="uom-form-section-sub">
            Choose 3–4 vendors to request quotes from (you'll contact them manually)
          </p>
          <Row className="mb-2">
            {vendors.map((vd) => (
              <Col md={4} key={vd._id} className="mb-2">
                <div
                  className="im-checkbox-row"
                  style={{
                    border: "1px solid #e4e7ec",
                    borderRadius: 8,
                    padding: 10,
                    background: v.vendorIds.includes(vd._id) ? "#eef2ff" : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={v.vendorIds.includes(vd._id)}
                    readOnly
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleVendor(vd._id)}
                  />
                  <div style={{ cursor: "pointer" }} onClick={() => setDetailVendor(vd)}>
                    <span className="small fw-semibold d-block text-primary">
                      {vd.tradeName || vd.legalName}
                    </span>
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      {vd.vendorCode}
                      {vd.primaryContact?.phone ? ` · ${vd.primaryContact.phone}` : ""}
                    </span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
          {validation.touched.vendorIds && validation.errors.vendorIds && (
            <div className="text-danger small mb-3">{validation.errors.vendorIds}</div>
          )}

          <Row>
            <Col md={12} className="mb-4">
              <Label>Remarks</Label>
              <Input
                type="textarea"
                rows={2}
                value={v.remarks}
                onChange={(e) => validation.setFieldValue("remarks", e.target.value)}
                placeholder="Any notes for this RFQ"
              />
            </Col>
          </Row>

          <div className="uom-form-footer d-flex justify-content-end gap-2">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={validation.isSubmitting}>
              {validation.isSubmitting ? "Creating..." : "Create RFQ"}
            </Button>
          </div>
        </form>
      </div>

      <Modal isOpen={!!detailVendor} toggle={() => setDetailVendor(null)} centered>
        <ModalBody className="p-4">
          {detailVendor && (
            <>
              <h5 className="mb-1">{detailVendor.tradeName || detailVendor.legalName}</h5>
              <span className="uom-symbol-badge mb-3 d-inline-block">
                {detailVendor.vendorCode}
              </span>

              <div className="mb-3">
                <div className="text-muted small">Vendor Type</div>
                <div className="text-capitalize">
                  {(detailVendor.vendorType || "—").replace(/_/g, " ")}
                </div>
              </div>

              <Row className="mb-3">
                <Col md={6}>
                  <div className="text-muted small">PAN</div>
                  <div>{detailVendor.pan || "—"}</div>
                </Col>
                <Col md={6}>
                  <div className="text-muted small">GSTIN</div>
                  <div>{detailVendor.gstRegistrations?.[0]?.gstin || "—"}</div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <div className="text-muted small">Contact Person</div>
                  <div>{detailVendor.primaryContact?.name || "—"}</div>
                </Col>
                <Col md={6}>
                  <div className="text-muted small">Phone</div>
                  <div>{detailVendor.primaryContact?.phone || "—"}</div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <div className="text-muted small">Email</div>
                  <div>{detailVendor.primaryContact?.email || "—"}</div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <div className="text-muted small">Bank Name</div>
                  <div>{detailVendor.bankDetails?.bankName || "—"}</div>
                </Col>
                <Col md={6}>
                  <div className="text-muted small">Status</div>
                  <div className="text-capitalize">{detailVendor.status || "—"}</div>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button color="light" onClick={() => setDetailVendor(null)}>
                  Close
                </Button>
                <Button
                  color={v.vendorIds.includes(detailVendor._id) ? "danger" : "primary"}
                  onClick={() => {
                    toggleVendor(detailVendor._id);
                    setDetailVendor(null);
                  }}
                >
                  {v.vendorIds.includes(detailVendor._id) ? "Remove Vendor" : "Select Vendor"}
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default RFQForm;