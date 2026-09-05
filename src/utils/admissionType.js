import {
  ADMISSION_TYPE,
  admissionTypeFields,
} from "../Components/constants/patient";

/**
 * The admission type in force right now, read from the admission's own timeline
 * (`addmission.admissionTypeHistory`).
 *
 * That timeline is the single source of truth: the server writes it from BOTH
 * user actions — submitting an Admission Form and saving an Admission Type chart
 * — so reading it is the only way the panel reflects a type recorded through the
 * form, which creates no chart at all. Deriving it here rather than reading the
 * server's `currentAdmissionType` virtual is deliberate: the patient slice
 * patches this array in place after a chart save, and a virtual computed at
 * fetch time would go stale the moment it does.
 *
 * `excludeChartId` drops the period belonging to the chart currently being
 * edited — showing that chart as its own "current" would be circular.
 *
 * Returns { data, date, source } | null, where `data` carries the same field
 * shape the display helpers below expect.
 */
export const getCurrentAdmissionType = (addmission, excludeChartId = null) => {
  const history = addmission?.admissionTypeHistory;
  if (!Array.isArray(history) || history.length === 0) return null;

  const pool = excludeChartId
    ? history.filter((e) => String(e?.chart) !== String(excludeChartId))
    : history;
  if (pool.length === 0) return null;

  // The open period, or the newest one if the timeline was left fully revoked
  // (e.g. the only chart backing it was deleted while editing).
  const current =
    pool.find((e) => e && e.revokedAt == null) || pool[pool.length - 1];
  if (!current?.admissionType) return null;

  return {
    data: current,
    date: current.assignedAt || null,
    source: current.source || null,
  };
};

// Where a recorded type came from, for the "current type" panel — worth showing
// because a form-recorded type has no chart to open, so without this a user
// can't tell why there is nothing to click.
export const ADMISSION_TYPE_SOURCE_LABEL = {
  ADMISSION_FORM: "from Admission Form",
  ADMISSION_TYPE_CHART: "from Admission Type chart",
  BACKFILL: "from earlier records",
  // Typed straight onto the admission because no chart or form ever existed.
  MANUAL_ENTRY: "entered manually",
};

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
