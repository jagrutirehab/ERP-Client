export const REFERRAL_SOURCE_OPTIONS = [
  { value: "walk_in", label: "Walk In" },
  { value: "google_search", label: "Google Search" },
  { value: "website", label: "Website" },
  { value: "tellecaller_team", label: "Tellecaller Team", sub: "employee-telecaller" },
  { value: "jagruti_staff", label: "Jagruti Staff", sub: "employee-all" },
  { value: "relative", label: "Relative", sub: "name" },
  { value: "friend", label: "Friend", sub: "name" },
  { value: "old_patient_referral", label: "Old Patient Referral", sub: "patient" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
];

export const REFERRAL_SOURCE_KEYS = REFERRAL_SOURCE_OPTIONS.map((o) => o.value);

// Sources whose sub-dropdown is mandatory (relative / friend name is optional).
export const REFERRAL_SOURCES_REQUIRING_REF = REFERRAL_SOURCE_OPTIONS.filter(
  (o) => o.sub && o.sub !== "name",
).map((o) => o.value);

// Options that ask for the doctor's name + mobile number (not source-based).
export const REFERRAL_DOCTOR_TYPES = ["psychiatrist", "doctor", "online", "other"];

// Display label for any picked option (source or doctor-type), "" if unknown.
export const referralSourceLabel = (value) => {
  const source = REFERRAL_SOURCE_OPTIONS.find((o) => o.value === value);
  if (source) return source.label;
  return REFERRAL_DOCTOR_TYPES.includes(value)
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : "";
};
