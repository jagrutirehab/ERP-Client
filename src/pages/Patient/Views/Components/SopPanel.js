import { useEffect, useState } from "react";
import { Collapse, UncontrolledTooltip } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import { format } from "date-fns";
import { fetchSopOverview } from "../../../../store/features/patient/patientSlice";
import { getCurrentAdmissionType } from "../../../../utils/admissionType";

const itemLabels = {
  VITAL_SIGN: "Vital Sign",
  COUNSELLING_NOTE: "Counselling Note",
  RELATIVE_VISIT: "Family Update",
  PRESCRIPTION: "Prescription",
  LAB_REPORT: "Lab Test",
  DETAIL_ADMISSION: "Detail History",
  MENTAL_EXAMINATION: "Clinical Note",
  DISCHARGE_SUMMARY: "Discharge Summary",
  ADMISSION_FORM: "MHRB Admission",
  EMERGENCY_ADMISSION_FORM: "Emergency Admission",
  CONSENT_FORM: "Admission and Consent Form",
  CAPACITY_ASSESSMENT_FORM: "Capacity Assessment",
  EMERGENCY_DISCHARGE_FORM: "Emergency Discharge",
  BELONGING_FORM: "Belonging Form",
};

const itemTooltips = {
  VITAL_SIGN: "Submitted every 24 hours",
  COUNSELLING_NOTE: "Submitted every 24 hours",
  RELATIVE_VISIT: "Submitted every 24 hours",
  MENTAL_EXAMINATION: "Submitted every 24 hours",
  PRESCRIPTION: "Within 1st 2 hours of admission",
  LAB_REPORT: "Within 1st 24 hours of admission",
  DETAIL_ADMISSION: "Within 1st 24 hours of admission",
  DISCHARGE_SUMMARY: "Created at discharge",
  ADMISSION_FORM: "Signed copy uploaded within 1st 24 hours of admission",
  EMERGENCY_ADMISSION_FORM: "Signed copy uploaded within 1st 24 hours of admission",
  CONSENT_FORM: "Signed copy uploaded within 1st 24 hours of admission",
  CAPACITY_ASSESSMENT_FORM: "Signed copy uploaded within 1st 24 hours of admission",
  EMERGENCY_DISCHARGE_FORM: "Signed copy uploaded within 1st 24 hours of admission",
  BELONGING_FORM: "Signed copy uploaded within 1st 24 hours of admission",
};

const statusLabels = {
  yes: "Yes",
  partial: "Partial",
  no: "No",
};

// EMERGENCY_ADMISSION_FORM and EMERGENCY_DISCHARGE_FORM are deliberately not
// in this list — they're rendered as their own gated blocks below (same
// pattern as the MHRB Email item), shown only for emergency admissions or
// once a file has actually been uploaded, rather than to every patient.
const DISPLAY_ORDER = [
  "VITAL_SIGN",
  "COUNSELLING_NOTE",
  "RELATIVE_VISIT",
  "PRESCRIPTION",
  "LAB_REPORT",
  "DETAIL_ADMISSION",
  "MENTAL_EXAMINATION",
  "DISCHARGE_SUMMARY",
  "ADMISSION_FORM",
  "CONSENT_FORM",
  "CAPACITY_ASSESSMENT_FORM",
  "BELONGING_FORM",
];

const statusColors = {
  yes: { bg: "#9AD872", text: "#fff" },
  partial: { bg: "#F2C94C", text: "#fff" },
  no: { bg: "#FF8383", text: "#fff" },
  null: { bg: "#FF8383", text: "#fff" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return null;
  }
};

const SkeletonItem = () => (
  <div
    className="d-flex flex-column align-items-center gap-1 px-2"
    style={{ minWidth: 90 }}
  >
    <span className="placeholder col-10" style={{ height: 10 }}></span>
    <span className="placeholder col-8" style={{ height: 8 }}></span>
  </div>
);

const SopPanel = ({ patient, sopOverview, sopLoading }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(true);

  const activeAdmission = patient.addmission;

  useEffect(() => {
    if (activeAdmission?._id) {
      dispatch(
        fetchSopOverview({
          admissionId: activeAdmission._id,
          currentDate: new Date().toISOString(),
        }),
      );
    }
  }, [dispatch, activeAdmission?._id]);

  if (!patient?.isAdmit || !activeAdmission) {
    return null;
  }

  const overview = sopOverview?.sopOverview;

  // MHRB Email Informed — shown only for Supportive (Sec. 89/90), Emergency,
  // or Minor admissions. Computed client-side from the admission/patient
  // objects already in scope here, not from the sopOverview API payload.
  const currentAdmissionType = getCurrentAdmissionType(activeAdmission)?.data;
  const isSupportiveAdmission =
    currentAdmissionType?.admissionType === "SUPPORTIVE_ADMISSION";
  const isEmergencyAdmission =
    currentAdmissionType?.admissionType === "EMERGENCY_ADMISSION";
  const isMinorPatient =
    currentAdmissionType?.admissionType === "INDEPENDENT_ADMISSION" &&
    currentAdmissionType?.adultationType === "MINOR";
  const showMhrbEmailItem =
    isSupportiveAdmission || isEmergencyAdmission || isMinorPatient;
  const isMHRBEmailSent = activeAdmission?.isMHRBEmailSent === true;

  // Emergency Admission / Emergency Discharge SOP tiles — shown only for an
  // emergency admission.
  const emergencyAdmissionData = overview?.EMERGENCY_ADMISSION_FORM;
  const emergencyDischargeData = overview?.EMERGENCY_DISCHARGE_FORM;
  const showEmergencyAdmissionItem = isEmergencyAdmission;
  const showEmergencyDischargeItem = isEmergencyAdmission;

  return (
    <div>
      <div
        className="border rounded py-2 px-3"
        style={{ backgroundColor: "#fafbfc" }}
      >
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ cursor: "pointer" }}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h6
            className="mb-0 fw-semibold text-muted"
            style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
          >
            SOP OVERVIEW
          </h6>
          <i
            className={`ri-arrow-${isOpen ? "up" : "down"}-s-line text-muted`}
            style={{ fontSize: "1rem" }}
          ></i>
        </div>
        <Collapse isOpen={isOpen}>
          <div className="d-flex flex-wrap gap-3 mt-2">
            {sopLoading || !overview
              ? Array.from({ length: DISPLAY_ORDER.length }).map((_, i) => (
                  <div key={i} className="placeholder-glow">
                    <SkeletonItem />
                  </div>
                ))
              : DISPLAY_ORDER.map((itemKey) => {
                  const data = overview[itemKey];
                  if (!data) return null;
                  const lastDate = formatDate(data.lastDate);

                  const statusKey = data.status || null;
                  const statusStyle =
                    statusColors[statusKey] || statusColors.null;
                  const tooltipId = `sop-${itemKey}`;
                  const tooltipText = itemTooltips[itemKey];
                  const statusLabel = statusLabels[statusKey];

                  return (
                    <div
                      key={itemKey}
                      id={tooltipId}
                      className="d-flex flex-column align-items-start"
                      style={{ minWidth: 100, cursor: "default" }}
                    >
                      <div className="d-flex align-items-center gap-1">
                        <span
                          className="rounded-circle d-inline-block"
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor: statusStyle.bg,
                            flexShrink: 0,
                          }}
                        ></span>
                        <span
                          className="fw-medium text-dark"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {itemLabels[itemKey]}
                        </span>
                      </div>
                      <span
                        className="text-muted"
                        style={{
                          fontSize: "0.7rem",
                          paddingLeft: 14,
                        }}
                      >
                        {lastDate || "Not yet"}
                      </span>
                      <UncontrolledTooltip target={tooltipId} placement="top">
                        {tooltipText}
                        {statusLabel ? `: ${statusLabel}` : ""}
                        {lastDate ? ` (${lastDate})` : ""}
                      </UncontrolledTooltip>
                    </div>
                  );
                })}
            {showMhrbEmailItem && (
              <div
                id="sop-MHRB_EMAIL"
                className="d-flex flex-column align-items-start"
                style={{ minWidth: 100, cursor: "default" }}
              >
                <div className="d-flex align-items-center gap-1">
                  <span
                    className="rounded-circle d-inline-block"
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: isMHRBEmailSent
                        ? statusColors.yes.bg
                        : statusColors.no.bg,
                      flexShrink: 0,
                    }}
                  ></span>
                  <span
                    className="fw-medium text-dark"
                    style={{ fontSize: "0.75rem" }}
                  >
                    MHRB Email Informed
                  </span>
                </div>
                <span
                  className="text-muted"
                  style={{
                    fontSize: "0.7rem",
                    paddingLeft: 14,
                  }}
                >
                  {isMHRBEmailSent ? "Yes" : "No"}
                </span>
                <UncontrolledTooltip target="sop-MHRB_EMAIL" placement="top">
                  MHRB email sent to the board
                  {isMHRBEmailSent ? ": Yes" : ": No"}
                </UncontrolledTooltip>
              </div>
            )}
            {showEmergencyAdmissionItem &&
              emergencyAdmissionData &&
              (() => {
                const lastDate = formatDate(emergencyAdmissionData.lastDate);
                const statusKey = emergencyAdmissionData.status || null;
                const statusStyle =
                  statusColors[statusKey] || statusColors.null;
                const statusLabel = statusLabels[statusKey];
                return (
                  <div
                    id="sop-EMERGENCY_ADMISSION_FORM"
                    className="d-flex flex-column align-items-start"
                    style={{ minWidth: 100, cursor: "default" }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      <span
                        className="rounded-circle d-inline-block"
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: statusStyle.bg,
                          flexShrink: 0,
                        }}
                      ></span>
                      <span
                        className="fw-medium text-dark"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {itemLabels.EMERGENCY_ADMISSION_FORM}
                      </span>
                    </div>
                    <span
                      className="text-muted"
                      style={{ fontSize: "0.7rem", paddingLeft: 14 }}
                    >
                      {lastDate || "Not yet"}
                    </span>
                    <UncontrolledTooltip
                      target="sop-EMERGENCY_ADMISSION_FORM"
                      placement="top"
                    >
                      {itemTooltips.EMERGENCY_ADMISSION_FORM}
                      {statusLabel ? `: ${statusLabel}` : ""}
                      {lastDate ? ` (${lastDate})` : ""}
                    </UncontrolledTooltip>
                  </div>
                );
              })()}
            {showEmergencyDischargeItem &&
              emergencyDischargeData &&
              (() => {
                const lastDate = formatDate(emergencyDischargeData.lastDate);
                const statusKey = emergencyDischargeData.status || null;
                const statusStyle =
                  statusColors[statusKey] || statusColors.null;
                const statusLabel = statusLabels[statusKey];
                return (
                  <div
                    id="sop-EMERGENCY_DISCHARGE_FORM"
                    className="d-flex flex-column align-items-start"
                    style={{ minWidth: 100, cursor: "default" }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      <span
                        className="rounded-circle d-inline-block"
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: statusStyle.bg,
                          flexShrink: 0,
                        }}
                      ></span>
                      <span
                        className="fw-medium text-dark"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {itemLabels.EMERGENCY_DISCHARGE_FORM}
                      </span>
                    </div>
                    <span
                      className="text-muted"
                      style={{ fontSize: "0.7rem", paddingLeft: 14 }}
                    >
                      {lastDate || "Not yet"}
                    </span>
                    <UncontrolledTooltip
                      target="sop-EMERGENCY_DISCHARGE_FORM"
                      placement="top"
                    >
                      {statusKey === "yes"
                        ? "Emergency Discharge : Yes"
                        : "Emergency Discharge : No"}
                    </UncontrolledTooltip>
                  </div>
                );
              })()}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  patient: state.Patient.patient,
  sopOverview: state.Patient.sopOverview,
  sopLoading: state.Patient.sopLoading,
});

export default connect(mapStateToProps)(SopPanel);
