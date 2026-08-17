import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Form, Row, Col, Button } from "reactstrap";
import { format } from "date-fns";

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
import {
  admissionTypeLabel,
  getAdmissionTypeDetailParts,
  getLatestAdmissionTypeChart,
} from "../../../utils/admissionType";

// Every field that belongs to some branch. Anything not in the current branch is
// cleared before saving.
const ALL_BRANCH_FIELDS = Object.values(admissionTypeBranchFields).flat();

// The form's own view of the descriptor. Two local overrides, deliberately NOT
// pushed into the shared `admissionTypeFields` constant:
//   - the admission-type label reads "Target Admission Type" here, because the
//     form sits beside a panel showing the current one. The chart display and
//     both print renderers keep saying "Admission Type".
//   - fullWidth, because these fields now live in a half-width column and
//     RenderFields would otherwise put each at lg={6} of that half.
const FORM_FIELDS = admissionTypeFields.map((field) =>
  field.name === "admissionType"
    ? { ...field, label: "Target Admission Type", fullWidth: true }
    : { ...field, fullWidth: true },
);

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
  addmissionsCharts,
}) => {
  const dispatch = useDispatch();

  const editChart = editChartData?.admissionType;

  // The admission type as it stands today — the most recent Admission Type chart
  // on this admission. Matched by admission id rather than by index: state.Chart.data
  // is a shared slice holding admissions for every patient visited this session.
  const currentAdmissionType = useMemo(() => {
    const admissionId = patient?.addmission?._id;
    if (!admissionId) return null;

    const charts =
      (addmissionsCharts || []).find((a) => a._id === admissionId)?.charts || [];

    // While editing, the chart being edited is the thing being changed — showing
    // it as "current" would be circular, so compare against the one before it.
    const pool = editChartData
      ? charts.filter((c) => c?._id !== editChartData._id)
      : charts;

    const latest = getLatestAdmissionTypeChart(pool);
    if (!latest?.admissionType) return null;

    return {
      data: latest.admissionType,
      date: latest.date || latest.createdAt || null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addmissionsCharts, patient?.addmission?._id, editChartData?._id]);

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
        <Row className="mt-3">
          {/* LEFT — where the patient stands today. Read-only. */}
          <Col xs={12} lg={6} className="mb-3 mb-lg-0">
            <div
              className="border rounded p-3 h-100"
              style={{ backgroundColor: "#fafbfc" }}
            >
              <div
                className="text-muted text-uppercase fw-semibold mb-2"
                style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
              >
                Current Admission Type
              </div>

              {currentAdmissionType ? (
                <React.Fragment>
                  <div className="fw-semibold">
                    {admissionTypeLabel(
                      "admissionType",
                      currentAdmissionType.data.admissionType,
                    )}
                  </div>

                  {getAdmissionTypeDetailParts(currentAdmissionType.data)
                    .length > 0 && (
                    <div
                      className="text-muted mt-1"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {getAdmissionTypeDetailParts(
                        currentAdmissionType.data,
                      ).join(" · ")}
                    </div>
                  )}

                  {currentAdmissionType.date && (
                    <div
                      className="text-muted mt-2"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Recorded{" "}
                      {format(new Date(currentAdmissionType.date), "dd MMM yyyy")}
                    </div>
                  )}
                </React.Fragment>
              ) : (
                <div className="fw-semibold text-muted">Nil</div>
              )}
            </div>
          </Col>

          {/* RIGHT — what it should become. */}
          <Col xs={12} lg={6}>
            <RenderFields fields={FORM_FIELDS} validation={validation} />
          </Col>
        </Row>

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
  // Raw state.Chart.data — admissions for every patient visited this session.
  // Scoped to the current admission inside the component.
  addmissionsCharts: PropTypes.array,
};

const mapStateToProps = (state) => ({
  patient: state.Chart.chartForm?.patient,
  author: state.User.user,
  chartDate: state.Chart.chartDate,
  editChartData: state.Chart.chartForm?.data,
  shouldPrintAfterSave: state.Chart.chartForm.shouldPrintAfterSave,
  addmissionsCharts: state.Chart.data,
});

export default connect(mapStateToProps)(AdmissionType);
