import React from "react";
import { Col, Button, Input, FormFeedback, Form, Row } from "reactstrap";
import PropTypes from "prop-types";

//redux
import { useDispatch } from "react-redux";
// import { updateItem as updMedicine } from "../../../store/actions";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { updateBillItem } from "../../../../../store/actions";
// import {
//   medicineTypes,
//   medicineUnits,
// } from "../../../Components/constants/medicine";

const EditBillItem = ({ updateItem, setUpdateItem }) => {
  const dispatch = useDispatch();
  const data = updateItem?.formData;

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: data?._id || "",
      name: data.name || "",
      unit: data.unit || "",
      cost: data.cost || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Item Name"),
    }),
    onSubmit: (values) => {
      dispatch(updateBillItem(values));
      setUpdateItem({
        isForm: false,
        formIndex: undefined,
        formData: undefined,
      });
      validation.resetForm();
    },
  });

  return (
    <React.Fragment>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validation.handleSubmit();
          return false;
        }}
        className="needs-validation"
        action="#"
      >
        <Row className="align-items-center">
          <Col className="mb-3 pb-2 border-bottom" xs={2} md={4}>
            <Input
              onChange={validation.handleChange}
              name="name"
              onBlur={validation.handleBlur}
              value={validation.values.name || ""}
              bsSize={"sm"}
            />
            {validation.touched.name && validation.errors.name ? (
              <FormFeedback type="invalid">
                <div className="font-size-14">{validation.errors.name}</div>
              </FormFeedback>
            ) : null}
          </Col>
          <Col className="mb-3 pb-2 border-bottom" xs={2} md={4}>
            <Input
              onChange={validation.handleChange}
              name="unit"
              onBlur={validation.handleBlur}
              value={validation.values.unit || ""}
              bsSize={"sm"}
            />
          </Col>
          <Col className="mb-3 pb-2 border-bottom" xs={2} md={3}>
            <Input
              onChange={validation.handleChange}
              name="cost"
              onBlur={validation.handleBlur}
              value={validation.values.cost || ""}
              bsSize={"sm"}
            />
          </Col>
          <Col
            className="mb-3 pb-2 border-bottom align-items-end d-flex"
            xs={4}
            md={1}
          >
            <Button
              type="button"
              onClick={() => {
                setUpdateItem({
                  isForm: false,
                  formIndex: undefined,
                  formData: undefined,
                });
              }}
              className="me-3"
              size="sm"
              color="danger"
              outline
            >
              <i className="ri-close-circle-line fs-5"></i>
            </Button>
            <Button type="submit" size="sm" color="success">
              <i className="ri-check-line fs-5"></i>
            </Button>
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

EditBillItem.propTypes = {
  updateItem: PropTypes.object,
  setItem: PropTypes.func,
};

export default EditBillItem;
