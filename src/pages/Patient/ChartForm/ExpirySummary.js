import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, Label, Spinner } from "reactstrap";
import PropTypes from "prop-types";

import * as Yup from "yup";
import { useFormik } from "formik";

import {
  EXPIRY_SUMMARY,
  expirySummaryFields,
} from "../../../Components/constants/patient";
import SummaryFields from "./Components/SummaryFields";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { set, formatISO } from "date-fns";


import { connect, useDispatch } from "react-redux";
import {
  addExpirySummary,
  createEditChart,
  updateExpirySummary,
} from "../../../store/actions";
import { setEventChart } from "../../../store/features/booking/bookingSlice";
import { toast } from "react-toastify";
import { getAIExpirySummary, validateAIExpirySummary, validateChart } from "../../../helpers/backend_helper";
import { FaCheck } from "react-icons/fa";
import ValidateConfirmationModal from "./Components/ValidateConfirmationModal";

const ExpirySummary = ({
  author,
  patient,
  chartDate,
  editChartData,
  type,
}) => {
  const dispatch = useDispatch();

  const [generateLoading, setGenerateLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditVerified, setIsEditVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validateType, setValidateType] = useState(null);

  const editSummary = editChartData?.expirySummary;

  const [step, setStep] = useState(editSummary ? 2 : 1);

  // Track date independently so selecting a date doesn't auto-fill the current time
  const [expiryDateOnly, setExpiryDateOnly] = useState(
    editSummary?.expiryDateTime ? new Date(editSummary.expiryDateTime) : null
  );

  const validation = useFormik({
    enableReinitialize: !!editSummary,

    initialValues: {
      author: author._id,
      patient: patient._id,
      center: patient.center._id,
      centerAddress: patient.center.title,
      addmission: patient.addmission._id,
      chart: EXPIRY_SUMMARY,
      diagnosis: editSummary ? editSummary.diagnosis : "",
      presentingSymptoms: editSummary ? editSummary.presentingSymptoms : "",
      mseAddmission: {
        appearance: editSummary ? editSummary.mseAddmission?.appearance : "",
        ecc: editSummary ? editSummary.mseAddmission?.ecc : "",
        speech: editSummary ? editSummary.mseAddmission?.speech : "",
        mood: editSummary ? editSummary.mseAddmission?.mood : "",
        affect: editSummary ? editSummary.mseAddmission?.affect : "",
        thoughts: editSummary ? editSummary.mseAddmission?.thoughts : "",
        perception: editSummary ? editSummary.mseAddmission?.perception : "",
        memory: editSummary ? editSummary.mseAddmission?.memory : "",
        abstractThinking: editSummary
          ? editSummary.mseAddmission?.abstractThinking
          : "",
        socialJudgment: editSummary
          ? editSummary.mseAddmission?.socialJudgment
          : "",
        insight: editSummary ? editSummary.mseAddmission?.insight : "",
      },
      pastHistory: editSummary ? editSummary.pastHistory : "",
      medicalHistory: editSummary ? editSummary.medicalHistory : "",
      familyHistory: editSummary ? editSummary.familyHistory : "",
      personalHistory: {
        smoking: editSummary ? editSummary.personalHistory.smoking : "",
        chewingTobacco: editSummary
          ? editSummary.personalHistory.chewingTobacco
          : "",
        alcohol: editSummary ? editSummary.personalHistory.alcohol : "",
      },
      physicalExamination: {
        temprature: editSummary
          ? editSummary.physicalExamination.temprature
          : "",
        pulse: editSummary ? editSummary.physicalExamination.pulse : "",
        bp: editSummary ? editSummary.physicalExamination.bp : "",
        cvs: editSummary ? editSummary.physicalExamination.cvs : "",
        rs: editSummary ? editSummary.physicalExamination.rs : "",
        abdomen: editSummary ? editSummary.physicalExamination.abdomen : "",
        cns: editSummary ? editSummary.physicalExamination.cns : "",
        others: editSummary ? editSummary.physicalExamination.others : "",
      },
      investigation: editSummary ? editSummary.investigation : "",
      discussion: editSummary ? editSummary.discussion : "",
      refernces: editSummary ? editSummary.refernces : "",
      modifiedTreatment: editSummary ? editSummary.modifiedTreatment : "",
      deportAdministered: editSummary ? editSummary.deportAdministered : "",
      treatment: editSummary ? editSummary.treatment : "",
      note: editSummary ? editSummary.note : "",
      consultantName: editSummary ? editSummary.consultantName : "",
      consultantSignature: editSummary ? editSummary.consultantSignature : "",
      consultantPsychologist: editSummary
        ? editSummary.consultantPsychologist
        : "",
      summaryPreparedBy: editSummary ? editSummary.summaryPreparedBy : "",
      expiryCause: editSummary ? editSummary.expiryCause : "",
      expiryDateTime: editSummary?.expiryDateTime
        ? formatISO(new Date(editSummary.expiryDateTime))
        : "",
      type,
      date: chartDate,
    },
    validationSchema: Yup.object({
      expiryCause: Yup.string().required("Please enter the cause of death"),
      expiryDateTime: Yup.string().required("Please enter the date and time of expiry"),
    }),
    onSubmit: (values) => {
      const extraFields =
        geminiResponse && Object.keys(geminiResponse).length > 0
          ? {
            geminiResponseGeneratedBy: author?._id,
            geminiResponseIsVerified: isVerified,
          }
          : {};

      if (editSummary) {
        dispatch(
          updateExpirySummary({
            id: editChartData._id,
            chartId: editSummary._id,
            ...values,
            ...extraFields,
          })
        );
      } else {
        dispatch(
          addExpirySummary({
            ...values,
            ...extraFields,
          })
        );
      }

      localStorage.removeItem("ai_expiry_summary");
    },
  });

  const closeForm = () => {
    localStorage.removeItem("ai_expiry_summary");
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    validation.resetForm();
  };

  // Validate step 1 fields and advance to step 2
  const handleNext = async () => {
    // Touch step-1 fields to show errors
    await validation.setFieldTouched("expiryCause", true, true);
    await validation.setFieldTouched("expiryDateTime", true, true);

    const errors = await validation.validateForm();
    if (errors.expiryCause || errors.expiryDateTime) return; // stay on step 1

    setStep(2);
  };

  const getGeminiSummary = async () => {
    setGenerateLoading(true);
    try {
      const response = await getAIExpirySummary({
        patient: patient?._id,
        addmission: patient?.addmission?._id,
      });

      const data = response?.data;
      setGeminiResponse(data);
      localStorage.setItem("ai_expiry_summary", JSON.stringify(data));

      const clean = (val) => {
        if (!val) return "";

        if (typeof val === "string") {
          const normalized = val.trim().toLowerCase();

          const invalidValues = [
            "not documented in records",
            "not documented",
            "na",
            "n/a",
            "null",
            "undefined",
            "-"
          ];

          if (invalidValues.includes(normalized)) return "";

          return val.trim();
        }

        return val;
      };

      validation.setValues({
        ...validation.values,

        diagnosis: clean(data.diagnosis),
        presentingSymptoms: clean(data.presentingSymptoms),

        mseAddmission: {
          appearance: clean(data.mseAddmission?.appearance),
          ecc: clean(data.mseAddmission?.ecc),
          speech: clean(data.mseAddmission?.speech),
          mood: clean(data.mseAddmission?.mood),
          affect: clean(data.mseAddmission?.affect),
          thoughts: clean(data.mseAddmission?.thoughts),
          perception: clean(data.mseAddmission?.perception),
          memory: clean(data.mseAddmission?.memory),
          abstractThinking: clean(data.mseAddmission?.abstractThinking),
          socialJudgment: clean(data.mseAddmission?.socialJudgment),
          insight: clean(data.mseAddmission?.insight),
        },

        pastHistory: clean(data.pastHistory),
        medicalHistory: clean(data.medicalHistory),
        familyHistory: clean(data.familyHistory),

        personalHistory: {
          smoking: clean(data.personalHistory?.smoking),
          chewingTobacco: clean(data.personalHistory?.chewingTobacco),
          alcohol: clean(data.personalHistory?.alcohol),
        },

        physicalExamination: {
          temprature: clean(data.physicalExamination?.temprature),
          pulse: clean(data.physicalExamination?.pulse),
          bp: clean(data.physicalExamination?.bp),
          cvs: clean(data.physicalExamination?.cvs),
          rs: clean(data.physicalExamination?.rs),
          abdomen: clean(data.physicalExamination?.abdomen),
          cns: clean(data.physicalExamination?.cns),
          others: clean(data.physicalExamination?.others),
        },

        investigation: clean(data.investigation),
        discussion: clean(data.discussion),
        refernces: clean(data.refernces),
        modifiedTreatment: clean(data.modifiedTreatment),
        deportAdministered: clean(data.deportAdministered),
        treatment: clean(data.treatment),
        note: clean(data.note),
        consultantName: clean(data.consultantName),
        consultantPsychologist: clean(data.consultantPsychologist),
        summaryPreparedBy: clean(data.summaryPreparedBy),
        expiryCause: clean(data.expiryCause) || validation.values.expiryCause,
        expiryDateTime:
          data.expiryDateTime &&
            data.expiryDateTime !== "Not documented in records"
            ? data.expiryDateTime
            : validation.values.expiryDateTime,
      });

      toast.success(response?.message || "AI Summary Generated");

    } catch (error) {
      toast.error("Failed to Generate the summary, please try again");
    } finally {
      setGenerateLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("ai_expiry_summary");

    if (saved && !editSummary) {
      const data = JSON.parse(saved);

      const clean = (val) =>
        val === "Not documented in records" ? "" : val;

      validation.setValues({
        ...validation.values,

        diagnosis: clean(data.diagnosis),
        presentingSymptoms: clean(data.presentingSymptoms),

        mseAddmission: {
          appearance: clean(data.mseAddmission?.appearance),
          ecc: clean(data.mseAddmission?.ecc),
          speech: clean(data.mseAddmission?.speech),
          mood: clean(data.mseAddmission?.mood),
          affect: clean(data.mseAddmission?.affect),
          thoughts: clean(data.mseAddmission?.thoughts),
          perception: clean(data.mseAddmission?.perception),
          memory: clean(data.mseAddmission?.memory),
          abstractThinking: clean(data.mseAddmission?.abstractThinking),
          socialJudgment: clean(data.mseAddmission?.socialJudgment),
          insight: clean(data.mseAddmission?.insight),
        },

        pastHistory: clean(data.pastHistory),
        medicalHistory: clean(data.medicalHistory),
        familyHistory: clean(data.familyHistory),

        personalHistory: {
          smoking: clean(data.personalHistory?.smoking),
          chewingTobacco: clean(data.personalHistory?.chewingTobacco),
          alcohol: clean(data.personalHistory?.alcohol),
        },

        physicalExamination: {
          temprature: clean(data.physicalExamination?.temprature),
          pulse: clean(data.physicalExamination?.pulse),
          bp: clean(data.physicalExamination?.bp),
          cvs: clean(data.physicalExamination?.cvs),
          rs: clean(data.physicalExamination?.rs),
          abdomen: clean(data.physicalExamination?.abdomen),
          cns: clean(data.physicalExamination?.cns),
          others: clean(data.physicalExamination?.others),
        },

        investigation: clean(data.investigation),
        discussion: clean(data.discussion),
        refernces: clean(data.refernces),
        modifiedTreatment: clean(data.modifiedTreatment),
        deportAdministered: clean(data.deportAdministered),
        treatment: clean(data.treatment),
        note: clean(data.note),
        consultantName: clean(data.consultantName),
        consultantPsychologist: clean(data.consultantPsychologist),
        summaryPreparedBy: clean(data.summaryPreparedBy),
        expiryCause: clean(data.expiryCause) || validation.values.expiryCause,
        expiryDateTime:
          data.expiryDateTime &&
            data.expiryDateTime !== "Not documented in records"
            ? data.expiryDateTime
            : validation.values.expiryDateTime,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleValidateResponse = async () => {
    setLoading(true);
    try {
      let response;
      if (editChartData?.geminiResponseIsVerified === false) {
        response = await validateAIExpirySummary({ summary: editSummary?._id });
      } else {
        response = await validateChart(editChartData?._id);
      }
      setIsEditVerified(true);
      dispatch({
        type: "editExpirySummary/fulfilled",
        payload: {
          payload: response.payload,
        },
      });
      if (response?.payload?.type === "OPD" && response.payload.appointment) {
        dispatch(
          setEventChart({
            chart: response.payload,
            appointment: response.payload.appointment,
            patient: response.payload.patient,
          })
        );
      }
      toast.success(response?.message || "Successfully Validated.");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to Validate Response");
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const renderMandatoryFields = () => (
    <Row className="mt-3">
      <Col xs={12} md={6}>
        <div className="mb-3">
          <Label for="expiryDateTime">
            Date and Time of Expiry <span className="text-danger">*</span>
          </Label>
          <div className="d-flex align-items-center">
            <span>
              <Flatpickr
                value={expiryDateOnly || undefined}
                onChange={([date]) => {
                  setExpiryDateOnly(date);
                  if (validation.values.expiryDateTime) {
                    const base = new Date(validation.values.expiryDateTime);
                    const combined = set(base, {
                      year: date.getFullYear(),
                      month: date.getMonth(),
                      date: date.getDate(),
                    });
                    validation.setFieldValue(
                      "expiryDateTime",
                      formatISO(combined)
                    );
                  }
                }}
                options={{
                  dateFormat: "d M, Y",
                }}
                placeholder="Select date"
                className="form-control shadow-none bg-light"
              />
            </span>
            <span className="ms-3 me-3">at</span>
            <span>
              <Flatpickr
                value={
                  validation.values.expiryDateTime
                    ? new Date(validation.values.expiryDateTime)
                    : undefined
                }
                onChange={([time]) => {
                  const base = expiryDateOnly
                    ? new Date(expiryDateOnly)
                    : (validation.values.expiryDateTime
                      ? new Date(validation.values.expiryDateTime)
                      : new Date());
                  const combined = set(base, {
                    hours: time.getHours(),
                    minutes: time.getMinutes(),
                    seconds: time.getSeconds(),
                    milliseconds: time.getMilliseconds(),
                  });
                  validation.setFieldValue(
                    "expiryDateTime",
                    formatISO(combined)
                  );
                }}
                options={{
                  enableTime: true,
                  noCalendar: true,
                  dateFormat: "G:i:S K",
                  time_24hr: false,
                }}
                placeholder="Select time"
                className="form-control shadow-none bg-light"
              />
            </span>
          </div>
          {validation.touched.expiryDateTime && validation.errors.expiryDateTime && (
            <div className="invalid-feedback d-block">{validation.errors.expiryDateTime}</div>
          )}
        </div>
      </Col>

      <Col xs={12} md={6}>
        <div className="mb-3">
          <Label for="expiryCause">
            Cause of Death <span className="text-danger">*</span>
          </Label>
          <textarea
            id="expiryCause"
            rows="4"
            name="expiryCause"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.expiryCause || ""}
            className={`form-control${validation.touched.expiryCause && validation.errors.expiryCause
                ? " is-invalid"
                : ""
              }`}
          />
          {validation.touched.expiryCause && validation.errors.expiryCause && (
            <div className="invalid-feedback">{validation.errors.expiryCause}</div>
          )}
        </div>
      </Col>
    </Row>
  );

  if (step === 1) {
    return (
      <React.Fragment>
        <div>
          {renderMandatoryFields()}
          <div className="d-flex gap-3 justify-content-end mt-3 border-top pt-3">
            <Button color="danger" outline size="sm" type="button" onClick={closeForm}>
              Cancel
            </Button>
            <Button color="primary" size="sm" type="button" onClick={handleNext}>
              Next →
            </Button>
          </div>
        </div>
      </React.Fragment>
    );
  }

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

          {!editSummary && (
            <div className="d-flex align-items-center justify-content-between mb-3">
              <Button
                type="button"
                onClick={getGeminiSummary}
                disabled={
                  generateLoading ||
                  !validation.values.expiryDateTime ||
                  !validation.values.expiryCause?.trim()
                }
                title={
                  !validation.values.expiryDateTime || !validation.values.expiryCause?.trim()
                    ? "Please fill Date & Time of Expiry and Cause of Death first"
                    : ""
                }
              >
                {generateLoading ? (
                  <span className="d-flex align-items-center">
                    <Spinner size="sm" className="me-2" />
                    Generating...
                  </span>
                ) : (
                  "Generate AI-Summary"
                )}
              </Button>
            </div>
          )}

          {renderMandatoryFields()}

          <Row>
            {(expirySummaryFields.slice(2, 13) || []).map((item, idx) => (
              <SummaryFields
                validation={validation}
                item={item}
                key={item.name + idx}
              />
            ))}
            <Col xs={12} className="my-3">
              <div className="mb-3">
                <Label>Treatment Given</Label>
                <textarea
                  rows="4"
                  bsSize="sm"
                  name={"treatment"}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.treatment || ""}
                  className="form-control"
                />
              </div>
            </Col>
            {(expirySummaryFields.slice(13, 16) || []).map((item, idx) => (
              <SummaryFields
                validation={validation}
                item={item}
                key={item.name + idx}
              />
            ))}
            {(expirySummaryFields.slice(16) || []).map((item, idx) => (
              <SummaryFields
                validation={validation}
                item={item}
                key={item.name + idx}
              />
            ))}
          </Row>

          <div className="mt-3">
            <div className="d-flex gap-3 justify-content-end">
              {!editChartData ? (
                geminiResponse &&
                Object.keys(geminiResponse).length > 0 && (
                  <Button
                    disabled={loading}
                    onClick={() => {
                      setValidateType("new");
                      toggleModal();
                    }}
                  >
                    {loading ? (
                      <span className="d-flex align-items-center">
                        <Spinner size="sm" className="me-3" />
                        Validating...
                      </span>
                    ) : isVerified ? (
                      <span className="d-flex align-items-center">
                        <FaCheck className="me-3" />
                        Validated
                      </span>
                    ) : (
                      "Validate"
                    )}
                  </Button>
                )
              ) : (editChartData && !editChartData.validatorId && (editChartData.needsValidation || editChartData.geminiResponseIsVerified === false) && !isEditVerified && author?.role === "DOCTOR") ? (
                <Button
                  type="button"
                  disabled={loading || validation.dirty}
                  title={validation.dirty ? "Please save your changes before validating" : ""}
                  onClick={() => {
                    setValidateType("edit");
                    toggleModal();
                  }}
                >
                  {loading ? <span><Spinner size="sm" />Validating...</span> : "Validate"}
                </Button>
              ) : null}
              <Button
                onClick={closeForm}
                size="sm"
                color="danger"
                type="button"
              >
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Save
              </Button>
            </div>
          </div>
        </Form>
        <ValidateConfirmationModal
          isOpen={isModalOpen}
          toggle={toggleModal}
          loading={loading}
          isVerified={isVerified}
          onConfirm={async () => {
            if (validateType === "edit") {
              await handleValidateResponse();
            } else if (validateType === "new") {
              setLoading(true);

              setTimeout(() => {
                setIsVerified((prev) => !prev);
                setLoading(false);
              }, 1000);
            }

            toggleModal();
          }}
        />
      </div>
    </React.Fragment>
  );
};

ExpirySummary.propTypes = {
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

export default connect(mapStateToProps)(ExpirySummary);
