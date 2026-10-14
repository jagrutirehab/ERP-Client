import React, { useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, Input, FormGroup, Spinner } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
});

const CategoryFormModal = ({ isOpen, toggle, category, saving, onSubmit }) => {
  const isEdit = !!category;

  const form = useFormik({
    initialValues: { name: "" },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => onSubmit(values),
  });

  useEffect(() => {
    if (isOpen) form.setValues({ name: category?.name || "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, category]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>{isEdit ? "Edit category" : "Add category"}</ModalHeader>
      <form onSubmit={form.handleSubmit} noValidate>
        <ModalBody>
          <FormGroup className="mb-0">
            <Label for="categoryName" className="fw-medium">
              Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="categoryName"
              name="name"
              autoFocus
              placeholder="e.g. Statutory registration"
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className={form.touched.name && form.errors.name ? "is-invalid" : ""}
            />
            {form.touched.name && form.errors.name && (
              <div className="invalid-feedback d-block">{form.errors.name}</div>
            )}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="light" className="border" onClick={toggle}>
            Cancel
          </Button>
          <Button type="submit" color="success" className="text-white" disabled={saving}>
            {saving ? <Spinner size="sm" /> : isEdit ? "Save changes" : "Create category"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;
