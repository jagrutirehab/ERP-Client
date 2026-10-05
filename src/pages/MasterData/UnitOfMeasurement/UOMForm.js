import React from "react";
import { Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { createUom, updateUom } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import "./uom.scss";

const UOMForm = ({ editingItem, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();

  const validation = useFormik({
    initialValues: {
      name: editingItem?.name || "",
      symbol: editingItem?.symbol || "",
      description: editingItem?.description || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Full name is required"),
      symbol: Yup.string().trim().required("Unit name is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (editingItem) {
          await updateUom(editingItem._id, values);
          toast.success("Unit of measurement updated successfully");
        } else {
          await createUom(values);
          toast.success("Unit of measurement added successfully");
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = await validation.validateForm();
    if (Object.keys(errors).length > 0) {
      validation.setTouched({
        name: true,
        symbol: true,
      });
      toast.error("Please fill in all required fields");
      return;
    }
    validation.handleSubmit(e);
  };

  return (
    <div className="uom-form-page">
      <h4 className="uom-form-title">
        {editingItem ? "Edit Unit of Measurement" : "Add Unit of Measurement"}
      </h4>

      <div className="uom-form-panel">
        <form onSubmit={handleFormSubmit}>
          <h6 className="uom-form-section-title">Basic Information</h6>
          <p className="uom-form-section-sub">
            Enter the details about this unit of measurement.
          </p>

          <Row>
            <Col md={6} className="mb-4">
              <Label>
                Full Name <span className="text-danger">*</span>
              </Label>
              <Input
                name="name"
                placeholder="Enter full name (e.g. Kilograms)"
                value={v.name}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={validation.touched.name && !!validation.errors.name}
              />
              {validation.touched.name && validation.errors.name ? (
                <FormFeedback>{validation.errors.name}</FormFeedback>
              ) : (
                <div className="uom-field-hint">
                  The complete name of the measurement unit
                </div>
              )}
            </Col>
            <Col md={6} className="mb-4">
              <Label>
                Unit Name <span className="text-danger">*</span>
              </Label>
              <Input
                name="symbol"
                className="text-uppercase"
                placeholder="Enter unit name (e.g. kg)"
                value={v.symbol}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.symbol && !!validation.errors.symbol
                }
              />
              {validation.touched.symbol && validation.errors.symbol ? (
                <FormFeedback>{validation.errors.symbol}</FormFeedback>
              ) : (
                <div className="uom-field-hint">
                  The abbreviated or symbol form of the unit
                </div>
              )}
            </Col>
          </Row>

          <div className="mb-2">
            <Label>Description (Optional)</Label>
            <Input
              type="textarea"
              rows={5}
              name="description"
              placeholder="Enter a description for this unit of measurement"
              value={v.description}
              onChange={validation.handleChange}
            />
            <div className="uom-field-hint">
              Additional details about the unit and its usage
            </div>
          </div>

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
                  : "Add Unit of Measurement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UOMForm;