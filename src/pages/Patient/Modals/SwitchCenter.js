import React from "react";
import PropTypes from "prop-types";
import { Form, Row, Col, Label, Input, FormFeedback, Button } from "reactstrap";
import CustomModal from "../../../Components/Common/Modal";

//redux
import { connect, useDispatch } from "react-redux";
import { switchCenter, updatePatientCenter } from "../../../store/actions";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

const SwitchCenter = ({ isOpen, data, patient, centers }) => {
  const dispatch = useDispatch();

  const toggle = () => {
    dispatch(switchCenter({ data: null, isOpen: false }));
  };

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      patientId: patient?._id,
      center: patient?.center?._id,
    },
    validationSchema: Yup.object({
      center: Yup.string().required("Center name required."),
    }),
    onSubmit: (values) => {
      dispatch(updatePatientCenter(values));
      validation.resetForm();
      toggle();
    },
  });

  return (
    <React.Fragment>
      <CustomModal isOpen={isOpen} title={"Switch Center"} toggle={toggle}>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
          className="needs-validation"
          action="#"
        >
          <Row>
            <Col xs={12}>
              <div className="mb-3">
                <Label htmlFor="aadhaar-card" className="form-label">
                  Center
                  <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  name="center"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.center || ""}
                  invalid={
                    validation.touched.center && validation.errors.center
                      ? true
                      : false
                  }
                  className="form-control"
                  placeholder=""
                  id="aadhaar-card"
                >
                  <option value="" selected disabled hidden>
                    Choose here
                  </option>
                  {(centers || []).map((option, idx) => (
                    <option key={idx} value={option._id}>
                      {option.title}
                    </option>
                  ))}
                </Input>
                {validation.touched.center && validation.errors.center ? (
                  <FormFeedback type="invalid">
                    <div>{validation.errors.center}</div>
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12} className="text-end">
              <Button type="submit" size="sm">
                Switch
              </Button>
            </Col>
          </Row>
        </Form>
      </CustomModal>
    </React.Fragment>
  );
};

SwitchCenter.propTypes = {
  isOpen: PropTypes.bool,
  data: PropTypes.object,
  patient: PropTypes.object,
  centers: PropTypes.array,
};

const mapStateToProps = (state) => ({
  isOpen: state.Patient.switchCenter?.isOpen,
  data: state.Patient.switchCenter?.data,
  patient: state.Patient.patient,
  centers: state.Center.data,
});

export default connect(mapStateToProps)(SwitchCenter);
