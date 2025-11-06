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
    enableReinitialize: true,

    initialValues: {
      patientId: patient?._id,
      addmissionId: patient?.addmission?._id,
      dischargeDate: "",
    },
    validationSchema: Yup.object({
      dischargeDate: Yup.date().required(
        "Please select discharge date and time"
      ),
    }),
    onSubmit: (values) => {
      const dischargeDate = new Date(values.dischargeDate);
      const formattedDate = `${dischargeDate
        .getDate()
        .toString()
        .padStart(2, "0")} ${dischargeDate.toLocaleString("default", {
        month: "short",
      })} ${dischargeDate.getFullYear()} ${dischargeDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${dischargeDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      dispatch(
        dischargeIpdPatient({ ...values, dischargeDate: formattedDate })
      );
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
        title={"Discharge Patient"}
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
                  Discharge Date & Time
                </Label>
                <Flatpicker
                  name="dischargeDate"
                  value={validation.values.dischargeDate || ""}
                  onChange={([e]) => {
                    const now = new Date();
                    e.setHours(
                      now.getHours(),
                      now.getMinutes(),
                      now.getSeconds(),
                      now.getMilliseconds()
                    );
                    const event = {
                      target: { name: "dischargeDate", value: e },
                    };
                    validation.handleChange(event);
                  }}
                  options={{
                    enableTime: true,
                    time_24hr: false,
                    dateFormat: "d M Y h:i K",
                    disable: [
                      {
                        from: "1900-01-01",
                        to: patient?.addmission?.addmissionDate || new Date(),
                      },
                    ],
                    enable: [
                      function (date) {
                        return patient?.addmission?.addmissionDate
                          ? date > new Date(patient?.addmission?.addmissionDate)
                          : false;
                      },
                    ],
                  }}
                  onBlur={validation.handleBlur}
                  className="form-control shadow-none bg-light"
                  id="dischargeDate"
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

DischargePatient.propTypes = {
  isOpen: PropTypes.string,
  patient: PropTypes.object,
};

const mapStateToProps = (state) => ({
  isOpen: state.Patient.admitDischargePatient?.isOpen,
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(DischargePatient);
