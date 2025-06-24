import React from "react";
import { Col, Button, Input, FormFeedback, Form, Row } from "reactstrap";
import PropTypes from "prop-types";

//redux
import { useDispatch } from "react-redux";
import { updateMedicine as updMedicine } from "../../../store/actions";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  medicineTypes,
  medicineUnits,
} from "../../../Components/constants/medicine";

const EditMedicine = ({ updateMedicine, setUpdateMedicine }) => {
  const dispatch = useDispatch();
  const data = updateMedicine?.formData;

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: data?._id || "",
      name: data?.name || "",
      type: data?.type || "",
      strength: data?.strength || "",
      unit: data?.unit || "",
      instruction: data?.instruction || "",
      composition: data?.composition || "",
      quantity: data?.quantity || "",
      unitPrice: data?.unitPrice || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Medicine Name"),
    }),
    onSubmit: (values) => {
      dispatch(updMedicine(values));
      setUpdateMedicine({
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
          <Col className="mb-3 pb-2 border-bottom" xs={2} md={2}>
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
          <Col className="mb-3 pb-2 border-bottom" xs={2} md={2}>
            <Input
              className="bg-white"
              onChange={validation.handleChange}
              name="type"
              type="select"
              onBlur={validation.handleBlur}
              value={validation.values.type || ""}
              bsSize={"sm"}
            >
              <option value="" selected disabled hidden>
                Choose Type
              </option>
              {(medicineTypes || []).map((item, idx) => (
                <option key={idx + item} value={item} className="text-cap">
                  {item}
                </option>
              ))}
            </Input>
          </Col>
          <Col className="mb-3 pb-2 border-bottom" xs={2} md={2}>
            <Input
              onChange={validation.handleChange}
              name="strength"
              onBlur={validation.handleBlur}
              value={validation.values.strength || ""}
              bsSize={"sm"}
            />
          </Col>
          <Col className="mb-3 pb-2 border-bottom" xs={2} md={2}>
            <Input
              className="bg-white"
              onChange={validation.handleChange}
              name="unit"
              type="select"
              onBlur={validation.handleBlur}
              value={validation.values.unit || ""}
              bsSize={"sm"}
            >
              <option value="" selected disabled hidden>
                Choose Unit
              </option>
              {(medicineUnits || []).map((item, idx) => (
                <option key={idx + item}>{item}</option>
              ))}
            </Input>
          </Col>
          <Col className="mb-3 pb-2 border-bottom" xs={4} md={3}>
            <Input
              onChange={validation.handleChange}
              name="instruction"
              onBlur={validation.handleBlur}
              value={validation.values.instruction || ""}
              type="textarea"
              rows="1"
              bsSize={"sm"}
            />
          </Col>
          <Col className="mb-3 pb-2 border-bottom" xs={4} md={3}>
            <Input
              onChange={validation.handleChange}
              name="composition"
              onBlur={validation.handleBlur}
              value={validation.values.composition || ""}
              type="textarea"
              rows="1"
              bsSize={"sm"}
            />
          </Col>
          <Col className="mb-3 pb-2 border-bottom" xs={4} md={3}>
            <Input
              onChange={validation.handleChange}
              name="quantity"
              onBlur={validation.handleBlur}
              value={validation.values.quantity || ""}
              type="textarea"
              rows="1"
              bsSize={"sm"}
            />
          </Col>
          <Col className="mb-3 pb-2 border-bottom" xs={4} md={3}>
            <Input
              onChange={validation.handleChange}
              name="unitPrice"
              onBlur={validation.handleBlur}
              value={validation.values.unitPrice || ""}
              type="textarea"
              rows="1"
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
                setUpdateMedicine({
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

EditMedicine.propTypes = {
  updateMedicine: PropTypes.object,
  setUpdateMedicine: PropTypes.func,
};

export default EditMedicine;
