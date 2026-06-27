import React from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import { connect, useDispatch } from "react-redux";

//constants
import {
  CLINICAL_NOTE,
  COUNSELLING_NOTE,
  DETAIL_ADMISSION,
  DISCHARGE_SUMMARY,
  EXPIRY_SUMMARY,
  LAB_REPORT,
  PRESCRIPTION,
  RELATIVE_VISIT,
  OUTPASS,
  VITAL_SIGN,
  MENTAL_EXAMINATION,
  PSYCHO_DIAGNOSTIC_FORM,
} from "../../../Components/constants/patient";

//forms
import Prescription from "./Prescription";
import ClinicalNote from "./ClinicalNote";
import LabReport from "./LabReport";
import DischargeSummary from "./DischargeSummary";
import ExpirySummary from "./ExpirySummary";
import VitalSign from "./VitalSign";
import { createEditChart } from "../../../store/actions";
import RelativeVisit from "./RelativeVisit";
import Outpass from "./Outpass";
import DetailAdmission from "./DetailAdmission";
import CounsellingNote from "./CounsellingNote";
import MentalExamination from "./MentalExamination";
import PsychoDiagnosticForm from "./PsychoDiagnosticForm";

const ChartForm = ({ chart, onSubmitClinicalForm, ...rest }) => {
  const dispatch = useDispatch();
  const toggleForm = () => {
    dispatch(createEditChart({ data: null, chart: null, isOpen: false }));
    localStorage.removeItem("ai_discharge_summary");
    localStorage.removeItem("ai_expiry_summary");
  };

  const isPrescription = chart.chart === PRESCRIPTION;
  const isClinicalNotes = chart.chart === CLINICAL_NOTE;
  const isCounsellingNotes = chart.chart === COUNSELLING_NOTE;
  const isVitalSigns = chart.chart === VITAL_SIGN;
  const isLabReports = chart.chart === LAB_REPORT;
  const isRelativeVisit = chart.chart === RELATIVE_VISIT;
  const isOutpass = chart.chart === OUTPASS;
  const isDischargeSummary = chart.chart === DISCHARGE_SUMMARY;
  const isExpirySummary = chart.chart === EXPIRY_SUMMARY;
  const isDetailAdmission = chart.chart === DETAIL_ADMISSION;
  const isMentalExamination = chart.chart === MENTAL_EXAMINATION;
  const isPsychoDiagnosticForm = chart.chart === PSYCHO_DIAGNOSTIC_FORM;

  const title = isPrescription
    ? "Prescription"
    : isClinicalNotes
      ? "Clinical Notes"
      : isCounsellingNotes
        ? "Counselling Notes"
        : isVitalSigns
          ? "Vital Signs"
          : isLabReports
            ? "Lab Report"
            : isDischargeSummary
              ? "Discharge Summary"
              : isExpirySummary
                ? "Expiry Summary"
                : isRelativeVisit
                  ? "Relative Visit"
                  : isOutpass
                    ? "Outpass"
                    : isMentalExamination
                      ? "Clinical Notes"
                      : isPsychoDiagnosticForm
                        ? "Psycho Diagnostic Report"
                        : "Detail Admission";

  // console.log({ type });

  return (
    <React.Fragment>
      <CustomModal
        centered={true}
        title={title}
        size="xl"
        isOpen={chart.isOpen}
        toggle={toggleForm}
      >
        {isPrescription && <Prescription {...rest} />}
        {isClinicalNotes && (
          <ClinicalNote onSubmitClinicalForm={onSubmitClinicalForm} {...rest} />
        )}
        {isCounsellingNotes && (
          <CounsellingNote
            onSubmitClinicalForm={onSubmitClinicalForm}
            {...rest}
          />
        )}
        {isVitalSigns && <VitalSign {...rest} />}
        {isLabReports && <LabReport {...rest} />}
        {isRelativeVisit && <RelativeVisit {...rest} />}
        {isOutpass && <Outpass {...rest} />}
        {isDischargeSummary && <DischargeSummary {...rest} />}
        {isExpirySummary && <ExpirySummary {...rest} />}
        {isDetailAdmission && (
          <DetailAdmission {...rest} closeForm={toggleForm} />
        )}
        {isMentalExamination && <MentalExamination {...rest} />}
        {isPsychoDiagnosticForm && <PsychoDiagnosticForm {...rest} />}
      </CustomModal>
    </React.Fragment>
  );
};

ChartForm.propTypes = {
  chart: PropTypes.object,
  toggleDateModal: PropTypes.func,
  editChartData: PropTypes.object,
};

const mapStateToProps = (state) => ({
  chart: state.Chart.chartForm,
});

export default connect(mapStateToProps)(ChartForm);
