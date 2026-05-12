const toSelectOptions = (arr) => arr.map((v) => ({ value: v, label: v }));

export const VALUELESS_OPERATORS   = new Set(["EXISTS", "NOT_EXISTS"]);
export const TRIGGER_OPTIONS       = toSelectOptions(["IMMEDIATE", "DELAYED"]);
export const SEVERITY_OPTIONS      = toSelectOptions(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const ADMISSION_TYPE_OPTIONS = [
  { value: "ICD",  label: "ICD"  },
  { value: "OPD",  label: "OPD"  },
  { value: "BOTH", label: "Both" },
];
export const GENDER_OPTIONS = [
  { value: "Male",   label: "Male"   },
  { value: "Female", label: "Female" },
  { value: "Both",   label: "Both"   },
];
export const TARGET_OPTIONS = toSelectOptions([
  "Addmission", "Patient", "VitalSign", "Prescription",
  "DetailAdmission", "ciwaTest", "ramsaySedationTest",
  "morseTest", "glasgowTest", "LabReport",
]);
export const OPERATOR_OPTIONS = [
  "GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL",
  "EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS",
].map((op) => ({ value: op, label: op.replace(/_/g, " ") }));

export const OPERATORS_BY_TYPE = {
  Number:  ["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "EQUALS", "NOT_EQUALS"],
  Date:    ["GREATER_THAN", "LESS_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL", "EXISTS", "NOT_EXISTS"],
  Boolean: ["EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS"],
  Array:   ["EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS"],
  String:  ["EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS"],
};

export const BOOLEAN_OPTIONS = [
  { value: true,  label: "True"  },
  { value: false, label: "False" },
];

export const emptyConditionItem = () => ({
  model:       null,
  field:       "",
  operator:    { value: "EXISTS", label: "EXISTS" },
  triggerType: TRIGGER_OPTIONS[0],
  deadlineHours: "",
  value:       [],
});

export const emptyTargetBlock = () => ({
  id:            Date.now() + Math.random(),
  alertTemplate: "",
  conditions:    [emptyConditionItem()],
});

export const emptyForm = () => ({
  ruleName:         "",
  protocol:         "",
  severity:         SEVERITY_OPTIONS[1],
  admissionType:    null,
  isActive:         true,
  actionGuidance:   "",
  referenceSection: "",
});
export const BLOOD_GROUP_OPTIONS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
].map(v => ({ value: v, label: v }));