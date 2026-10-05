import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createPO,
  getClosedRFQs,
  getVendors,
  getPRDepartments,
  getBudgets,
  getUoms,
  getAllCenters,
  getPaymentTerms,
  getItemMasters,
  getContracts,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const emptyLineItem = () => ({
  itemName: "",
  description: "",
  quantity: 1,
  uomId: "",
  unitPrice: 0,
  taxPercent: 0,
});

const POForm = ({ onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [closedRFQs, setClosedRFQs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [centers, setCenters] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [itemSearchState, setItemSearchState] = useState({});
  const itemSearchTimers = useRef({});
  const itemInputRefs = useRef({});

  useEffect(() => {
    getClosedRFQs({})
      .then((res) => setClosedRFQs(res?.data || []))
      .catch(() => {});
    getVendors({})
      .then((res) => setVendors(res?.data || []))
      .catch(() => {});
    getPRDepartments({})
      .then((res) => setDepartments(res?.data || []))
      .catch(() => {});
    getUoms({})
      .then((res) => setUoms(res?.data || []))
      .catch(() => {});
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
    getPaymentTerms({})
      .then((res) => setPaymentTerms(res?.data || []))
      .catch(() => {});
    getContracts({ status: "active" })
      .then((res) => setContracts(res?.data || []))
      .catch(() => {});
  }, []);

  const validation = useFormik({
    initialValues: {
      poType: "pr_based",
      poTitle: "",
      startDate: "",
      endDate: "",
      currency: "INR",
      rfqId: "",
      vendorId: "",
      contractId: "",
      projectRef: "",
      justification: "",
      budgetId: "",
      departmentId: "",
      paymentTermId: "",
      deliverySiteId: "",
      billingSiteId: "",
      expectedDeliveryDate: "",
      criticality: "medium",
      remarks: "",
      lineItems: [emptyLineItem()],
    },
    validationSchema: Yup.object({
      poType: Yup.string().required(),
      vendorId: Yup.string().required("Vendor is required"),
      rfqId: Yup.string().when("poType", {
        is: "pr_based",
        then: (schema) => schema.required("Select a closed RFQ"),
      }),
      contractId: Yup.string().when("poType", {
        is: "contract_based",
        then: (schema) => schema.required("Please select a contract"),
      }),
      budgetId: Yup.string().when("poType", {
        is: (val) => val !== "pr_based",
        then: (schema) => schema.required("Budget is required"),
      }),
      deliverySiteId: Yup.string().required("Delivery site is required"),
      justification: Yup.string().when("poType", {
        is: "direct",
        then: (schema) =>
          schema
            .min(10, "Minimum 10 characters required")
            .required("Justification is required"),
      }),
      lineItems: Yup.array().when("poType", {
        is: (val) => val !== "pr_based",
        then: (schema) =>
          schema.min(1, "Add at least one line item").of(
            Yup.object({
              itemName: Yup.string().trim().required("Item name is required"),
              quantity: Yup.number().moreThan(0).required(),
              unitPrice: Yup.number().min(0).required(),
            }),
          ),
      }),
    }),
    onSubmit: async (values, { setTouched }) => {
      const errors = await validation.validateForm();
      if (Object.keys(errors).length > 0) {
        setTouched({
          poType: true,
          vendorId: true,
          rfqId: true,
          contractId: true,
          budgetId: true,
          justification: true,
          lineItems: true,
          deliverySiteId: true,
        });
        toast.error("Please fill in all required fields");
        return;
      }

      if (
        values.poType !== "pr_based" &&
        selectedBudget &&
        netPayable > selectedBudget.approvedAmount
      ) {
        toast.error(
          `This PO (${money(netPayable)}) exceeds the approved budget (${money(selectedBudget.approvedAmount)}). Please reduce the amount or select a different budget.`,
        );
        return;
      }

      const payload = { ...values };
      if (values.poType === "pr_based") {
        delete payload.lineItems;
        delete payload.contractRef;
        delete payload.justification;
        delete payload.budgetId;
        delete payload.departmentId;
      } else {
        delete payload.rfqId;
        payload.lineItems = values.lineItems.map((li) => ({
          ...li,
          quantity: Number(li.quantity) || 0,
          unitPrice: Number(li.unitPrice) || 0,
          taxPercent: Number(li.taxPercent) || 0,
        }));
        if (values.poType !== "direct") delete payload.justification;
      }

      if (!payload.paymentTermId) delete payload.paymentTermId;
      // if (!payload.deliverySiteId) delete payload.deliverySiteId;
      if (!payload.billingSiteId) delete payload.billingSiteId;
      if (!payload.expectedDeliveryDate) delete payload.expectedDeliveryDate;
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      if (!payload.projectRef) delete payload.projectRef;
      if (!payload.contractId) delete payload.contractId;

      try {
        await createPO(payload);
        toast.success("Purchase order created as draft");
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
    if (!v.rfqId) {
      setSelectedRFQ(null);
      validation.setFieldValue("vendorId", "");
      return;
    }
    const rfq = closedRFQs.find((r) => r._id === v.rfqId);
    setSelectedRFQ(rfq || null);
    validation.setFieldValue("vendorId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.rfqId]);

  const quotedVendorsForRFQ = (selectedRFQ?.vendorQuotes || []).filter(
    (vq) => vq.quotedAt,
  );

  const addLineItem = () => {
    validation.setFieldValue("lineItems", [...v.lineItems, emptyLineItem()]);
  };
  const removeLineItem = (idx) => {
    if (v.lineItems.length === 1) return;
    validation.setFieldValue(
      "lineItems",
      v.lineItems.filter((_, i) => i !== idx),
    );
    setItemSearchState((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };
  const updateLineItem = (idx, field, value) => {
    validation.setFieldValue(
      "lineItems",
      v.lineItems.map((li, i) => (i === idx ? { ...li, [field]: value } : li)),
    );
  };

  const setItemSearchFor = (idx, patch) => {
    setItemSearchState((prev) => ({
      ...prev,
      [idx]: {
        search: "",
        options: [],
        showDropdown: false,
        ...prev[idx],
        ...patch,
      },
    }));
  };

  const searchItemsForLine = (idx, term) => {
    const shouldClearOptions = term.trim().length < 2;
    setItemSearchFor(idx, {
      search: term,
      showDropdown: true,
      ...(shouldClearOptions ? { options: [] } : {}),
    });

    if (itemSearchTimers.current[idx])
      clearTimeout(itemSearchTimers.current[idx]);
    if (shouldClearOptions) return;

    itemSearchTimers.current[idx] = setTimeout(() => {
      getItemMasters({ search: term, limit: 10 })
        .then((res) => {
          setItemSearchFor(idx, { options: res?.data || [] });
        })
        .catch(() => {});
    }, 300);
  };

  const selectItemForLine = (idx, item) => {
    validation.setFieldValue(
      "lineItems",
      v.lineItems.map((li, i) =>
        i === idx
          ? {
              ...li,
              itemName: item.itemName || "",
              description: item.longDescription || item.itemName || "",
              uomId: item.uomId?._id || item.uomId || li.uomId,
              unitPrice: item.basePrice ?? li.unitPrice,
            }
          : li,
      ),
    );
    setItemSearchFor(idx, {
      search: `${item.itemCode} - ${item.itemName}`,
      options: [],
      showDropdown: false,
    });
  };

  const calc = v.lineItems.reduce(
    (acc, li) => {
      const base = (Number(li.quantity) || 0) * (Number(li.unitPrice) || 0);
      const tax = base * ((Number(li.taxPercent) || 0) / 100);
      acc.subtotal += base;
      acc.tax += tax;
      return acc;
    },
    { subtotal: 0, tax: 0 },
  );
  const netPayable = calc.subtotal + calc.tax;
  const selectedBudget = budgets.find((b) => b._id === v.budgetId);

  return (
    <div className="uom-form-page">
      <h4 className="uom-form-title">Create Purchase Order</h4>
      <p className="text-muted mb-4">Vendor · terms · line items · submit</p>

      <div className="uom-form-panel">
        <form onSubmit={validation.handleSubmit}>
          {/* ---------- PO Type ---------- */}
          <h6 className="uom-form-section-title">PO Type</h6>
          <Row className="mb-4">
            {[
              {
                key: "pr_based",
                label: "PR-Based",
                sub: "Standard flow from an approved PR + closed RFQ",
              },
              {
                key: "direct",
                label: "Direct",
                sub: "Emergency — skips PR/RFQ",
              },
              {
                key: "contract_based",
                label: "Contract-Based",
                sub: "Pre-negotiated vendor rate contract",
              },
            ].map((opt) => (
              <Col md={4} key={opt.key}>
                <div
                  className="im-checkbox-row"
                  style={{
                    border: "1px solid #e4e7ec",
                    borderRadius: 8,
                    padding: 12,
                    cursor: "pointer",
                    background: v.poType === opt.key ? "#eef2ff" : "#fff",
                  }}
                  onClick={() => validation.setFieldValue("poType", opt.key)}
                >
                  <input type="radio" checked={v.poType === opt.key} readOnly />
                  <div>
                    <div className="fw-semibold small">{opt.label}</div>
                    <div className="text-muted" style={{ fontSize: 11.5 }}>
                      {opt.sub}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* ---------- PO Details ---------- */}
          <h6 className="uom-form-section-title">PO Details</h6>
          <Row>
            <Col md={4} className="mb-4">
              <Label>PO Title</Label>
              <Input
                value={v.poTitle}
                onChange={(e) =>
                  validation.setFieldValue("poTitle", e.target.value)
                }
              />
            </Col>
            <Col md={4} className="mb-4">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={v.startDate}
                onChange={(e) =>
                  validation.setFieldValue("startDate", e.target.value)
                }
              />
            </Col>
            <Col md={4} className="mb-4">
              <Label>End Date</Label>
              <Input
                type="date"
                value={v.endDate}
                onChange={(e) =>
                  validation.setFieldValue("endDate", e.target.value)
                }
              />
            </Col>
          </Row>

          {/* ---------- PR-Based: RFQ + Vendor (from quotes) ---------- */}
          {v.poType === "pr_based" && (
            <>
              <h6 className="uom-form-section-title mt-2">Reference</h6>
              <Row>
                <Col md={6} className="mb-4">
                  <Label>
                    Closed RFQ <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={v.rfqId}
                    onChange={(e) =>
                      validation.setFieldValue("rfqId", e.target.value)
                    }
                    invalid={
                      validation.touched.rfqId && !!validation.errors.rfqId
                    }
                  >
                    <option value="">Select Closed RFQ</option>
                    {closedRFQs.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.rfqNumber} — {r.prId?.prTitle}
                      </option>
                    ))}
                  </Input>
                  <FormFeedback>{validation.errors.rfqId}</FormFeedback>
                </Col>
                <Col md={6} className="mb-4">
                  <Label>
                    Vendor (from RFQ quotes){" "}
                    <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={v.vendorId}
                    disabled={!v.rfqId}
                    onChange={(e) =>
                      validation.setFieldValue("vendorId", e.target.value)
                    }
                    invalid={
                      validation.touched.vendorId &&
                      !!validation.errors.vendorId
                    }
                  >
                    <option value="">
                      {v.rfqId ? "Select Vendor" : "Select RFQ first"}
                    </option>
                    {quotedVendorsForRFQ.map((vq) => (
                      <option
                        key={vq.vendorId._id || vq.vendorId}
                        value={vq.vendorId._id || vq.vendorId}
                      >
                        {vq.vendorId?.tradeName || vq.vendorId?.legalName} —{" "}
                        {money(vq.totalAmount)}
                      </option>
                    ))}
                  </Input>
                  <FormFeedback>{validation.errors.vendorId}</FormFeedback>
                </Col>
              </Row>

              {selectedRFQ && (
                <div className="uom-table-card p-3 mb-4">
                  <div className="fw-semibold small mb-2">
                    Line Items (from RFQ quote)
                  </div>
                  {v.vendorId ? (
                    quotedVendorsForRFQ
                      .find(
                        (vq) => (vq.vendorId._id || vq.vendorId) === v.vendorId,
                      )
                      ?.lineItemQuotes.map((li, idx) => (
                        <div
                          key={idx}
                          className="d-flex justify-content-between small text-muted mb-1"
                        >
                          <span>
                            {li.itemName} (Qty: {li.quantity})
                          </span>
                          <span>{money(li.amount)}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-muted small">
                      Select a vendor to preview line items.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ---------- Direct / Contract-Based: Vendor + Contract + Justification ---------- */}
          {v.poType !== "pr_based" && (
            <>
              <h6 className="uom-form-section-title mt-2">
                {v.poType === "contract_based" ? "Contract" : "Vendor"}
              </h6>
              <Row>
                {v.poType === "contract_based" && (
                  <Col md={4} className="mb-4">
                    <Label>
                      Contract <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="select"
                      value={v.contractId}
                      onChange={(e) => {
                        const contractId = e.target.value;
                        validation.setFieldValue("contractId", contractId);
                        const c = contracts.find((ct) => ct._id === contractId);
                        if (c?.vendorId) {
                          validation.setFieldValue(
                            "vendorId",
                            c.vendorId._id || c.vendorId,
                          );
                        }
                        if (c?.departmentId) {
                          validation.setFieldValue(
                            "departmentId",
                            c.departmentId._id || c.departmentId,
                          );
                        }
                        if (c?.budgetId) {
                          // Pre-fill; the department-change effect below will
                          // refresh the budgets list, then this value applies.
                          validation.setFieldValue(
                            "budgetId",
                            c.budgetId._id || c.budgetId,
                          );
                        }
                      }}
                      invalid={
                        validation.touched.contractId &&
                        !!validation.errors.contractId
                      }
                    >
                      <option value="">Select Contract</option>
                      {contracts.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.contractId} — {c.title}
                        </option>
                      ))}
                    </Input>
                    <FormFeedback>{validation.errors.contractId}</FormFeedback>
                  </Col>
                )}
                <Col
                  md={v.poType === "contract_based" ? 8 : 12}
                  className="mb-4"
                >
                  <Label>
                    Vendor <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={v.vendorId}
                    onChange={(e) =>
                      validation.setFieldValue("vendorId", e.target.value)
                    }
                    invalid={
                      validation.touched.vendorId &&
                      !!validation.errors.vendorId
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
              </Row>

              {v.poType === "direct" && (
                <Row>
                  <Col md={12} className="mb-4">
                    <Label>
                      Justification (Required for Direct PO){" "}
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="textarea"
                      rows={2}
                      placeholder="Please provide justification for direct purchase order (minimum 10 characters)..."
                      value={v.justification}
                      onChange={(e) =>
                        validation.setFieldValue(
                          "justification",
                          e.target.value,
                        )
                      }
                      invalid={
                        validation.touched.justification &&
                        !!validation.errors.justification
                      }
                    />
                    <FormFeedback>
                      {validation.errors.justification}
                    </FormFeedback>
                  </Col>
                </Row>
              )}
            </>
          )}

          {/* ---------- Project & Budget (always shown once) ---------- */}
          <h6 className="uom-form-section-title mt-2">
            Project & Budget Information
          </h6>
          <Row>
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
              <Label>
                Available Budget{" "}
                {v.poType !== "pr_based" && (
                  <span className="text-danger">*</span>
                )}
              </Label>
              <Input
                type="select"
                value={v.budgetId}
                disabled={!v.departmentId}
                onChange={(e) =>
                  validation.setFieldValue("budgetId", e.target.value)
                }
                invalid={
                  validation.touched.budgetId && !!validation.errors.budgetId
                }
              >
                <option value="">
                  {v.departmentId ? "Select Budget" : "Select Department first"}
                </option>
                {budgets.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.fiscalYear} — {money(b.approvedAmount)}
                    {b.budgetType === "global" ? " (Global)" : " (Department)"}
                  </option>
                ))}
              </Input>
              <FormFeedback>{validation.errors.budgetId}</FormFeedback>
            </Col>
          </Row>

          {/* ---------- Delivery & Payment (always shown once) ---------- */}
          <h6 className="uom-form-section-title mt-2">Delivery & Payment</h6>
          <Row>
            <Col md={3} className="mb-4">
              <Label>Payment Terms</Label>
              <Input
                type="select"
                value={v.paymentTermId}
                onChange={(e) =>
                  validation.setFieldValue("paymentTermId", e.target.value)
                }
              >
                <option value="">Select terms</option>
                {paymentTerms.map((pt) => (
                  <option key={pt._id} value={pt._id}>
                    {pt.description || pt.code}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={3} className="mb-4">
              <Label>Expected Delivery</Label>
              <Input
                type="date"
                value={v.expectedDeliveryDate}
                onChange={(e) =>
                  validation.setFieldValue(
                    "expectedDeliveryDate",
                    e.target.value,
                  )
                }
              />
            </Col>
            <Col md={3} className="mb-4">
              <Label>
                Delivery Site <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={v.deliverySiteId}
                onChange={(e) =>
                  validation.setFieldValue("deliverySiteId", e.target.value)
                }
                invalid={
                  validation.touched.deliverySiteId &&
                  !!validation.errors.deliverySiteId
                }
              >
                <option value="">Select site</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={3} className="mb-4">
              <Label>Bill To Address</Label>
              <Input
                type="select"
                value={v.billingSiteId}
                onChange={(e) =>
                  validation.setFieldValue("billingSiteId", e.target.value)
                }
              >
                <option value="">Select Billing Site</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>
          <Row>
            <Col md={3} className="mb-4">
              <Label>Criticality</Label>
              <Input
                type="select"
                value={v.criticality}
                onChange={(e) =>
                  validation.setFieldValue("criticality", e.target.value)
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Input>
            </Col>
          </Row>

          {/* ---------- Line Items (Direct / Contract-Based only) ---------- */}
          {v.poType !== "pr_based" && (
            <>
              <h6 className="uom-form-section-title mt-2">
                Line Items <span className="text-danger">*</span>
              </h6>
              <div
                className="uom-table-card mb-3"
                style={{ overflowX: "auto" }}
              >
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style={{ width: 80 }}>Qty</th>
                      <th style={{ width: 110 }}>UOM</th>
                      <th style={{ width: 110 }}>Rate</th>
                      <th style={{ width: 90 }}>Tax %</th>
                      <th style={{ width: 120 }}>Amount</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.lineItems.map((li, idx) => {
                      const base =
                        (Number(li.quantity) || 0) *
                        (Number(li.unitPrice) || 0);
                      const tax = base * ((Number(li.taxPercent) || 0) / 100);
                      return (
                        <tr key={idx}>
                          <td style={{ position: "relative" }}>
                            {(() => {
                              const searchInfo = itemSearchState[idx] || {
                                search: li.itemName || "",
                                options: [],
                                showDropdown: false,
                              };
                              return (
                                <>
                                  <Input
                                    innerRef={(el) =>
                                      (itemInputRefs.current[idx] = el)
                                    }
                                    bsSize="sm"
                                    placeholder="Search item code or name..."
                                    value={searchInfo.search}
                                    onFocus={() =>
                                      setItemSearchFor(idx, {
                                        showDropdown: true,
                                      })
                                    }
                                    onChange={(e) =>
                                      searchItemsForLine(idx, e.target.value)
                                    }
                                    onBlur={() =>
                                      setTimeout(
                                        () =>
                                          setItemSearchFor(idx, {
                                            showDropdown: false,
                                          }),
                                        150,
                                      )
                                    }
                                  />
                                  {searchInfo.showDropdown &&
                                    searchInfo.options.length > 0 &&
                                    itemInputRefs.current[idx] &&
                                    createPortal(
                                      <div
                                        className="uom-table-card"
                                        style={{
                                          position: "fixed",
                                          zIndex: 9999,
                                          width: 280,
                                          maxHeight: 220,
                                          overflowY: "auto",
                                          top:
                                            itemInputRefs.current[
                                              idx
                                            ].getBoundingClientRect().bottom +
                                            2,
                                          left: itemInputRefs.current[
                                            idx
                                          ].getBoundingClientRect().left,
                                        }}
                                      >
                                        {searchInfo.options.map((opt) => (
                                          <div
                                            key={opt._id}
                                            style={{
                                              padding: "8px 12px",
                                              cursor: "pointer",
                                              fontSize: 13,
                                            }}
                                            onMouseDown={() =>
                                              selectItemForLine(idx, opt)
                                            }
                                          >
                                            <span className="uom-symbol-badge">
                                              {opt.itemCode}
                                            </span>{" "}
                                            {opt.itemName}
                                          </div>
                                        ))}
                                      </div>,
                                      document.body,
                                    )}
                                </>
                              );
                            })()}
                          </td>
                          <td>
                            <Input
                              bsSize="sm"
                              type="number"
                              min={0}
                              value={li.quantity}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) =>
                                updateLineItem(idx, "quantity", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              bsSize="sm"
                              type="select"
                              value={li.uomId}
                              onChange={(e) =>
                                updateLineItem(idx, "uomId", e.target.value)
                              }
                            >
                              <option value="">—</option>
                              {uoms.map((u) => (
                                <option key={u._id} value={u._id}>
                                  {u.symbol || u.name}
                                </option>
                              ))}
                            </Input>
                          </td>
                          <td>
                            <Input
                              bsSize="sm"
                              type="number"
                              min={0}
                              value={li.unitPrice}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) =>
                                updateLineItem(idx, "unitPrice", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Input
                              bsSize="sm"
                              type="select"
                              value={li.taxPercent}
                              onChange={(e) =>
                                updateLineItem(
                                  idx,
                                  "taxPercent",
                                  e.target.value,
                                )
                              }
                            >
                              <option value={0}>0%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                              <option value={28}>28%</option>
                            </Input>
                          </td>
                          <td className="align-middle fw-semibold">
                            {money(base + tax)}
                          </td>
                          <td className="align-middle">
                            <Button
                              size="sm"
                              color="light"
                              disabled={v.lineItems.length === 1}
                              onClick={() => removeLineItem(idx)}
                            >
                              <i className="bx bx-trash text-danger"></i>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {validation.touched.lineItems &&
                typeof validation.errors.lineItems === "string" && (
                  <div className="text-danger small mb-3">
                    {validation.errors.lineItems}
                  </div>
                )}
              <Button
                type="button"
                color="light"
                size="sm"
                className="mb-4"
                onClick={addLineItem}
              >
                <i className="bx bx-plus me-1"></i> Add line
              </Button>

              <div
                className="uom-table-card p-3 mb-4"
                style={{ maxWidth: 360, marginLeft: "auto" }}
              >
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Subtotal</span>
                  <span>{money(calc.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Tax</span>
                  <span>{money(calc.tax)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Net Payable</span>
                  <span>{money(netPayable)}</span>
                </div>

                {selectedBudget && (
                  <>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Budget Approved</span>
                      <span>{money(selectedBudget.approvedAmount)}</span>
                    </div>
                    <div
                      className={`d-flex justify-content-between fw-semibold ${
                        netPayable > selectedBudget.approvedAmount
                          ? "text-danger"
                          : "text-success"
                      }`}
                    >
                      <span>Remaining</span>
                      <span>
                        {money(selectedBudget.approvedAmount - netPayable)}
                      </span>
                    </div>
                    {netPayable > selectedBudget.approvedAmount && (
                      <div
                        className="text-danger small mt-2 p-2"
                        style={{ background: "#fef3f2", borderRadius: 6 }}
                      >
                        <i className="bx bx-error-circle me-1"></i>
                        Exceeds approved budget — reduce quantity/rate or select
                        a different budget.
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* ---------- Remarks ---------- */}
          <Row>
            <Col md={12} className="mb-4">
              <Label>Remarks</Label>
              <Input
                type="textarea"
                rows={2}
                value={v.remarks}
                onChange={(e) =>
                  validation.setFieldValue("remarks", e.target.value)
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
                ? "Creating..."
                : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default POForm;
