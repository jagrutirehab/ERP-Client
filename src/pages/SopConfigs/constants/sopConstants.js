const toSelectOptions = (arr) => arr.map((v) => ({ value: v, label: v }));

export const VALUELESS_OPERATORS = new Set(["EXISTS", "NOT_EXISTS"]);

export const TRIGGER_OPTIONS = toSelectOptions(["IMMEDIATE", "DELAYED"]);
export const SEVERITY_OPTIONS = toSelectOptions(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const TARGET_OPTIONS = toSelectOptions([
  "Addmission", "Patient", "VitalSign",
  "Prescription", "Employee", "Bill", "Appointment",
]);
export const OPERATOR_OPTIONS = [
  "GREATER_THAN", "LESS_THAN", "EQUALS",
  "NOT_EQUALS", "EXISTS", "NOT_EXISTS",
].map((op) => ({ value: op, label: op.replace(/_/g, " ") }));

export const emptyCondition = () => ({
  field: "",
  operator: { value: "EXISTS", label: "EXISTS" },
  value: "",
});

export const emptyForm = () => ({
  ruleName: "",
  protocol: "",
  triggerType: TRIGGER_OPTIONS[0],
  targetModel: null,
  deadlineHours: "",
  severity: SEVERITY_OPTIONS[1],
  alertTemplate: "",
  isActive: true,
  notifyEmails: "",
});