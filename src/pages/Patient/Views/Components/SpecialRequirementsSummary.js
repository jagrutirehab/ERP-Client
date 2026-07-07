import React from "react";
import { connect } from "react-redux";
import SpecialRequirementsChips from "../../../../Components/Common/SpecialRequirementsChips";
import {
  getLatestDisplayableDetailAdmission,
  getSelectedSpecialRequirements,
  isOldChart,
} from "../../../../utils/specialRequirements";
import { capitalizeWords } from "../../../../utils/toCapitalize";

// SOP-overview style card
const SummaryCard = ({ title, children, compact }) => (
  <div
    className={`border rounded mt-2 ${compact ? "py-1 px-2" : "py-2 px-3"}`}
    style={{ backgroundColor: "#fafbfc" }}
  >
    <h6
      className={`fw-semibold text-muted ${compact ? "mb-1" : "mb-2"}`}
      style={{ fontSize: compact ? "0.65rem" : "0.75rem", letterSpacing: "0.5px" }}
    >
      {title}
    </h6>
    {children}
  </div>
);

const SpecialRequirementsSummary = ({ addmissionsCharts, consentfromRaw, isAdmit }) => {
  if (!isAdmit) return null;

  const latestAdmission = (addmissionsCharts || [])[0];
  const latestDetailAdmission = getLatestDisplayableDetailAdmission(
    latestAdmission?.charts
  );
  const specialRequirements =
    latestDetailAdmission?.detailAdmission?.specialRequirements || null;
  const hasChips =
    getSelectedSpecialRequirements(specialRequirements).length > 0;
  // old detail admissions predate the feature, so requirements were never captured
  const oldChart = !hasChips && isOldChart(latestDetailAdmission);

  const roomType = consentfromRaw?.length
    ? consentfromRaw[consentfromRaw.length - 1]?.roomType
    : null;

  if (!hasChips && !oldChart && !roomType) return null;

  return (
    <React.Fragment>
      {hasChips && (
        <SummaryCard title="SPECIAL REQUIREMENTS">
          <SpecialRequirementsChips data={specialRequirements} label="" />
        </SummaryCard>
      )}
      {oldChart && (
        <SummaryCard title="SPECIAL REQUIREMENTS" compact>
          <span
            className="text-muted fst-italic"
            style={{ fontSize: "0.7rem" }}
          >
            Old chart — special requirements not recorded
          </span>
        </SummaryCard>
      )}
      {roomType && (
        <SummaryCard title="ROOM SELECTION" compact>
          <span style={{ fontSize: "0.7rem" }}>
            {capitalizeWords(roomType)}
          </span>
        </SummaryCard>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  addmissionsCharts: state.Chart.data,
  consentfromRaw: state.Patient?.patient?.addmission?.consentfromRaw,
  isAdmit: state.Patient?.patient?.isAdmit,
});

export default connect(mapStateToProps)(SpecialRequirementsSummary);
