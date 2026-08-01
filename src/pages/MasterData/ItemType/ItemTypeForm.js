import React from "react";
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
  createItemType,
  updateItemType,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import FormSectionLabel from "../shared/FormSectionLabel";
import "../shared/itemMasterForms.scss";

const ItemTypeForm = ({ editingItem, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();

  const validation = useFormik({
    initialValues: {
      name: editingItem?.name || "",
      description: editingItem?.description || "",
      subTypes:
        editingItem?.subTypes?.map((s) => ({
          name: s.name,
          description: s.description || "",
        })) || [],
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Item type name is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (editingItem) {
          await updateItemType(editingItem._id, values);
          toast.success("Item type updated successfully");
        } else {
          await createItemType(values);
          toast.success("Item type created successfully");
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

  const addSubType = () => {
    validation.setFieldValue("subTypes", [
      ...v.subTypes,
      { name: "", description: "" },
    ]);
  };
  const removeSubType = (idx) => {
    validation.setFieldValue(
      "subTypes",
      v.subTypes.filter((_, i) => i !== idx),
    );
  };
  const updateSubType = (idx, field, value) => {
    validation.setFieldValue(
      "subTypes",
      v.subTypes.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  return (
    <Card className="im-card border-0">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
          <div className="d-flex gap-3">
            <div className="im-icon-badge">
              <i className="bx bx-shapes"></i>
            </div>
            <div>
              <h5 className="mb-1 fw-semibold">
                {editingItem ? "Edit Item Type" : "Create Item Type"}
              </h5>
              <p className="text-muted mb-0 small">
                Add a type and optional sub types in one step
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
          <FormSectionLabel icon="bx-detail" text="Type Details" />
          <Row>
            <Col md={6} className="mb-4">
              <Label>
                Item Type Name <span className="text-danger">*</span>
              </Label>
              <Input
                name="name"
                placeholder="e.g. Fixed Asset, Consumable, Service"
                value={v.name}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={validation.touched.name && !!validation.errors.name}
              />
              <FormFeedback>{validation.errors.name}</FormFeedback>
            </Col>
            <Col md={6} className="mb-4">
              <Label>Description</Label>
              <Input
                name="description"
                placeholder="Optional summary"
                value={v.description}
                onChange={validation.handleChange}
              />
            </Col>
          </Row>

          <FormSectionLabel icon="bx-layer" text="Sub Types" />

          {v.subTypes.length === 0 && (
            <div
              className="text-muted small border rounded-3 p-4 text-center mb-3"
              style={{ background: "#fbfbfd" }}
            >
              No sub types yet. Add one to define classifications under this
              type.
            </div>
          )}

          <div className="d-flex flex-column gap-2 mb-3">
            {v.subTypes.map((s, idx) => (
              <Row
                key={idx}
                className="im-subtype-row align-items-center g-2 mx-0"
              >
                <Col md={5}>
                  <Input
                    bsSize="sm"
                    placeholder="Sub type name"
                    value={s.name}
                    onChange={(e) => updateSubType(idx, "name", e.target.value)}
                  />
                </Col>
                <Col md={6}>
                  <Input
                    bsSize="sm"
                    placeholder="Description (optional)"
                    value={s.description}
                    onChange={(e) =>
                      updateSubType(idx, "description", e.target.value)
                    }
                  />
                </Col>
                <Col md={1} className="text-end">
                  <button
                    type="button"
                    className="im-close-btn"
                    style={{
                      width: 32,
                      height: 32,
                      color: "#e04f4f",
                      borderColor: "#fbdada",
                    }}
                    onClick={() => removeSubType(idx)}
                    aria-label="Remove sub type"
                  >
                    <i className="bx bx-trash" style={{ fontSize: 15 }}></i>
                  </button>
                </Col>
              </Row>
            ))}
          </div>

          <Button
            size="sm"
            outline
            type="button"
            className="im-add-dashed"
            onClick={addSubType}
          >
            <i className="bx bx-plus me-1"></i> Add Sub Type
          </Button>

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
                  : "Create Item Type"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default ItemTypeForm;
