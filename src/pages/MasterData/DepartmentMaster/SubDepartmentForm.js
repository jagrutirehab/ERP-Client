import React, { useEffect, useState } from "react";
import { Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createPRSubDepartment,
  updatePRSubDepartment,
  getPRDepartments,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import "../UnitOfMeasurement/uom.scss";

const SubDepartmentForm = ({ editingItem, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    getPRDepartments({})
      .then((res) => setDepartments(res?.data || []))
      .catch(() => {});
  }, []);

  const validation = useFormik({
    initialValues: {
      name: editingItem?.name || "",
      departmentId: editingItem?.departmentId?._id || editingItem?.departmentId || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),
      departmentId: Yup.string().required("Department is required"),
    }),
    onSubmit: async (values, { setTouched }) => {
      const errors = await validation.validateForm();
      if (Object.keys(errors).length > 0) {
        setTouched({ name: true, departmentId: true });
        toast.error("Please fill in all required fields");
        return;
      }
      try {
        if (editingItem) {
          await updatePRSubDepartment(editingItem._id, values);
          toast.success("Sub-department updated successfully");
        } else {
          await createPRSubDepartment(values);
          toast.success("Sub-department created successfully");
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
      <h4 className="uom-form-title">{editingItem ? "Edit Sub-Department" : "Add Sub-Department"}</h4>

      <div className="uom-form-panel">
        <form onSubmit={validation.handleSubmit}>
          <h6 className="uom-form-section-title">Basic Information</h6>
          <p className="uom-form-section-sub">Sub-department and its parent department</p>

          <Row>
            <Col md={6} className="mb-4">
              <Label>
                Name <span className="text-danger">*</span>
              </Label>
              <Input
                name="name"
                placeholder="e.g. ICU, Rehab Ward"
                value={v.name}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={validation.touched.name && !!validation.errors.name}
              />
              <FormFeedback>{validation.errors.name}</FormFeedback>
            </Col>
            <Col md={6} className="mb-4">
              <Label>
                Parent Department <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={v.departmentId}
                onChange={(e) => validation.setFieldValue("departmentId", e.target.value)}
                onBlur={validation.handleBlur}
                invalid={validation.touched.departmentId && !!validation.errors.departmentId}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </Input>
              <FormFeedback>{validation.errors.departmentId}</FormFeedback>
            </Col>
          </Row>

          <div className="uom-form-footer d-flex justify-content-end gap-2">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={validation.isSubmitting}>
              {validation.isSubmitting ? "Saving..." : editingItem ? "Save changes" : "Add Sub-Department"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubDepartmentForm;