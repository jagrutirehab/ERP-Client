import { DETAIL_ADMISSION } from "../Components/constants/patient";

// stored as Boolean: true = Yes, false = No, undefined = not answered
export const SPECIAL_REQUIREMENT_LABELS = {
  physiotherapy: "Physiotherapy",
  walking: "Walking",
  homeMedicines: "Home Medicines",
  exercise: "Exercise",
  foodRequirement: "Food Requirement",
  externalDoctorVisits: "External Doctor Visits",
  extraCareTaker: "Extra Care Taker",
};

// labels of requirements explicitly marked Yes (true)
export const getSelectedSpecialRequirements = (sr) => {
  if (!sr) return [];
  return Object.keys(SPECIAL_REQUIREMENT_LABELS)
    .filter((k) => sr[k] === true)
    .map((k) => SPECIAL_REQUIREMENT_LABELS[k]);
};

// old charts predate the validation feature and carry neither `doctorValidatorId`
// nor `needsValidation`. new charts always store `needsValidation` (Boolean)
// alongside `doctorValidatorId`, so its absence marks the chart as an old one.
export const isOldChart = (chart) =>
  !!chart && chart.needsValidation === undefined;

// the Detail Admission chart to display for: old charts show directly (they have
// no validation concept), new charts show only once doctor-validated.
export const getLatestDisplayableDetailAdmission = (charts = []) => {
  const detailAdmissions = (charts || []).filter(
    (c) =>
      c.chart === DETAIL_ADMISSION &&
      c.detailAdmission &&
      (c.doctorValidatorId || isOldChart(c))
  );
  if (detailAdmissions.length === 0) return null;

  return detailAdmissions.reduce((a, b) => {
    const ad = new Date(a.date || a.createdAt || 0);
    const bd = new Date(b.date || b.createdAt || 0);
    return bd >= ad ? b : a;
  });
};

// pull specialRequirements from the most recent displayable Detail Admission chart
export const getAdmissionSpecialRequirements = (charts = []) => {
  const latest = getLatestDisplayableDetailAdmission(charts);
  return latest?.detailAdmission?.specialRequirements || null;
};
