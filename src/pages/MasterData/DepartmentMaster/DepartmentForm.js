import React from "react";
import { Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { createPRDepartment, updatePRDepartment } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import "../UnitOfMeasurement/uom.scss";

const DepartmentForm = ({ editingItem, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();

  const validation = useFormik({
    initialValues: {
      name: editingItem?.name || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),
    }),
    onSubmit: async (values, { setTouched }) => {
      const errors = await validation.validateForm();
      if (Object.keys(errors).length > 0) {
        setTouched({ name: true });
        toast.error("Please fill in all required fields");
        return;
      }
      try {
        if (editingItem) {
          await updatePRDepartment(editingItem._id, values);
          toast.success("Department updated successfully");
        } else {
          await createPRDepartment(values);
          toast.success("Department created successfully");
        }
        onSaved();
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
        }
      }
    },
  });

  const v = validation.values;

  return (
    <div className="uom-form-page">
      <h4 className="uom-form-title">{editingItem ? "Edit Department" : "Add Department"}</h4>

      <div className="uom-form-panel">
        <form onSubmit={validation.handleSubmit}>
          <h6 className="uom-form-section-title">Basic Information</h6>
          <p className="uom-form-section-sub">Department name</p>

          <Row>
            <Col md={8} className="mb-4">
              <Label>
                Name <span className="text-danger">*</span>
              </Label>
              <Input
                name="name"
                placeholder="e.g. Administration, Facilities/Engineering"
                value={v.name}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={validation.touched.name && !!validation.errors.name}
              />
              <FormFeedback>{validation.errors.name}</FormFeedback>
            </Col>
          </Row>

          <div className="uom-form-footer d-flex justify-content-end gap-2">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={validation.isSubmitting}>
              {validation.isSubmitting ? "Saving..." : editingItem ? "Save changes" : "Add Department"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;