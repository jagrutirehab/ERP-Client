// The clinical Patient Type options — shared by the Detail Admission form
// (DetailAdmission.patientType) and the IPD admission card
// (Addmission.patientAdmissionType), which hold the same values. The server
// mirrors them in src/constants/detailAdmissionPatientType.js.
export const PATIENT_TYPE_OPTIONS = [
  { value: "psychiatric", label: "Psychiatric" },
  { value: "addiction", label: "Addiction" },
  { value: "geriatric", label: "Geriatric / Dementia / Palliative" },
];

export const patientTypeLabel = (value) =>
  PATIENT_TYPE_OPTIONS.find((o) => o.value === value)?.label || "";

// Where the admission's Patient Type came from (patientAdmissionTypeMeta.source).
export const PATIENT_ADMISSION_TYPE_SOURCE_LABEL = {
  ADMISSION_CARD: "set on admission card",
  DETAIL_ADMISSION: "from Detail Admission",
  BACKFILL: "from Detail Admission",
};
