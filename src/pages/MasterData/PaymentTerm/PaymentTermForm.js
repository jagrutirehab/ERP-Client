import React from "react";
import { Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createPaymentTerm,
  updatePaymentTerm,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import "../UnitOfMeasurement/uom.scss";

const PaymentTermForm = ({ editingItem, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();

  const validation = useFormik({
    initialValues: {
      code: editingItem?.code || "",
      description: editingItem?.description || "",
      paymentType: editingItem?.paymentType || "",
      dueDays: editingItem?.dueDays ?? 0,
      gracePeriodDays: editingItem?.gracePeriodDays ?? 0,
      discountDays: editingItem?.discountDays ?? 0,
      discountPercentage: editingItem?.discountPercentage ?? 0,
      allowInstallments: editingItem?.allowInstallments || false,
      isDefault: editingItem?.isDefault || false,
      status: editingItem?.status || "active",
    },
    validationSchema: Yup.object({
      code: Yup.string().trim().required("Code is required"),
      description: Yup.string().trim().required("Description is required"),
      paymentType: Yup.string().required("Payment type is required"),
      dueDays: Yup.number().min(0).required("Due days is required"),
    }),
    onSubmit: async (values, { setTouched }) => {
      const errors = await validation.validateForm();
      if (Object.keys(errors).length > 0) {
        setTouched({
          code: true,
          description: true,
          paymentType: true,
          dueDays: true,
        });
        toast.error("Please fill in all required fields");
        return;
      }

      const payload = {
        ...values,
        dueDays: Number(values.dueDays) || 0,
        gracePeriodDays: Number(values.gracePeriodDays) || 0,
        discountDays: Number(values.discountDays) || 0,
        discountPercentage: Number(values.discountPercentage) || 0,
      };

      try {
        if (editingItem) {
          await updatePaymentTerm(editingItem._id, payload);
          toast.success("Payment term updated successfully");
        } else {
          await createPaymentTerm(payload);
          toast.success("Payment term created successfully");
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
  const selectOnFocus = (e) => e.target.select();

  return (
    <div className="uom-form-page">
      <h4 className="uom-form-title">
        {editingItem ? "Edit Payment Term" : "Create Payment Term"}
      </h4>

      <div className="uom-form-panel">
        <form onSubmit={validation.handleSubmit}>
          <h6 className="uom-form-section-title">Basic Information</h6>
          <p className="uom-form-section-sub">
            Essential details about the payment term
          </p>

          <Row>
            <Col md={6} className="mb-4">
              <Label>
                Code <span className="text-danger">*</span>
              </Label>
              <Input
                name="code"
                className="text-uppercase"
                placeholder="e.g. NET30"
                value={v.code}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={validation.touched.code && !!validation.errors.code}
              />
              <FormFeedback>{validation.errors.code}</FormFeedback>
            </Col>
            <Col md={6} className="mb-4">
              <Label>
                Description <span className="text-danger">*</span>
              </Label>
              <Input
                name="description"
                placeholder="Enter description"
                value={v.description}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.description &&
                  !!validation.errors.description
                }
              />
              <FormFeedback>{validation.errors.description}</FormFeedback>
            </Col>
          </Row>

          <h6 className="uom-form-section-title mt-2">Payment Configuration</h6>
          <p className="uom-form-section-sub">
            Rules for due dates and payment types
          </p>

          <Row>
            <Col md={4} className="mb-4">
              <Label>
                Payment Type <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                name="paymentType"
                value={v.paymentType}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.paymentType &&
                  !!validation.errors.paymentType
                }
              >
                <option value="">Select Type</option>
                <option value="advance">Advance</option>
                <option value="net">Net</option>
                <option value="cod">Cash on Delivery</option>
                <option value="partial">Partial</option>
              </Input>
              <FormFeedback>{validation.errors.paymentType}</FormFeedback>
            </Col>
            <Col md={4} className="mb-4">
              <Label>
                Due Days <span className="text-danger">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                value={v.dueDays}
                onFocus={selectOnFocus}
                onChange={(e) =>
                  validation.setFieldValue("dueDays", e.target.value)
                }
              />
            </Col>
            <Col md={4} className="mb-4">
              <Label>Grace Period (Days)</Label>
              <Input
                type="number"
                min={0}
                value={v.gracePeriodDays}
                onFocus={selectOnFocus}
                onChange={(e) =>
                  validation.setFieldValue("gracePeriodDays", e.target.value)
                }
              />
            </Col>
          </Row>

          <h6 className="uom-form-section-title mt-2">Discount Settings</h6>
          <p className="uom-form-section-sub">Early payment incentives</p>

          <Row>
            <Col md={6} className="mb-4">
              <Label>Discount Days</Label>
              <Input
                type="number"
                min={0}
                value={v.discountDays}
                onFocus={selectOnFocus}
                onChange={(e) =>
                  validation.setFieldValue("discountDays", e.target.value)
                }
              />
            </Col>
            <Col md={6} className="mb-4">
              <Label>Discount %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={v.discountPercentage}
                onFocus={selectOnFocus}
                onChange={(e) =>
                  validation.setFieldValue("discountPercentage", e.target.value)
                }
              />
            </Col>
          </Row>

          <Row>
            <Col md={4} className="mb-4">
              <div className="d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  checked={v.allowInstallments}
                  onChange={(e) =>
                    validation.setFieldValue(
                      "allowInstallments",
                      e.target.checked,
                    )
                  }
                />
                <div>
                  <div className="fw-semibold small">Allow Installments</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    Enable multiple payments
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  checked={v.isDefault}
                  onChange={(e) =>
                    validation.setFieldValue("isDefault", e.target.checked)
                  }
                />
                <div>
                  <div className="fw-semibold small">Set as Default</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    Default for new vendors
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  checked={v.status === "active"}
                  onChange={(e) =>
                    validation.setFieldValue(
                      "status",
                      e.target.checked ? "active" : "inactive",
                    )
                  }
                />
                <div>
                  <div className="fw-semibold small">Active Status</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    Enable this term
                  </div>
                </div>
              </div>
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
                  : "Create Payment Term"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentTermForm;
