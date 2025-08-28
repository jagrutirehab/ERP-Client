import React, { useRef, useState } from "react";
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
import { duplicateMedicineValidator } from "../../../store/features/medicine/medicineSlice";
import { toast } from "react-toastify";

function useDebounce(callback, delay) {
  const timer = useRef(null);
  return (...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

const EditMedicine = ({ updateMedicine, setUpdateMedicine }) => {
  const dispatch = useDispatch();
  const data = updateMedicine?.formData;

  const [dupError, setDupError] = useState("");

  const checkDuplicate = async (name, strength, id) => {
    if (!name || !strength) return;

    try {
      const response = await dispatch(duplicateMedicineValidator({name, strength, id:data?._id})).unwrap();

      if (response.exists) {
        setDupError(response.message);
      } else {
        setDupError("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const debouncedCheck = useDebounce(checkDuplicate, 500);

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
      if (dupError) {
        toast.errror("Fix duplicate strength before saving");
        return;
      }

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
              onChange={(e) => {
                validation.handleChange(e);
                if (validation.values.strength) {
                  debouncedCheck(e.target.value, validation.values.strength, validation.values.id);
                }
              }}
              name="name"
              onBlur={validation.handleBlur}
              value={validation.values.name || ""}
              bsSize={"sm"}
            />
            {validation.touched.name && validation.errors.name ? (
              <FormFeedback type="invalid" className="d-block">
                {validation.errors.name}
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
              onChange={(e) => {
                validation.handleChange(e);
                debouncedCheck(
                  validation.values.name,
                  e.target.value,
                  validation.values.id
                );
              }}
              name="strength"
              onBlur={validation.handleBlur}
              value={validation.values.strength || ""}
              bsSize={"sm"}
              invalid={!!dupError}
            />
            {dupError && (
              <FormFeedback className="d-block">{dupError}</FormFeedback>
            )}
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
            <Button
              type="submit"
              size="sm"
              color="success"
              disabled={!!dupError} 
            >
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
