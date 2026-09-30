/**
 * Helpers for reading the shared `state.Chart.data` admissions slice safely.
 *
 * That slice is only ever upserted into, never pruned (see
 * chartSlice.js -> fetchChartsAddmissions.fulfilled), so at any moment it can
 * hold admissions belonging to any patient visited during the session: a fetch
 * issued for the previous patient that resolves after Main.js's clearCharts()
 * puts them straight back. Reading it by index (`data[0]`) or by an id held in
 * component state therefore risks showing — or writing to — the wrong patient's
 * admission.
 *
 * Always scope it to the patient currently on screen before use.
 */

/**
 * The given patient's admissions, newest first.
 *
 * @param {Array}  allAdmissions raw `state.Chart.data`
 * @param {Object} patient       `state.Patient.patient`
 * @returns {Array} only the admissions listed on `patient.addmissions`, sorted
 *   by `addmissionDate` descending — the same order the backend returns them in,
 *   made explicit here because the slice is reordered client-side by the
 *   add/update reducers.
 */
export const scopeAdmissionsToPatient = (allAdmissions, patient) => {
  if (!patient?.addmissions?.length) return [];
  const idSet = new Set(patient.addmissions);
  return (allAdmissions || [])
    .filter((a) => idSet.has(a._id))
    .sort((a, b) => new Date(b.addmissionDate) - new Date(a.addmissionDate));
};

/** The patient's most recent admission, or undefined. */
export const getLatestAdmission = (allAdmissions, patient) =>
  scopeAdmissionsToPatient(allAdmissions, patient)[0];

/**
 * True when `admissionId` really belongs to `patient`. Use before any write that
 * targets an admission by id — a stale id would file one patient's form against
 * another patient's admission.
 */
export const admissionBelongsToPatient = (admissionId, patient) =>
  !!admissionId && !!patient?.addmissions?.includes(admissionId);
