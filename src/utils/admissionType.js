import {
  ADMISSION_TYPE,
  admissionTypeFields,
} from "../Components/constants/patient";

/**
 * The Admission Type chart to display for an admission: the most recent one by
 * chart date.
 *
 * Unlike Detail Admission there is no validation gate — chart.model.js sets
 * needsValidation = false for every type outside DETAIL_ADMISSION /
 * EXPIRY_SUMMARY / DISCHARGE_SUMMARY, so these charts are never doctor-validated.
 *
 * The server already returns charts sorted date-descending, but the array is
 * mutated client-side by the add/update reducers, so pick the newest explicitly.
 */
export const getLatestAdmissionTypeChart = (charts = []) => {
  const admissionTypes = (charts || []).filter(
    (c) => c?.chart === ADMISSION_TYPE && c?.admissionType,
  );
  if (admissionTypes.length === 0) return null;

  return admissionTypes.reduce((a, b) => {
    const ad = new Date(a.date || a.createdAt || 0);
    const bd = new Date(b.date || b.createdAt || 0);
    return bd >= ad ? b : a;
  });
};

// Stored value -> human label, using the same descriptor the form renders from.
export const admissionTypeLabel = (fieldName, value) => {
  const field = admissionTypeFields.find((f) => f.name === fieldName);
  const option = (field?.options || []).find((opt) => opt.value === value);
  return option?.label || value;
};

/**
 * The descriptor entries worth showing for a saved record: those with a value,
 * and those whose `showIf` matches — so an emergency admission shows its reason
 * and restraint while an independent one shows only the adultation type.
 *
 * Shared by the chart display, both print renderers and the header summary card.
 */
export const getVisibleAdmissionTypeRows = (data) => {
  if (!data) return [];

  return admissionTypeFields.filter((field) => {
    if (!data[field.name]) return false;
    if (field.showIf && data[field.showIf.field] !== field.showIf.value) {
      return false;
    }
    return true;
  });
};

// The sub-answers below the admission type itself, already labelled. "Yes"/"No"
// alone is meaningless for restraint, so that one keeps its label as a prefix.
export const getAdmissionTypeDetailParts = (data) =>
  getVisibleAdmissionTypeRows(data)
    .filter((field) => field.name !== "admissionType")
    .map((field) => {
      const label = admissionTypeLabel(field.name, data[field.name]);
      return field.name === "emergencyRestraint"
        ? `${field.label}: ${label}`
        : label;
    });
