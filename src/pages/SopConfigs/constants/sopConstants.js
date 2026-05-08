const toSelectOptions = (arr) => arr.map((v) => ({ value: v, label: v }));

export const VALUELESS_OPERATORS = new Set(["EXISTS", "NOT_EXISTS"]);

export const TRIGGER_OPTIONS = toSelectOptions(["IMMEDIATE", "DELAYED"]);
export const SEVERITY_OPTIONS = toSelectOptions(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const TARGET_OPTIONS = toSelectOptions([
  "Addmission", "Patient", "VitalSign",
  "Prescription", "DetailAdmission", "ciwaTest",
  "ramsaySedationTest", "morseTest", "glasgowTest", "LabReport",
]);
export const OPERATOR_OPTIONS = [
  "GREATER_THAN", "LESS_THAN",
  "GREATER_THAN_OR_EQUAL", "LESS_THAN_OR_EQUAL",
  "EQUALS", "NOT_EQUALS",
  "EXISTS", "NOT_EXISTS",
].map((op) => ({ value: op, label: op.replace(/_/g, " ") }));

export const emptyCondition = () => ({
  field: "",
  operator: { value: "EXISTS", label: "EXISTS" },
  value: "",
});

export const emptyTargetBlock = () => ({
  id: Date.now() + Math.random(),
  model: null,
  triggerType: TRIGGER_OPTIONS[0],
  deadlineHours: "",
  conditions: [emptyCondition()],
});

export const emptyForm = () => ({
  ruleName: "",
  protocol: "",
  severity: SEVERITY_OPTIONS[1],
  alertTemplate: "",
  isActive: true,
  actionGuidance: "",
  referenceSection: "",
});