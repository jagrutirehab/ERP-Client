import React from "react";
import PropTypes from "prop-types";
import { Button, Col, Form, FormFeedback, Input, Label, Row } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

import CustomModal from "../../../Components/Common/Modal";

//redux
import { connect, useDispatch } from "react-redux";
import {
  admitIpdPatient,
  admitDischargePatient,
  editAdmission,
} from "../../../store/actions";
import { EDIT_ADMISSION } from "../../../Components/constants/patient";
import { setHours } from "date-fns";

const EditAdmission = ({ isOpen, data, patient }) => {
  const dispatch = useDispatch();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      patientId: patient?._id,
      admissionId: data?._id,
      addmissionDate: data?.addmissionDate ? new Date(data.addmissionDate) : "",
      dischargeDate: data?.dischargeDate || "",
    },
    validationSchema: Yup.object({
      addmissionDate: Yup.date().required("Please select addmission date"),
    }),
    onSubmit: (values) => {
      const fields = {
        ...values,
        addmissionDate: setHours(values.addmissionDate, 12),
        ...(values.dischargeDate && {
          dischargeDate: setHours(values.dischargeDate, 12),
        }),
      };

      dispatch(editAdmission(fields));
      validation.resetForm();
      toggle();
    },
  });

  const toggle = () =>
    dispatch(admitDischargePatient({ data: null, isOpen: "" }));

  return (
    <React.Fragment>
      <CustomModal
        isOpen={isOpen === EDIT_ADMISSION}
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
            <Col md={6}>
              <div className="mb-3">
                <Label htmlFor="addmissionDate" className="form-label">
                  Addmission Date
                </Label>
                <Flatpicker
                  name="addmissionDate"
                  value={validation.values.addmissionDate || ""}
                  onChange={([e]) => {
                    const event = {
                      target: { name: "addmissionDate", value: e },
                    };
                    validation.handleChange(event);
                  }}
                  options={{
                    dateFormat: "d M, Y",
                    enable: [
                      function (date) {
                        return validation.values?.dischargeDate
                          ? date < new Date(validation.values?.dischargeDate)
                          : true;
                      },
                    ],
                  }}
                  onBlur={validation.handleBlur}
                  className="form-control shadow-none bg-light"
                  id="dateOfAdmission"
                />
                {validation.touched.addmissionDate &&
                validation.errors.addmissionDate ? (
                  <FormFeedback className="d-block" type="invalid">
                    {validation.errors.addmissionDate}
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <Label htmlFor="dischargeDate" className="form-label">
                  Discharge Date
                </Label>
                <Flatpicker
                  name="dischargeDate"
                  value={validation.values.dischargeDate || ""}
                  onChange={([e]) => {
                    const event = {
                      target: { name: "dischargeDate", value: e },
                    };
                    validation.handleChange(event);
                  }}
                  options={{
                    dateFormat: "d M, Y",
                    enable: [
                      function (date) {
                        return validation.values?.addmissionDate
                          ? date > new Date(validation.values.addmissionDate)
                          : true;
                      },
                    ],
                  }}
                  disabled={!validation.values.dischargeDate}
                  onBlur={validation.handleBlur}
                  className="form-control shadow-none bg-light"
                  id="dateOfAdmission"
                />
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
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </CustomModal>
    </React.Fragment>
  );
};

EditAdmission.propTypes = {
  isOpen: PropTypes.string,
  patient: PropTypes.object,
};

const mapStateToProps = (state) => ({
  isOpen: state.Patient.admitDischargePatient?.isOpen,
  data: state.Patient.admitDischargePatient?.data,
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(EditAdmission);
