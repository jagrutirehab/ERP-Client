import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Row, Col, Button } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import {
  ADMISSION_TYPE,
  admissionTypeFields,
  admissionTypeBranchFields,
  INDEPENDENT_ADMISSION,
  SUPPORTIVE_ADMISSION,
  EMERGENCY_ADMISSION,
} from "../../../Components/constants/patient";
import RenderFields from "../../../Components/Common/RenderFields";
import { connect, useDispatch } from "react-redux";
import {
  addAdmissionType,
  createEditChart,
  updateAdmissionType,
} from "../../../store/actions";

// Every field that belongs to some branch. Anything not in the current branch is
// cleared before saving.
const ALL_BRANCH_FIELDS = Object.values(admissionTypeBranchFields).flat();

const validationSchema = Yup.object({
  admissionType: Yup.string().required("Admission type is required"),
  adultationType: Yup.string().when("admissionType", {
    is: INDEPENDENT_ADMISSION,
    then: (schema) => schema.required("Adultation type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  supportType: Yup.string().when("admissionType", {
    is: SUPPORTIVE_ADMISSION,
    then: (schema) => schema.required("Support type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  emergencyType: Yup.string().when("admissionType", {
    is: EMERGENCY_ADMISSION,
    then: (schema) => schema.required("Emergency type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  emergencyRestraint: Yup.string().when("admissionType", {
    is: EMERGENCY_ADMISSION,
    then: (schema) => schema.required("Restraint is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const AdmissionType = ({
  author,
  patient,
  chartDate,
  editChartData,
  shouldPrintAfterSave = false,
  type,
}) => {
  const dispatch = useDispatch();

  const editChart = editChartData?.admissionType;

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      addmission: patient.addmission?._id,
      chart: ADMISSION_TYPE,
      admissionType: editChart ? editChart.admissionType || "" : "",
      adultationType: editChart ? editChart.adultationType || "" : "",
      supportType: editChart ? editChart.supportType || "" : "",
      emergencyType: editChart ? editChart.emergencyType || "" : "",
      emergencyRestraint: editChart ? editChart.emergencyRestraint || "" : "",
      type,
      date: chartDate,
      shouldPrintAfterSave,
    },
    validationSchema,
    onSubmit: (values) => {
      closeForm();

      // Belt and braces: the effect below already clears the other branches as
      // the user switches, but strip them again here so a stale value can never
      // reach the server.
      const keep = admissionTypeBranchFields[values.admissionType] || [];
      const cleaned = { ...values };
      ALL_BRANCH_FIELDS.forEach((field) => {
        if (!keep.includes(field)) cleaned[field] = "";
      });

      if (editChart) {
        dispatch(
          updateAdmissionType({
            ...cleaned,
            id: editChartData._id,
            chartId: editChart._id,
          }),
        );
      } else {
        // IPD only — there is no GENERAL variant of this chart.
        dispatch(addAdmissionType(cleaned));
      }
    },
  });

  const { admissionType } = validation.values;

  // RenderFields hides a field whose showIf doesn't match, but Formik keeps its
  // value. Without this, choosing Independent > Adult and then switching to
  // Emergency would still submit adultationType: "ADULT".
  useEffect(() => {
    const keep = admissionTypeBranchFields[admissionType] || [];
    ALL_BRANCH_FIELDS.forEach((field) => {
      if (!keep.includes(field) && validation.values[field]) {
        validation.setFieldValue(field, "");
        validation.setFieldTouched(field, false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admissionType]);

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
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validation.handleSubmit();
          return false;
        }}
        className="needs-validation"
        action="#"
      >
        <div className="mt-3">
          <RenderFields fields={admissionTypeFields} validation={validation} />
        </div>

        <Row>
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
    </React.Fragment>
  );
};

AdmissionType.propTypes = {
  patient: PropTypes.object,
  author: PropTypes.object,
  chartDate: PropTypes.any,
  editChartData: PropTypes.object,
  type: PropTypes.string,
};

const mapStateToProps = (state) => ({
  patient: state.Chart.chartForm?.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
  shouldPrintAfterSave: state.Chart.chartForm.shouldPrintAfterSave,
});

export default connect(mapStateToProps)(AdmissionType);
