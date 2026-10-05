import React, { useEffect, useState } from "react";
import { Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createStorageLocation,
  updateStorageLocation,
  getAllCenters,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const StorageLocationForm = ({ editingItem, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
  }, []);

  const validation = useFormik({
    initialValues: {
      name: editingItem?.name || "",
      code: editingItem?.code || "",
      centerId: editingItem?.centerId?._id || editingItem?.centerId || "",
      description: editingItem?.description || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),
      code: Yup.string().trim().required("Code is required"),
      centerId: Yup.string().required("Center is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (editingItem) {
          await updateStorageLocation(editingItem._id, values);
          toast.success("Storage location updated successfully");
        } else {
          await createStorageLocation(values);
          toast.success("Storage location created successfully");
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
      <h4 className="uom-form-title">
        {editingItem ? "Edit Storage Location" : "Add Storage Location"}
      </h4>
      <div className="uom-form-panel">
        <form onSubmit={validation.handleSubmit}>
          <Row>
            <Col md={4} className="mb-4">
              <Label>
                Name <span className="text-danger">*</span>
              </Label>
              <Input
                placeholder="e.g. Rack A1"
                value={v.name}
                onChange={(e) => validation.setFieldValue("name", e.target.value)}
                onBlur={validation.handleBlur}
                invalid={validation.touched.name && !!validation.errors.name}
              />
              <FormFeedback>{validation.errors.name}</FormFeedback>
            </Col>
            <Col md={4} className="mb-4">
              <Label>
                Code <span className="text-danger">*</span>
              </Label>
              <Input
                placeholder="e.g. RA1"
                value={v.code}
                onChange={(e) => validation.setFieldValue("code", e.target.value)}
                onBlur={validation.handleBlur}
                invalid={validation.touched.code && !!validation.errors.code}
              />
              <FormFeedback>{validation.errors.code}</FormFeedback>
            </Col>
            <Col md={4} className="mb-4">
              <Label>
                Center <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={v.centerId}
                onChange={(e) => validation.setFieldValue("centerId", e.target.value)}
                onBlur={validation.handleBlur}
                invalid={validation.touched.centerId && !!validation.errors.centerId}
              >
                <option value="">Select Center</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
              <FormFeedback>{validation.errors.centerId}</FormFeedback>
            </Col>
          </Row>
          <Row>
            <Col md={12} className="mb-4">
              <Label>Description</Label>
              <Input
                value={v.description}
                onChange={(e) => validation.setFieldValue("description", e.target.value)}
              />
            </Col>
          </Row>
          <div className="uom-form-footer d-flex justify-content-end gap-2">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={validation.isSubmitting}>
              {editingItem ? "Save changes" : "Create Location"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StorageLocationForm;