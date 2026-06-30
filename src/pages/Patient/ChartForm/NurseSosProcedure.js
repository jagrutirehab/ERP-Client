import React, { useEffect } from "react";
import { Form, Row, Col, Label, Input, Button, FormFeedback } from "reactstrap";
import PropTypes from "prop-types";

//constant
import {
  NURSE_SOS_PROCEDURE,
  nurseSosActivityTypes,
} from "../../../Components/constants/patient";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { connect, useDispatch } from "react-redux";
import {
  addGeneralNurseSosProcedure,
  addNurseSosProcedure,
  createEditChart,
  updateNurseSosProcedure,
} from "../../../store/actions";

const NurseSosProcedure = ({
  author,
  patient,
  chartDate,
  editChartData,
  type,
}) => {
  const dispatch = useDispatch();

  const editNurseSos = editChartData?.nurseSosProcedure;

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: patient.addmission?._id,
      activityType: editNurseSos ? editNurseSos.activityType : "",
      description: editNurseSos ? editNurseSos.description : "",
      chart: NURSE_SOS_PROCEDURE,
      type,
      date: chartDate,
    },
    validationSchema: Yup.object({
      activityType: Yup.string()
        .oneOf(nurseSosActivityTypes, "Select a valid activity type")
        .required("Activity type is required"),
    }),
    onSubmit: (values) => {
      if (editNurseSos) {
        dispatch(
          updateNurseSosProcedure({
            id: editChartData._id,
            chartId: editNurseSos._id,
            ...values,
          })
        );
      } else if (type === "GENERAL") {
        dispatch(addGeneralNurseSosProcedure(values));
      } else {
        dispatch(addNurseSosProcedure(values));
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
            <Col xs={12} md={6}>
              <div className="mb-3">
                <Label for="activityType">Activity Type</Label>
                <Input
                  type="select"
                  name="activityType"
                  id="activityType"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.activityType || ""}
                  invalid={
                    validation.touched.activityType &&
                    !!validation.errors.activityType
                  }
                  className="form-control"
                >
                  <option value="">Select activity type</option>
                  {(nurseSosActivityTypes || []).map((activity) => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </Input>
                {validation.touched.activityType &&
                validation.errors.activityType ? (
                  <FormFeedback type="invalid">
                    {validation.errors.activityType}
                  </FormFeedback>
                ) : null}
              </div>
            </Col>
            <Col xs={12}>
              <div className="mb-3">
                <Label for="description">Description</Label>
                <Input
                  type="textarea"
                  name="description"
                  id="description"
                  rows={4}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.description || ""}
                  className="form-control"
                  placeholder="Enter description"
                />
              </div>
            </Col>
            <div className="mt-3">
              <div className="d-flex gap-3 justify-content-end">
                <Button
                  onClick={closeForm}
                  size="sm"
                  color="danger"
                  type="button"
                  className="text-white"
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit">
                  Save
                </Button>
              </div>
            </div>
          </Row>
        </Form>
      </div>
    </React.Fragment>
  );
};

NurseSosProcedure.propTypes = {
  patient: PropTypes.object,
  author: PropTypes.object,
  chartDate: PropTypes.any,
  editChartData: PropTypes.object,
  type: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
});

export default connect(mapStateToProps)(NurseSosProcedure);
