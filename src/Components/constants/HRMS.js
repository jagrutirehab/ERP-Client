export const SHIFT_CONFIG = Object.freeze({
    DAY: {
        value: "DAY",
        label: "Day Shift",
        color: "success",
    },
    NIGHT: {
        value: "NIGHT",
        label: "Night Shift",
        color: "dark",
    },
});

export const allViewPermissionRoles = ["HR", "MANAGER", "SUPERADMIN", "New_limited"];

export const leaveTypes = [
    "EARNED_LEAVE",
    "FESTIVE_LEAVE",
    "WEEK_OFFS",
    "LEAVE_WTIHOUT_PAYS",
];

export const leaveTypeOptions = [
    { value: "EARNED_LEAVE", label: "Earned Leave" },
    { value: "WEEK_OFFS", label: "Week Off" },
    { value: "FESTIVE_LEAVE", label: "Festive Leave" },
    { value: "LEAVE_WTIHOUT_PAYS", label: "Unpaid Leave" },
];

export const statusTitleMap = {
    PRESENT: "Present",
    ABSENT: "Absent",
    PENDING: "Pending",
    HOLIDAY: "Holiday",

    WEEK_OFFS: "Week Off",

    EARNED_LEAVE: "Earned Leave",
    FESTIVE_LEAVE: "Festive Leave",

    LEAVE_WTIHOUT_PAYS: "Leave Without Pay",

    HALF_DAY: "Half Day",
};

export const shiftTimeOptions = [
    { value: "FULL_DAY", label: "Full Day" },
    { value: "FIRST_HALF", label: "First Half" },
    { value: "SECOND_HALF", label: "Second Half" },
];

export const SHIFT_STYLES = {
  NORMAL: { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  MORNING: { bg: "#fffde7", text: "#e65100", border: "#ffe082" },
  AFTERNOON: { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
  NIGHT: { bg: "#f3e5f5", text: "#6a1b9a", border: "#ce93d8" },
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];



