import React, { useState, useEffect, useRef } from "react";
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
import { duplicateMedicineValidator } from "../../../store/features/medicine/medicineSlice";

function useDebounce(callback, delay) {
  const timer = useRef(null);
  function debouncedFn(...args) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }
  return debouncedFn;
}

const MedicinesForm = ({ toggle }) => {
  const dispatch = useDispatch();
  const [medicines, setMedicines] = useState([]);
  const [errors, setErrors] = useState({});
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    setHasErrors(Object.keys(errors).length > 0);
  }, [errors]);

  const checkStrength = async (idx, name, strength) => {
    if (!name || !strength) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
      return;
    }

    try {
      const response = await dispatch(
        duplicateMedicineValidator({ name, strength })
      ).unwrap();

      if (response.exists) {
        setErrors((prev) => ({
          ...prev,
          [idx]: response.message,
        }));
      } else {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[idx];
          return copy;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const debouncedCheck = useDebounce(checkStrength, 500);

  const addMedicines = () => {
    const newMed = {
      name: "",
      type: "",
      strength: "",
      unit: "",
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
    const idx = parseInt(e.target.id, 10);

    medList[idx][prop] = value;
    setMedicines(medList);

    if (prop === "strength") {
      debouncedCheck(idx, medList[idx].name, value);
    } else if (prop === "name") {
      if (medList[idx].strength) {
        debouncedCheck(idx, value, medList[idx].strength);
      }
    }
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: { medicines },
    validationSchema: Yup.object({
      medicines: Yup.array().test(
        "notEmpty",
        "At least one medicine is required",
        (value) => !!(value && value.length)
      ),
    }),
    onSubmit: () => {
      if (hasErrors) {
        alert("Fix duplicate strengths before submitting");
        return;
      }
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
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        validation.handleSubmit();
        return false;
      }}
      className="needs-validation"
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
              <div className="mb-3 w-5">
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

            <Col xs={3} md={2}>
              <div className="mb-3 w-5">
                {/* <div class="form-group">
                      <input
                        list="type-options"
                        className="form-control form-control-sm"
                        id={idx}
                        onChange={handleChange}
                        name="type"
                        value={medicine.type}
                        placeholder="select an type"
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
                    </div> */}
                <Input
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
                    <option key={idx + item} value={item} className="text-cap">
                      {item}
                    </option>
                  ))}
                </Input>
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
                  invalid={!!errors[idx]}
                />
                {/* {errors[idx] && <FormFeedback>{errors[idx]}</FormFeedback>} */}
              </div>
            </Col>
            <Col xs={3} md={2}>
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
                  {/* <input
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
                      /> */}
                  <Input
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
                  </Input>
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
            <Button
              size="sm"
              type="submit"
              color="primary"
              outline
              disabled={hasErrors || medicines.length === 0}
            >
              Save
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

MedicinesForm.propTypes = {
  toggle: PropTypes.func.isRequired,
};

export default MedicinesForm;
