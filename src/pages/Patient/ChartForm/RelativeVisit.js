import React, { useEffect, useState } from "react";
import PropTypes, { element } from "prop-types";
import { Form, Row, Col, Card, CardBody, Input, Button } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import {
  RELATIVE_VISIT,
  relativeVisitFields,
} from "../../../Components/constants/patient";
import { connect, useDispatch } from "react-redux";
import {
  addGeneralRelativeVisit,
  addRelativeVisit,
  createEditChart,
  updateRelativeVisit,
} from "../../../store/actions";

const RelativeVisit = ({
  author,
  patient,
  chartDate,
  editChartData,
  shouldPrintAfterSave = false,
  type,
}) => {
  const dispatch = useDispatch();

  const editChart = editChartData?.relativeVisit;
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: patient.addmission?._id,
      chart: RELATIVE_VISIT,
      nakInfo: editChart ? editChart.nakInfo : "",
      complaints: editChart ? editChart.complaints : "",
      observations: editChart ? editChart.observations : "",
      diagnosis: editChart ? editChart.diagnosis : "",
      notes: editChart ? editChart.notes : "",
      type,
      date: chartDate,
      shouldPrintAfterSave,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      closeForm();
      if (editChart) {
        dispatch(
          updateRelativeVisit({
            ...values,
            id: editChartData._id,
            chartId: editChart._id,
          })
        );
      } else if (type === "GENERAL") {
        dispatch(addGeneralRelativeVisit(values));
      } else {
        dispatch(addRelativeVisit(values));
      }
    },
  });

  useEffect(() => {
    if (!editChartData) {
      validation.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editChartData]);

  const closeForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    validation.resetForm();
  };

  return (
    <React.Fragment>
      <div>
        {" "}
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            // toggle();
            return false;
          }}
          className="needs-validation"
          action="#"
          encType="multipart/form-data"
        >
          <Row className="mt-3">
            {(relativeVisitFields || []).map((item, idx) => (
              <Col xs={12} md={6}>
                <Card className="ribbon-box border shadow-none mb-3">
                  <CardBody className="position-relative p-0">
                    <div className="ribbon ribbon-primary w-75 ribbon-shape">
                      {item.label}
                    </div>
                    <Input
                      type="textarea"
                      name={item.name}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values[item.name] || ""}
                      //   onClick={() => handleDropdown("")}
                      className="form-control presc-border pt-5 rounded"
                      aria-label="With textarea"
                      rows="2"
                    />
                  </CardBody>
                </Card>
              </Col>
            ))}
            <Col xs={12} className="mt-3">
              <div className="d-flex gap-3 justify-content-end">
                <Button
                  onClick={closeForm}
                  size="sm"
                  color="danger"
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </React.Fragment>
  );
};

RelativeVisit.propTypes = {
  patient: PropTypes.object,
  author: PropTypes.object,
  chartDate: PropTypes.any,
  editChartData: PropTypes.object,
  type: PropTypes.string.isRequired,
  onSubmitClinicalForm: PropTypes.func,
};

const mapStateToProps = (state) => ({
  patient: state.Chart.chartForm?.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
  populatePreviousAppointment:
    state.Chart.chartForm.populatePreviousAppointment,
  shouldPrintAfterSave: state.Chart.chartForm.shouldPrintAfterSave,
  appointment: state.Chart.chartForm.appointment,
  patientLatestOPDPrescription: state.Chart.patientLatestOPDPrescription,
});

export default connect(mapStateToProps)(RelativeVisit);
