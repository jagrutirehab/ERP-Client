import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

//redux
import { connect, useDispatch } from "react-redux";
import {
  admitDischargePatient,
  dischargeIpdPatient,
} from "../../../store/actions";
import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";
import { DISCHARGE_PATIENT } from "../../../Components/constants/patient";

const DischargePatient = ({ isOpen, patient }) => {
  const dispatch = useDispatch();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      patientId: patient?._id,
      addmissionId: patient?.addmission?._id,
      dischargeDate: "",
    },
    validationSchema: Yup.object({
      dischargeDate: Yup.date().required("Please select addmission date"),
    }),
    onSubmit: (values) => {
      dispatch(dischargeIpdPatient(values));
      validation.resetForm();
      toggle();
    },
  });

  const toggle = () =>
    dispatch(admitDischargePatient({ data: null, isOpen: "" }));

  return (
    <React.Fragment>
      <CustomModal
        isOpen={isOpen === DISCHARGE_PATIENT}
        title={"Admit Patient"}
        toggle={toggle}
      >
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
            <Col>
              <div className="mb-3">
                <Label htmlFor="dischargeDate" className="form-label">
                  Discharge Date
                </Label>
                <Flatpicker
                  name="dateOfAdmission"
                  value={validation.values.dischargeDate || ""}
                  onChange={([e]) => {
                    const event = {
                      target: { name: "dischargeDate", value: e },
                    };
                    validation.handleChange(event);
                  }}
                  options={{
                    dateFormat: "d M, Y",
                    disable: [
                      {
                        from: "1900-01-01", // Replace with an appropriate minimum date
                        to: patient?.addmission?.addmissionDate || new Date(), // Use the admission date or today's date
                      },
                    ],
                    enable: [
                      function (date) {
                        return patient?.addmission?.addmissionDate
                          ? date > new Date(patient?.addmission?.addmissionDate)
                          : false;
                      },
                    ],
                    // enable: [
                    //   function (date) {
                    //     return date.getDate() === new Date().getDate();
                    //   },
                    // ],
                  }}
                  onBlur={validation.handleBlur}
                  onInvalid={
                    validation.touched.dischargeDate &&
                    validation.errors.dischargeDate
                      ? true
                      : false
                  }
                  className="form-control shadow-none bg-light"
                  id="dateOfAdmission"
                />
                {/* <Input
                  name="dischargeDate"
                  className="form-control"
                  placeholder="Select Addmission Date"
                  type="date"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.dischargeDate || ""}
                  invalid={
                    validation.touched.dischargeDate &&
                    validation.errors.dischargeDate
                      ? true
                      : false
                  }
                  autoComplete="on"
                /> */}
                {validation.touched.dischargeDate &&
                validation.errors.dischargeDate ? (
                  <FormFeedback className="d-block" type="invalid">
                    {validation.errors.dischargeDate}
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12} className="mt-3">
              <div className="d-flex gap-3 justify-content-end">
                <Button onClick={toggle} size="sm" color="danger" type="button">
                  Cancel
                </Button>
                <Button size="sm" type="submit">
                  Save
                  {/* {chart ? "Update" : "Save"} */}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </CustomModal>
    </React.Fragment>
  );
};

DischargePatient.propTypes = {
  isOpen: PropTypes.string,
  patient: PropTypes.object,
};

const mapStateToProps = (state) => ({
  isOpen: state.Patient.admitDischargePatient?.isOpen,
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(DischargePatient);
