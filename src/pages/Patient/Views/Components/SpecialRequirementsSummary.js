import React from "react";
import { connect } from "react-redux";
import SpecialRequirementsChips from "../../../../Components/Common/SpecialRequirementsChips";
import {
  getAdmissionSpecialRequirements,
  getSelectedSpecialRequirements,
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

// latest admission's doctor-validated special requirements (Yes only)
// and the room selection from the admission's consent form (latest entry)
const SpecialRequirementsSummary = ({ addmissionsCharts, consentfromRaw }) => {
  const latestAdmission = (addmissionsCharts || [])[0];
  const specialRequirements = getAdmissionSpecialRequirements(
    latestAdmission?.charts
  );
  const hasChips =
    getSelectedSpecialRequirements(specialRequirements).length > 0;

  const roomType = consentfromRaw?.length
    ? consentfromRaw[consentfromRaw.length - 1]?.roomType
    : null;

  if (!hasChips && !roomType) return null;

  return (
    <React.Fragment>
      {hasChips && (
        <SummaryCard title="SPECIAL REQUIREMENTS">
          <SpecialRequirementsChips data={specialRequirements} label="" />
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
});

export default connect(mapStateToProps)(SpecialRequirementsSummary);
