import React, { useEffect, useState } from "react";
import { Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  createAssetCategory,
  updateAssetCategory,
  getAssetCategories,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import "../UnitOfMeasurement/uom.scss";

const AssetCategoryForm = ({ editingItem, level, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [parentOptions, setParentOptions] = useState([]);

  useEffect(() => {
    if (level <= 1) return;
    getAssetCategories({ level: level - 1 })
      .then((res) => setParentOptions(res?.data || []))
      .catch(() => {});
  }, [level]);

  const validation = useFormik({
    initialValues: {
      name: editingItem?.name || "",
      code: editingItem?.code || "",
      level,
      parentCategoryId:
        editingItem?.parentCategoryId?._id || editingItem?.parentCategoryId || "",
      isCountable: editingItem?.isCountable || false,
      usefulLifeYears: editingItem?.usefulLifeYears ?? 0,
      costGL: editingItem?.costGL || "",
      inventoryGL: editingItem?.inventoryGL || "",
      depreciationGL: editingItem?.depreciationGL || "",
      accumulatedDepreciationGL: editingItem?.accumulatedDepreciationGL || "",
      status: editingItem?.status || "active",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),
      parentCategoryId:
        level > 1
          ? Yup.string().required("Parent category is required")
          : Yup.string().notRequired(),
    }),
    onSubmit: async (values, { setTouched }) => {
      const errors = await validation.validateForm();
      if (Object.keys(errors).length > 0) {
        setTouched({ name: true, parentCategoryId: true });
        toast.error("Please fill in all required fields");
        return;
      }
      const payload = { ...values };
      if (!payload.parentCategoryId) delete payload.parentCategoryId;

      try {
        if (editingItem) {
          await updateAssetCategory(editingItem._id, payload);
          toast.success("Category updated successfully");
        } else {
          await createAssetCategory(payload);
          toast.success("Category created successfully");
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
        {editingItem ? `Edit Level ${level} Category` : `Create Level ${level} Category`}
      </h4>

      <div className="uom-form-panel">
        <form onSubmit={validation.handleSubmit}>
          <h6 className="uom-form-section-title">Basic Information</h6>
          <p className="uom-form-section-sub">Name and hierarchy details</p>

          <Row>
            <Col md={6} className="mb-4">
              <Label>
                Name <span className="text-danger">*</span>
              </Label>
              <Input
                name="name"
                placeholder="e.g. Electronics, Furniture, Medical Equipment"
                value={v.name}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={validation.touched.name && !!validation.errors.name}
              />
              <FormFeedback>{validation.errors.name}</FormFeedback>
            </Col>
            <Col md={6} className="mb-4">
              <Label>Category Code</Label>
              <Input
                name="code"
                className="text-uppercase"
                placeholder="e.g. ELEC"
                value={v.code}
                onChange={validation.handleChange}
              />
            </Col>
          </Row>

          {level > 1 && (
            <Row>
              <Col md={6} className="mb-4">
                <Label>
                  Level {level - 1} Category (Parent) <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  value={v.parentCategoryId}
                  onChange={(e) => validation.setFieldValue("parentCategoryId", e.target.value)}
                  onBlur={validation.handleBlur}
                  invalid={validation.touched.parentCategoryId && !!validation.errors.parentCategoryId}
                >
                  <option value="">Select Parent</option>
                  {parentOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </Input>
                <FormFeedback>{validation.errors.parentCategoryId}</FormFeedback>
              </Col>
            </Row>
          )}

          <h6 className="uom-form-section-title mt-2">Accounting</h6>
          <p className="uom-form-section-sub">Useful life and GL account mapping</p>

          <Row>
            <Col md={4} className="mb-4">
              <Label>Useful Life (Years)</Label>
              <Input
                type="number"
                min={0}
                value={v.usefulLifeYears}
                onFocus={(e) => e.target.select()}
                onChange={(e) => validation.setFieldValue("usefulLifeYears", e.target.value)}
              />
            </Col>
            <Col md={4} className="mb-4">
              <div className="d-flex align-items-center gap-2" style={{ marginTop: 30 }}>
                <input
                  type="checkbox"
                  checked={v.isCountable}
                  onChange={(e) => validation.setFieldValue("isCountable", e.target.checked)}
                />
                <div>
                  <div className="fw-semibold small">Is Countable</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    Tracked as individual countable units
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="d-flex align-items-center gap-2" style={{ marginTop: 30 }}>
                <input
                  type="checkbox"
                  checked={v.status === "active"}
                  onChange={(e) =>
                    validation.setFieldValue("status", e.target.checked ? "active" : "inactive")
                  }
                />
                <div>
                  <div className="fw-semibold small">Active Status</div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    Enable this category
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-4">
              <Label>Cost GL Account</Label>
              <Input name="costGL" value={v.costGL} onChange={validation.handleChange} />
            </Col>
            <Col md={6} className="mb-4">
              <Label>Inventory GL Account</Label>
              <Input name="inventoryGL" value={v.inventoryGL} onChange={validation.handleChange} />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-4">
              <Label>Depreciation GL Account</Label>
              <Input name="depreciationGL" value={v.depreciationGL} onChange={validation.handleChange} />
            </Col>
            <Col md={6} className="mb-4">
              <Label>Accumulated Depreciation GL Account</Label>
              <Input
                name="accumulatedDepreciationGL"
                value={v.accumulatedDepreciationGL}
                onChange={validation.handleChange}
              />
            </Col>
          </Row>

          <div className="uom-form-footer d-flex justify-content-end gap-2">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={validation.isSubmitting}>
              {validation.isSubmitting ? "Saving..." : editingItem ? "Save changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetCategoryForm;