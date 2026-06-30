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

// pull specialRequirements from the most recent *doctor-validated* Detail Admission chart
export const getAdmissionSpecialRequirements = (charts = []) => {
  const detailAdmissions = (charts || []).filter(
    (c) => c.chart === DETAIL_ADMISSION && c.detailAdmission && c.doctorValidatorId
  );
  if (detailAdmissions.length === 0) return null;

  const latest = detailAdmissions.reduce((a, b) => {
    const ad = new Date(a.date || a.createdAt || 0);
    const bd = new Date(b.date || b.createdAt || 0);
    return bd >= ad ? b : a;
  });

  return latest.detailAdmission.specialRequirements || null;
};
