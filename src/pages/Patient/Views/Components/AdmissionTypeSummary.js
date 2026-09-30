import React from "react";
import { connect } from "react-redux";
import {
  getCurrentAdmissionType,
  admissionTypeLabel,
  getAdmissionTypeDetailParts,
} from "../../../../utils/admissionType";
import { SummaryCard } from "./SpecialRequirementsSummary";

/**
 * The patient's current Admission Type, shown in the header column.
 *
 * Reads the admission's own timeline (`addmission.admissionTypeHistory`), which
 * the server maintains from BOTH the Admission Form and the Admission Type
 * chart. It used to read the loaded charts instead, which meant a type recorded
 * through the form — creating no chart — left this card hidden entirely.
 *
 * Reading the admission rather than the charts also drops the old dependency on
 * fetchCharts: the card no longer waits for the Charting view to mount, and no
 * longer disappears when charts were never loaded for this admission.
 */
const AdmissionTypeSummary = ({ addmission, isAdmit }) => {
  if (!isAdmit || !addmission?._id) return null;

  const current = getCurrentAdmissionType(addmission);
  if (!current) return null;

  const data = current.data;
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
  addmission: state.Patient?.patient?.addmission,
  isAdmit: state.Patient?.patient?.isAdmit,
});

export default connect(mapStateToProps)(AdmissionTypeSummary);
