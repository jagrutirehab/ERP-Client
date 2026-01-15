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


