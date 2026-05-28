const toSelectOptions = (arr) => arr.map((v) => ({ value: v, label: v }));

export const VALUELESS_OPERATORS = new Set(["EXISTS", "NOT_EXISTS"]);
export const TRIGGER_OPTIONS = toSelectOptions(["IMMEDIATE", "DELAYED"]);
export const SEVERITY_OPTIONS = toSelectOptions([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);
export const ADMISSION_TYPE_OPTIONS = [
  { value: "IPD", label: "IPD" },
  { value: "OPD", label: "OPD" },
  { value: "BOTH", label: "Both" },
];
export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Both", label: "Both" },
];
export const TARGET_OPTIONS = toSelectOptions([
  "Addmission",
  "Patient",
  "VitalSign",
  "Prescription",
  "DetailAdmission",
  "ciwaTest",
  "ramsaySedationTest",
  "morseTest",
  "glasgowTest",
  "LabReport",
]);
export const OPERATOR_OPTIONS = [
  "GREATER_THAN",
  "LESS_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN_OR_EQUAL",
  "EQUALS",
  "NOT_EQUALS",
  "EXISTS",
  "NOT_EXISTS",
].map((op) => ({ value: op, label: op.replace(/_/g, " ") }));

export const OPERATORS_BY_TYPE = {
  Number: [
    "GREATER_THAN",
    "LESS_THAN",
    "GREATER_THAN_OR_EQUAL",
    "LESS_THAN_OR_EQUAL",
    "EQUALS",
    "NOT_EQUALS",
  ],
  Date: [
    "GREATER_THAN",
    "LESS_THAN",
    "GREATER_THAN_OR_EQUAL",
    "LESS_THAN_OR_EQUAL",
    "EXISTS",
    "NOT_EXISTS",
  ],
  Boolean: ["EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS"],
  Array: ["EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS"],
  String: ["EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS"],
};

export const BOOLEAN_OPTIONS = [
  { value: true, label: "True" },
  { value: false, label: "False" },
];

// Period drives how the cron expands a DELAYED condition into checkpoints:
//   - DEADLINE   : single one-time check at admission + `intervalHours`.
//   - CONTINUOUS : every `intervalHours` from admission until discharge/now.
//   - DAYS       : on each listed day; if intervalHours is also set, sub-divide
//                  each day by that interval.
export const PERIOD_OPTIONS = [
  { value: "DEADLINE",   label: "Deadline (one-time)" },
  { value: "CONTINUOUS", label: "Continuous (every N hours)" },
  { value: "DAYS",       label: "Days (specific days)" },
];

export const emptyConditionItem = () => ({
  model: null,
  field: "",
  operator: { value: "EXISTS", label: "EXISTS" },
  triggerType: TRIGGER_OPTIONS[0],
  deadlineHours: "",
  value: [],
  schedule: {
    period: PERIOD_OPTIONS[0],   // "Days" default
    days: [],                     // e.g. [1, 3, 7] — day numbers since admission
    intervalHours: "",            // optional integer (every N hours)
    graceHours: 0,                // tolerance window in hours
  },
});

export const emptyRouting = () => ({
  selectedRoles: [],
  selectedUsers: [],
});

export const emptyTargetBlock = () => ({
  id: Date.now() + Math.random(),
  name: "",
  alertTemplate: "",
  conditions: [emptyConditionItem()],
  // Per-block alert recipe — every block is a self-contained alert definition.
  severity: SEVERITY_OPTIONS[1],
  actionGuidance: "",
  referenceSection: "",
  ...emptyRouting(),
});

export const emptyForm = () => ({
  ruleName: "",
  protocol: "",
  isActive: true,
});
export const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
].map((v) => ({ value: v, label: v }));

// ─── Suggested Medicines ──────────────────────────────────────────────────

export const MEDICINE_CATEGORY_OPTIONS = [
  { value: "WITHDRAWAL",  label: "Withdrawal (CDZ, antiepileptics)" },
  { value: "GENERAL",     label: "General (Thiamine, B-Plex, antacids)" },
  { value: "HEPATIC",     label: "Hepatic (Udiliv, Rifagut, Lornit)" },
  { value: "MAINTENANCE", label: "Maintenance (Acamprosate, Topiramate)" },
  { value: "DISCHARGE",   label: "Discharge prescription" },
  { value: "SOS",         label: "SOS / PRN" },
  { value: "OTHER",       label: "Other" },
];

export const MEDICINE_PRIORITY_OPTIONS = [
  { value: "ROUTINE",   label: "Routine" },
  { value: "HIGH",      label: "High" },
  { value: "URGENT",    label: "Urgent" },
  { value: "EMERGENCY", label: "Emergency" },
];

export const MEDICINE_INTAKE_OPTIONS = [
  { value: "Before food", label: "Before food" },
  { value: "After food",  label: "After food" },
];

export const emptySuggestedMedicine = () => ({
  id: Date.now() + Math.random(),                  // local-only UI key
  medicine: null,                                  // { value, label, snapshot? }
  medicineSnapshot: { name: "", type: "", strength: "", unit: "" },
  dosageAndFrequency: { morning: "", evening: "", night: "", unit: "tab" },
  applicableDays: [],                              // [] = throughout admission
  instructions: "",
  intake: MEDICINE_INTAKE_OPTIONS[1],               // After food default
  priority: MEDICINE_PRIORITY_OPTIONS[0],
  category: MEDICINE_CATEGORY_OPTIONS[0],
  rationale: "",
});
