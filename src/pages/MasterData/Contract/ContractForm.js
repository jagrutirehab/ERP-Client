import React, { useEffect, useState } from "react";
import { Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createContract,
  updateContract,
  getVendors,
  getAllCenters,
  getPRDepartments,
  getBudgets,
  getUserLookup,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import "../UnitOfMeasurement/uom.scss";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function generatePreviewContractId() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `CT${yy}${mm}${dd}${hh}${min}`;
}

const ContractForm = ({ editingItem, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [previewContractId] = useState(generatePreviewContractId());
  const [vendors, setVendors] = useState([]);
  const [centers, setCenters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [ownerSearch, setOwnerSearch] = useState(
    editingItem?.ownerId ? editingItem.ownerId.name || "" : "",
  );
  const [ownerOptions, setOwnerOptions] = useState([]);

  useEffect(() => {
    getVendors({})
      .then((res) => setVendors(res?.data || []))
      .catch(() => {});
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
    getPRDepartments({})
      .then((res) => setDepartments(res?.data || []))
      .catch(() => {});
  }, []);

  const validation = useFormik({
    initialValues: {
      contractNumber: editingItem?.contractNumber || "",
      title: editingItem?.title || "",
      type: editingItem?.type || "",
      subType: editingItem?.subType || "",
      subSubType: editingItem?.subSubType || "",
      centerId: editingItem?.centerId?._id || editingItem?.centerId || "",
      description: editingItem?.description || "",

      contractDate: editingItem?.contractDate
        ? editingItem.contractDate.slice(0, 10)
        : "",
      effectiveDate: editingItem?.effectiveDate
        ? editingItem.effectiveDate.slice(0, 10)
        : "",
      endDate: editingItem?.endDate ? editingItem.endDate.slice(0, 10) : "",
      renewalDate: editingItem?.renewalDate
        ? editingItem.renewalDate.slice(0, 10)
        : "",

      vendorId: editingItem?.vendorId?._id || editingItem?.vendorId || "",
      subVendorId:
        editingItem?.subVendorId?._id || editingItem?.subVendorId || "",
      ownerId: editingItem?.ownerId?._id || editingItem?.ownerId || "",

      currency: editingItem?.currency || "INR",
      contractValue: editingItem?.contractValue ?? "",
      paymentFrequency: editingItem?.paymentFrequency || "",
      securityDeposit: editingItem?.securityDeposit ?? 0,

      budgetId: editingItem?.budgetId?._id || editingItem?.budgetId || "",
      departmentId:
        editingItem?.departmentId?._id || editingItem?.departmentId || "",
      projectRef: editingItem?.projectRef || "",

      notes: editingItem?.notes || "",
    },
    validationSchema: Yup.object({
      contractNumber: Yup.string()
        .trim()
        .required("Contract number is required"),
      title: Yup.string().trim().required("Title is required"),
      type: Yup.string().required("Type is required"),
      vendorId: Yup.string().required("Main vendor is required"),
      contractDate: Yup.date().required("Contract date is required"),
      effectiveDate: Yup.date().required("Effective date is required"),
      endDate: Yup.date()
        .required("End date is required")
        .when("effectiveDate", ([effectiveDate], schema) =>
          effectiveDate
            ? schema.min(
                effectiveDate,
                "End date must be after the effective date",
              )
            : schema,
        ),
      contractValue: Yup.number().min(0).required("Contract value is required"),
    }),
    onSubmit: async (values, { setTouched }) => {
      const errors = await validation.validateForm();
      if (Object.keys(errors).length > 0) {
        setTouched({
          contractNumber: true,
          title: true,
          type: true,
          vendorId: true,
          contractDate: true,
          effectiveDate: true,
          endDate: true,
          contractValue: true,
        });
        toast.error("Please fill in all required fields");
        return;
      }

      const payload = { ...values };
      if (!payload.subVendorId) delete payload.subVendorId;
      if (!payload.ownerId) delete payload.ownerId;
      if (!payload.renewalDate) delete payload.renewalDate;
      if (!payload.budgetId) delete payload.budgetId;
      if (!payload.departmentId) delete payload.departmentId;
      if (!payload.centerId) delete payload.centerId;

      try {
        if (editingItem) {
          await updateContract(editingItem._id, payload);
          toast.success("Contract updated successfully");
        } else {
          await createContract(payload);
          toast.success("Contract created successfully");
        }
        onSaved();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Something went wrong",
          );
        }
      }
    },
  });

  const v = validation.values;

  useEffect(() => {
    if (!v.departmentId) {
      setBudgets([]);
      return;
    }
    getBudgets({ departmentId: v.departmentId, status: "approved" })
      .then((res) => setBudgets(res?.data || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.departmentId]);

  useEffect(() => {
    if (ownerSearch.trim().length < 2) {
      setOwnerOptions([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      getUserLookup({ search: ownerSearch })
        .then((res) => {
          if (!cancelled) setOwnerOptions(res?.data || []);
        })
        .catch(() => {});
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ownerSearch]);

  return (
    <div className="uom-form-page">
      <h4 className="uom-form-title">
        {editingItem ? "Edit Contract" : "Create New Contract"}
      </h4>
      <p className="text-muted mb-4">
        Register a vendor contract in the system
      </p>

      <div className="uom-form-panel">
        <form onSubmit={validation.handleSubmit}>
          <h6 className="uom-form-section-title">Core Contract Details</h6>
          <Row>
            <Col md={4} className="mb-4">
              <Label>Contract ID</Label>
              <Input
                value={editingItem?.contractId || previewContractId}
                disabled
                style={{ background: "#f8f9fb", color: "#667085" }}
              />
            </Col>
            <Col md={4} className="mb-4">
              <Label>
                Contract Number <span className="text-danger">*</span>
              </Label>
              <Input
                value={v.contractNumber}
                onChange={(e) =>
                  validation.setFieldValue("contractNumber", e.target.value)
                }
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.contractNumber &&
                  !!validation.errors.contractNumber
                }
              />
              <FormFeedback>{validation.errors.contractNumber}</FormFeedback>
            </Col>
          </Row>
          <Row>
            <Col md={12} className="mb-4">
              <Label>
                Title <span className="text-danger">*</span>
              </Label>
              <Input
                value={v.title}
                onChange={(e) =>
                  validation.setFieldValue("title", e.target.value)
                }
                onBlur={validation.handleBlur}
                invalid={validation.touched.title && !!validation.errors.title}
              />
              <FormFeedback>{validation.errors.title}</FormFeedback>
            </Col>
          </Row>

          <Row>
            <Col md={4} className="mb-4">
              <Label>
                Type <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={v.type}
                onChange={(e) =>
                  validation.setFieldValue("type", e.target.value)
                }
                onBlur={validation.handleBlur}
                invalid={validation.touched.type && !!validation.errors.type}
              >
                <option value="">Select Type</option>
                <option value="service">Service Contract</option>
                <option value="supply">Supply Contract</option>
                <option value="maintenance">Maintenance Contract</option>
                <option value="consultancy">Consultancy Contract</option>
                <option value="lease">Lease Agreement</option>
                <option value="license">License Agreement</option>
                <option value="other">Other</option>
              </Input>
              <FormFeedback>{validation.errors.type}</FormFeedback>
            </Col>
            <Col md={4} className="mb-4">
              <Label>Sub Type</Label>
              <Input
                type="select"
                value={v.subType}
                onChange={(e) =>
                  validation.setFieldValue("subType", e.target.value)
                }
              >
                <option value="">Select Sub Type</option>
                <option value="fixed_term">Fixed Term</option>
                <option value="renewable">Renewable</option>
                <option value="evergreen">Evergreen</option>
                <option value="milestone_based">Milestone Based</option>
              </Input>
            </Col>
            <Col md={4} className="mb-4">
              <Label>Sub Sub Type</Label>
              <Input
                type="select"
                value={v.subSubType}
                onChange={(e) =>
                  validation.setFieldValue("subSubType", e.target.value)
                }
              >
                <option value="">Select Sub Sub Type</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="basic">Basic</option>
                <option value="custom">Custom</option>
              </Input>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-4">
              <Label>Location</Label>
              <Input
                type="select"
                value={v.centerId}
                onChange={(e) =>
                  validation.setFieldValue("centerId", e.target.value)
                }
              >
                <option value="">Select Location</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={6} className="mb-4">
              <Label>Description</Label>
              <Input
                value={v.description}
                onChange={(e) =>
                  validation.setFieldValue("description", e.target.value)
                }
              />
            </Col>
          </Row>

          <h6 className="uom-form-section-title mt-2">Dates & Renewals</h6>
          <Row>
            <Col md={3} className="mb-4">
              <Label>
                Contract Date <span className="text-danger">*</span>
              </Label>
              <Input
                type="date"
                value={v.contractDate}
                onChange={(e) =>
                  validation.setFieldValue("contractDate", e.target.value)
                }
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.contractDate &&
                  !!validation.errors.contractDate
                }
              />
              <FormFeedback>{validation.errors.contractDate}</FormFeedback>
            </Col>
            <Col md={3} className="mb-4">
              <Label>
                Effective Date <span className="text-danger">*</span>
              </Label>
              <Input
                type="date"
                value={v.effectiveDate}
                onChange={(e) =>
                  validation.setFieldValue("effectiveDate", e.target.value)
                }
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.effectiveDate &&
                  !!validation.errors.effectiveDate
                }
              />
              <FormFeedback>{validation.errors.effectiveDate}</FormFeedback>
            </Col>
            <Col md={3} className="mb-4">
              <Label>
                End Date <span className="text-danger">*</span>
              </Label>
              <Input
                type="date"
                value={v.endDate}
                onChange={(e) =>
                  validation.setFieldValue("endDate", e.target.value)
                }
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.endDate && !!validation.errors.endDate
                }
              />
              <FormFeedback>{validation.errors.endDate}</FormFeedback>
            </Col>
            <Col md={3} className="mb-4">
              <Label>Renewal Date</Label>
              <Input
                type="date"
                value={v.renewalDate}
                onChange={(e) =>
                  validation.setFieldValue("renewalDate", e.target.value)
                }
              />
            </Col>
          </Row>

          <h6 className="uom-form-section-title mt-2">Parties & Ownership</h6>
          <Row>
            <Col md={4} className="mb-4">
              <Label>
                Main Vendor <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={v.vendorId}
                onChange={(e) =>
                  validation.setFieldValue("vendorId", e.target.value)
                }
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.vendorId && !!validation.errors.vendorId
                }
              >
                <option value="">Select Vendor</option>
                {vendors.map((vd) => (
                  <option key={vd._id} value={vd._id}>
                    {vd.tradeName || vd.legalName}
                  </option>
                ))}
              </Input>
              <FormFeedback>{validation.errors.vendorId}</FormFeedback>
            </Col>
            <Col md={4} className="mb-4">
              <Label>Sub Vendor (Optional)</Label>
              <Input
                type="select"
                value={v.subVendorId}
                onChange={(e) =>
                  validation.setFieldValue("subVendorId", e.target.value)
                }
              >
                <option value="">Select Vendor</option>
                {vendors.map((vd) => (
                  <option key={vd._id} value={vd._id}>
                    {vd.tradeName || vd.legalName}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={4} className="mb-4">
              <Label>Contract Owner</Label>
              <Input
                placeholder="Search user by name..."
                value={ownerSearch}
                onChange={(e) => {
                  setOwnerSearch(e.target.value);
                  validation.setFieldValue("ownerId", "");
                }}
              />
              {ownerOptions.length > 0 && !v.ownerId && (
                <div
                  className="uom-table-card mt-1"
                  style={{ maxHeight: 160, overflowY: "auto" }}
                >
                  {ownerOptions.map((u) => (
                    <div
                      key={u._id}
                      style={{
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                      onMouseDown={() => {
                        validation.setFieldValue("ownerId", u._id);
                        setOwnerSearch(u.name);
                        setOwnerOptions([]);
                      }}
                    >
                      {u.name} <span className="text-muted">({u.email})</span>
                    </div>
                  ))}
                </div>
              )}
            </Col>
          </Row>

          <h6 className="uom-form-section-title mt-2">Financials</h6>
          <Row>
            <Col md={3} className="mb-4">
              <Label>Currency</Label>
              <Input
                type="select"
                value={v.currency}
                onChange={(e) =>
                  validation.setFieldValue("currency", e.target.value)
                }
              >
                <option value="INR">India (INR)</option>
                <option value="USD">United States (USD)</option>
                <option value="EUR">Europe (EUR)</option>
                <option value="GBP">United Kingdom (GBP)</option>
                <option value="AED">United Arab Emirates (AED)</option>
              </Input>
            </Col>
            <Col md={3} className="mb-4">
              <Label>
                Contract Value <span className="text-danger">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                value={v.contractValue}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  validation.setFieldValue("contractValue", e.target.value)
                }
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.contractValue &&
                  !!validation.errors.contractValue
                }
              />
              <FormFeedback>{validation.errors.contractValue}</FormFeedback>
            </Col>
            <Col md={3} className="mb-4">
              <Label>Payment Frequency</Label>
              <Input
                type="select"
                value={v.paymentFrequency}
                onChange={(e) =>
                  validation.setFieldValue("paymentFrequency", e.target.value)
                }
              >
                <option value="">Select Frequency</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </Input>
            </Col>
            <Col md={3} className="mb-4">
              <Label>Security Deposit</Label>
              <Input
                type="number"
                min={0}
                value={v.securityDeposit}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  validation.setFieldValue("securityDeposit", e.target.value)
                }
              />
            </Col>
          </Row>

          <h6 className="uom-form-section-title mt-2">Links & References</h6>
          <Row>
            <Col md={4} className="mb-4">
              <Label>Department</Label>
              <Input
                type="select"
                value={v.departmentId}
                onChange={(e) => {
                  validation.setFieldValue("departmentId", e.target.value);
                  validation.setFieldValue("budgetId", "");
                }}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={4} className="mb-4">
              <Label>Budget</Label>
              <Input
                type="select"
                value={v.budgetId}
                disabled={!v.departmentId}
                onChange={(e) =>
                  validation.setFieldValue("budgetId", e.target.value)
                }
              >
                <option value="">
                  {v.departmentId ? "Select Budget" : "Select Department first"}
                </option>
                {budgets.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.fiscalYear} — {money(b.approvedAmount)}
                    {b.budgetType === "global" ? " (Global)" : ""}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={4} className="mb-4">
              <Label>Project Reference (Optional)</Label>
              <Input
                value={v.projectRef}
                onChange={(e) =>
                  validation.setFieldValue("projectRef", e.target.value)
                }
                placeholder="Search or select project"
              />
            </Col>
          </Row>

          <h6 className="uom-form-section-title mt-2">
            Additional Information
          </h6>
          <Row>
            <Col md={12} className="mb-4">
              <Label>Notes</Label>
              <Input
                type="textarea"
                rows={3}
                value={v.notes}
                onChange={(e) =>
                  validation.setFieldValue("notes", e.target.value)
                }
              />
            </Col>
          </Row>

          <div className="uom-form-footer d-flex justify-content-end gap-2">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={validation.isSubmitting}
            >
              {validation.isSubmitting
                ? "Saving..."
                : editingItem
                  ? "Save changes"
                  : "Create Contract"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractForm;
