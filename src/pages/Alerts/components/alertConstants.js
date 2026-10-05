export const SEVERITY_COLOR = {
  LOW: "secondary",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "danger",
};

export const SEVERITY_HEX = {
  LOW: "#6c757d",
  MEDIUM: "#0dcaf0",
  HIGH: "#ffc107",
  CRITICAL: "#dc3545",
};

export const PHASE_META = {
  IMMEDIATE: { label: "Immediate", icon: "bx bx-bolt-circle", color: "info" },
  DELAYED:   { label: "Delayed",   icon: "bx bx-time-five",   color: "warning" },
};

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// What produced an alert. Absent on every alert written before the field
// existed, which means SOP_RULE — see alertUtils.isRuleSourced.
export const ALERT_SOURCE_META = {
  SOP_RULE: { label: "SOP Rule", color: "light", icon: "bx bx-list-check" },
  BASELINE_INVESTIGATION: {
    label: "Baseline Package",
    color: "primary",
    icon: "bx bx-test-tube",
  },
};
