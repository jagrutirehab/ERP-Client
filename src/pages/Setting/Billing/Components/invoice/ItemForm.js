import React, { useEffect, useState } from "react";
import { Form, Row, Col, Input, Button, FormFeedback, Label } from "reactstrap";
import PropTypes from "prop-types";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { connect, useDispatch } from "react-redux";
import { addBillItem } from "../../../../../store/actions";

const categories = [
  "2d echo charges",
  "ac charges",
  "airbed charges",
  "ambulance charges",
  "attendant/care taker charges",
  "bio medical waste charges",
  "bsl charges",
  "ct scan",
  "diaper charges",
  "medical consumables",
  "discharge medicines",
  "doctor consultation charges",
  "doppler charges",
  "dressing charges",
  "drug test",
  "ecg charges",
  "ect charges",
  "emergency charges",
  "emergency hospital charges",
  "enema",
  "extra food charges",
  "hospital charges",
  "injectables",
  "mrd charges",
  "mri charges",
  "nebulisation charges",
  "nursing charges",
  "opd consultation charges",
  "other charges",
  "medicines",
  "physiotherapy charges",
  "procedure charges",
  "psychological counselling",
  "psychological test",
  "refund",
  "registration charges",
  "room charges",
  "sleep study charges",
  "travel expenses",
  "upt charges",
  "usg charges",
  "x-ray charges",
];

const MedicinesForm = ({ toggle, centers, userCenters }) => {
  const dispatch = useDispatch();
  const [items, setBillItems] = useState([]);

  const handleChange = (e) => {
    const itemList = [...items];
    const prop = e.target.name;
    const value = e.target.value;
    const idx = e.target.id;

    itemList[idx][prop] = value;
    setBillItems(itemList);
  };

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      items: items,
      centers: centers.map((cen) => cen._id),
    },
    validationSchema: Yup.object({
      items: Yup.array().test(
        "notEmpty",
        "Atleas one medicine is required",
        (value) => {
          if (!value || value.length === 0) {
            return false;
          }
          return true;
        }
      ),
      centers: Yup.array().test(
        "notEmpty",
        "At least one center is required",
        (value) => !(!value || value.length === 0)
      ),
    }),
    onSubmit: (values) => {
      dispatch(
        addBillItem({ items, centers: values.centers, centerIds: userCenters })
      );
      setBillItems([]);
      toggle();
      validation.resetForm();
    },
  });

  const addItems = () => {
    const newItem = {
      name: "",
      unit: "",
      cost: "",
    };
    setBillItems([...items, newItem]);
  };

  const removeMedicine = (idx) => {
    const itemList = [...items];
    itemList.splice(idx, 1);
    setBillItems(itemList);
  };

  return (
    <React.Fragment>
      <div>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            // toggle();
            return false;
          }}
          className="needs-validation"
          action="#"
        >
          <Row className="ps-3 pe-3">
            <Col xs={12}>
              <Label>Centers</Label>
              <div className="d-flex gap-3">
                {(centers || []).map((cen) => (
                  <div>
                    <Input
                      type="checkbox"
                      value={cen._id}
                      checked={validation.values?.centers?.includes(cen._id)}
                      name="centers"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    />
                    <Label className="ms-1">{cen.title}</Label>
                  </div>
                ))}
              </div>
              {validation.touched.centers && validation.errors.centers ? (
                <FormFeedback type="invalid" className="d-block">
                  {validation.errors.centers}
                </FormFeedback>
              ) : null}
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={2} md={3}>
              Name<span className="text-danger">*</span>
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={2} md={2}>
              Unit
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={2} md={2}>
              Cost
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={2} md={3}>
              Category
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={4} md={2}></Col>
            {(items || []).map((medicine, idx) => (
              <React.Fragment key={idx}>
                <Col xs={2} md={3}>
                  <div className="mb-3">
                    <Input
                      required
                      bsSize="sm"
                      id={idx}
                      onChange={handleChange}
                      name="name"
                      value={medicine.drugName}
                      type="text"
                      className="form-control"
                    />
                  </div>
                </Col>
                <Col xs={2} md={2}>
                  <div className="mb-3">
                    <Input
                      bsSize="sm"
                      id={idx}
                      onChange={handleChange}
                      name="unit"
                      value={medicine.unit}
                      type="text"
                      className="form-control"
                    />
                  </div>
                </Col>
                <Col xs={2} md={2}>
                  <div className="mb-3">
                    <Input
                      bsSize="sm"
                      id={idx}
                      onChange={handleChange}
                      name="cost"
                      value={medicine.cost}
                      type="text"
                      className="form-control"
                    />
                  </div>
                </Col>
                <Col xs={2} md={3}>
                  <div className="mb-3">
                    <Input
                      bsSize="sm"
                      id={idx}
                      onChange={handleChange}
                      name="category"
                      value={medicine.category || ""}
                      type="select"
                      className="form-control"
                    >
                      <option defaultValue="" selected>
                        Select Category
                      </option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </Input>
                  </div>
                </Col>
                <Col xs={1} md={2}>
                  <Button
                    size="sm"
                    onClick={() => removeMedicine(idx)}
                    color="danger"
                  >
                    <i className="ri-delete-bin-6-line fs-14 text-white"></i>
                  </Button>
                </Col>
              </React.Fragment>
            ))}
            <Col xs={12} className="mb-3">
              {validation.touched.items && validation.errors.items ? (
                <FormFeedback type="invalid" className="d-block">
                  {validation.errors.items}
                </FormFeedback>
              ) : null}
            </Col>
            <Col>
              <div className="d-flex justify-content-between">
                <Button
                  size="sm"
                  type="button"
                  color="secondary"
                  outline
                  onClick={addItems}
                >
                  Add
                </Button>
                <Button size="sm" type="submit" color="primary" outline>
                  Save
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </React.Fragment>
  );
};

MedicinesForm.propTypes = {
  toggle: PropTypes.func.isRequired,
  centers: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  userCenters: state.User?.centerAccess,
});

export default connect(mapStateToProps)(MedicinesForm);
