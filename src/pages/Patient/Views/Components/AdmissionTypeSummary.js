import React from "react";
import { connect } from "react-redux";
import {
  getLatestAdmissionTypeChart,
  admissionTypeLabel,
  getAdmissionTypeDetailParts,
} from "../../../../utils/admissionType";
import { SummaryCard } from "./SpecialRequirementsSummary";

/**
 * The patient's latest Admission Type, shown in the header column.
 *
 * Reads charts already loaded for the current admission — no request of its own.
 * Those charts arrive via fetchCharts, which only runs once the Charting view has
 * mounted, so the card appears a render after the rest of the header and stays
 * hidden if charts were never loaded for this admission.
 */
const AdmissionTypeSummary = ({
  addmissionsCharts,
  currentAdmissionId,
  isAdmit,
}) => {
  if (!isAdmit || !currentAdmissionId) return null;

  // Match the admission by id rather than taking [0] — patient.addmission is the
  // canonical current admission, and [0] is only the same by coincidence of the
  // addmissionDate sort.
  const charts = (addmissionsCharts || []).find(
    (admission) => admission?._id === currentAdmissionId,
  )?.charts;

  const latest = getLatestAdmissionTypeChart(charts);
  if (!latest) return null;

  const data = latest.admissionType;
  const typeLabel = admissionTypeLabel("admissionType", data?.admissionType);
  if (!typeLabel) return null;

  const detail = getAdmissionTypeDetailParts(data);

  return (
    <SummaryCard title="ADMISSION TYPE" compact>
      <div style={{ fontSize: "0.7rem" }}>{typeLabel}</div>
      {detail.length > 0 && (
        <div className="text-muted" style={{ fontSize: "0.7rem" }}>
          {detail.join(" · ")}
        </div>
      )}
    </SummaryCard>
  );
};

const mapStateToProps = (state) => ({
  addmissionsCharts: state.Chart.data,
  currentAdmissionId: state.Patient?.patient?.addmission?._id,
  isAdmit: state.Patient?.patient?.isAdmit,
});

export default connect(mapStateToProps)(AdmissionTypeSummary);
