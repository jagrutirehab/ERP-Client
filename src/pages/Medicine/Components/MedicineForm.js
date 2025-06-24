import React, { useState } from "react";
import { Form, Row, Col, Input, Button, FormFeedback } from "reactstrap";
import PropTypes from "prop-types";
import Select from "react-select";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { useDispatch } from "react-redux";
import { addMedicine } from "../../../store/actions";
import {
  medicineTypes,
  medicineUnits,
} from "../../../Components/constants/medicine";
// import { postMedicines } from "../../../store/actions";

const MedicinesForm = ({ toggle }) => {
  const dispatch = useDispatch();
  const [medicines, setMedicines] = useState([]);

  const addMedicines = () => {
    const newMed = {
      name: "",
      type: "TAB",
      strength: "",
      unit: "MG",
      instruction: "",
      composition: "",
      quantity: "",
      unitPrice: "",
    };
    setMedicines([...medicines, newMed]);
  };

  const handleChange = (e) => {
    const medList = [...medicines];
    const prop = e.target.name;
    const value = e.target.value;
    const idx = e.target.id;

    medList[idx][prop] = value;
    setMedicines(medList);
  };

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      medicines: medicines,
    },
    validationSchema: Yup.object({
      medicines: Yup.array().test(
        "notEmpty",
        "Atleas one medicine is required",
        (value) => {
          if (!value || value.length === 0) {
            return false;
          }
          return true;
        }
      ),
    }),
    onSubmit: (values) => {
      dispatch(addMedicine(medicines));
      setMedicines([]);
      toggle();
      validation.resetForm();
    },
  });

  const removeMedicine = (idx) => {
    const medList = [...medicines];
    medList.splice(idx, 1);
    setMedicines(medList);
  };

  const options = medicineUnits.map((unit) => ({ value: unit, label: unit }));
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
            <Col className="mb-3 pb-2 border-bottom" xs={2} md={2}>
              Name<span className="text-danger">*</span>
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={2} md={1}>
              Type<span className="text-danger">*</span>
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={2} md={1}>
              Strength
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={2} md={1}>
              Unit
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={4} md={2}>
              Instruction
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={4} md={2}>
              Composition
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={4} md={1}>
              Quantity
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={4} md={1}>
              Unit price
            </Col>
            <Col className="mb-3 pb-2 border-bottom" xs={4} md={1}></Col>
            {(medicines || []).map((medicine, idx) => (
              <React.Fragment key={idx}>
                <Col xs={2} md={2}>
                  <div className="mb-3">
                    <Input
                      required
                      bsSize="sm"
                      id={idx}
                      onChange={handleChange}
                      name="name"
                      value={medicine.name}
                      type="text"
                      className="form-control"
                    />
                  </div>
                </Col>
                <Col xs={2} md={1}>
                  <div className="mb-3">
                    <div class="form-group">
                      <input
                        list="type-options"
                        className="form-control form-control-sm"
                        id={idx}
                        onChange={handleChange}
                        name="type"
                        value={medicine.type}
                        placeholder="Type or select an option"
                      />
                      <datalist id="type-options">
                        {(medicineTypes || []).map((item, idx) => (
                          <option
                            key={idx + item}
                            value={item}
                            className="text-cap"
                          ></option>
                        ))}
                      </datalist>
                    </div>
                    {/* <Input
                      bsSize="sm"
                      id={idx}
                      onChange={handleChange}
                      name="type"
                      value={medicine.type}
                      type="select"
                      className="form-control"
                    >
                      <option value="" selected disabled hidden>
                        Choose Type
                      </option>
                      {(medicineTypes || []).map((item, idx) => (
                        <option
                          key={idx + item}
                          value={item}
                          className="text-cap"
                        >
                          {item}
                        </option>
                      ))}
                    </Input> */}
                  </div>
                </Col>
                <Col xs={2} md={1}>
                  <div className="mb-3">
                    <Input
                      bsSize="sm"
                      id={idx}
                      onChange={handleChange}
                      name="strength"
                      value={medicine.strength}
                      type="text"
                      className="form-control"
                    />
                  </div>
                </Col>
                <Col xs={2} md={1}>
                  <div className="mb-3">
                    {/* <Select
                      options={options}
                      placeholder="Type or select an option"
                      isClearable
                      value={options.find(
                        (option) => option.value === medicine.unit
                      )}
                      onChange={(selected) => {
                        handleChange({
                          target: {
                            name: "unit",
                            value: selected ? selected.value : "",
                          },
                        });
                      }}
                    /> */}
                    <div class="form-group">
                      <input
                        list="unit-options"
                        className="form-control form-control-sm"
                        id={idx}
                        onChange={(e) => {
                          handleChange(e);
                          if (e.target.value === "") {
                            // Blur and refocus to re-trigger datalist suggestions
                            e.target.blur();
                            setTimeout(() => e.target.focus(), 0);
                          }
                        }}
                        name="unit"
                        value={medicine.unit}
                        placeholder="Type or select an option"
                      />
                      <datalist id="unit-options">
                        {(medicineUnits || []).map((item, idx) => (
                          <option
                            key={idx + item}
                            value={item}
                            className="text-cap"
                          ></option>
                        ))}
                      </datalist>
                    </div>
                    {/* <Input
                      bsSize="sm"
                      id={idx}
                      onChange={handleChange}
                      name="unit"
                      value={medicine.unit}
                      type="select"
                      className="form-control"
                    >
                      <option value="" selected disabled hidden>
                        Choose Unit
                      </option>
                      {(medicineUnits || []).map((item, idx) => (
                        <option key={idx + item}>{item}</option>
                      ))}
                    </Input> */}
                  </div>
                </Col>
                <Col xs={3} md={2}>
                  <div className="mb-3">
                    <Input
                      bsSize="sm"
                      id={idx}
                      onChange={handleChange}
                      name="instruction"
                      value={medicine.instruction}
                      type="textarea"
                      rows="1"
                      className="form-control"
                    />
                  </div>
                </Col>
                <Col xs={3} md={2}>
                  <div className="mb-3">
                    <Input
                      bsSize="sm"
                      id={idx}
                      required
                      onChange={handleChange}
                      name="composition"
                      value={medicine.composition}
                      type="textarea"
                      rows="1"
                      className="form-control"
                    />
                  </div>
                </Col>
                <Col xs={3} md={1}>
                  <div className="mb-3">
                    <Input
                      bsSize="sm"
                      id={idx}
                      required
                      onChange={handleChange}
                      name="quantity"
                      value={medicine.quantity}
                      type="number"
                      rows="1"
                      className="form-control"
                    />
                  </div>
                </Col>
                <Col xs={3} md={1}>
                  <div className="mb-3">
                    <Input
                      bsSize="sm"
                      id={idx}
                      required
                      onChange={handleChange}
                      name="unitPrice"
                      value={medicine.unitPrice}
                      type="number"
                      rows="1"
                      className="form-control"
                    />
                  </div>
                </Col>
                <Col xs={1} md={1}>
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
              {validation.touched.medicines && validation.errors.medicines ? (
                <FormFeedback type="invalid" className="d-block">
                  {validation.errors.medicines}
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
                  onClick={addMedicines}
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
};

export default MedicinesForm;
