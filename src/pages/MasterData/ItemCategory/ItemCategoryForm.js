import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Label,
  Input,
  FormFeedback,
  Button,
  Card,
  CardBody,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  getItemCategories,
  createItemCategory,
  updateItemCategory,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import FormSectionLabel from "../shared/FormSectionLabel";
import "../shared/itemMasterForms.scss";

const LEVELS = [
  { value: 1, label: "L1", hint: "Top level" },
  { value: 2, label: "L2", hint: "Sub level" },
  { value: 3, label: "L3", hint: "Sub level" },
  { value: 4, label: "L4", hint: "Sub level" },
];

const ItemCategoryForm = ({ editingItem, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [parentOptions, setParentOptions] = useState([]);

  const validation = useFormik({
    initialValues: {
      name: editingItem?.name || "",
      categoryCode: editingItem?.categoryCode || "",
      level: editingItem?.level || "",
      parentCategoryId: editingItem?.parentCategoryId || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),
      level: Yup.number()
        .oneOf([1, 2, 3, 4], "Select a level")
        .required("Level is required"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = { ...values };
        if (!payload.parentCategoryId) delete payload.parentCategoryId;

        if (editingItem) {
          await updateItemCategory(editingItem._id, payload);
          toast.success("Category updated successfully");
        } else {
          await createItemCategory(payload);
          toast.success("Category created successfully");
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
    const fetchParents = async () => {
      if (!v.level || Number(v.level) === 1) {
        setParentOptions([]);
        return;
      }
      try {
        const res = await getItemCategories({ level: Number(v.level) - 1 });
        setParentOptions(res?.data || []);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error("Failed to load parent categories");
        }
      }
    };
    fetchParents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.level]);

  const selectLevel = (levelValue) => {
    validation.setFieldValue("level", levelValue);
    validation.setFieldValue("parentCategoryId", "");
  };

  return (
    <Card className="im-card border-0">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
          <div className="d-flex gap-3">
            {/* <div className="im-icon-badge">
              <i className="bx bx-category-alt"></i>
            </div> */}
            <div>
              <h5 className="mb-1 fw-semibold">
                {editingItem ? "Edit Category" : "Create Category"}
              </h5>
              <p className="text-muted mb-0 small">
                Define a category level and optional parent
              </p>
            </div>
          </div>
          <button
            type="button"
            className="im-close-btn"
            onClick={onCancel}
            aria-label="Close"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        <form onSubmit={validation.handleSubmit}>
          <FormSectionLabel icon="bx-detail" text="Category Details" />
          <Row>
            <Col md={6} className="mb-4">
              <Label>
                Category Name <span className="text-danger">*</span>
              </Label>
              <Input
                name="name"
                placeholder="e.g. Electronics"
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
                name="categoryCode"
                className="text-uppercase"
                placeholder="e.g. ELEC"
                value={v.categoryCode}
                onChange={validation.handleChange}
              />
            </Col>
          </Row>

          <FormSectionLabel icon="bx-sitemap" text="Hierarchy" />
          <Row>
            <Col md={12} className="mb-4">
              <Label className="d-block mb-2">
                Level <span className="text-danger">*</span>
              </Label>
              <div className="im-level-group">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    className={
                      "im-level-pill" +
                      (Number(v.level) === lvl.value ? " active" : "") +
                      (validation.touched.level && validation.errors.level
                        ? " is-invalid"
                        : "")
                    }
                    onClick={() => selectLevel(lvl.value)}
                  >
                    {lvl.label}{" "}
                    <span className="fw-normal opacity-75">· {lvl.hint}</span>
                  </button>
                ))}
              </div>
              {validation.touched.level && validation.errors.level && (
                <div className="text-danger small mt-2">
                  {validation.errors.level}
                </div>
              )}
            </Col>

            {v.level && Number(v.level) > 1 && (
              <Col md={6} className="mb-4">
                <Label>Parent Category</Label>
                <Input
                  type="select"
                  name="parentCategoryId"
                  value={v.parentCategoryId}
                  onChange={validation.handleChange}
                >
                  <option value="">Select parent</option>
                  {parentOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </Input>
                {parentOptions.length === 0 && (
                  <div className="text-muted small mt-1">
                    No L{Number(v.level) - 1} categories yet.
                  </div>
                )}
              </Col>
            )}
          </Row>

          <div className="im-footer-bar d-flex justify-content-end gap-2">
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
                  : "Create Category"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default ItemCategoryForm;
