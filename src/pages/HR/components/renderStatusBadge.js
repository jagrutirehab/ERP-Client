import { Badge } from "reactstrap";

export const renderStatusBadge = (stage) => {
    if (!stage) return "-";

    const badgeStyle = {
        whiteSpace: "normal",
        display: "inline-block",
        lineHeight: "1.2",
        textAlign: "center",
    };

    const map = {
        EXIT_APPROVED: {
            text: "Exit Approved",
            color: "success",
        },
        EXIT_REJECTED: {
            text: "Exit Rejected",
            color: "danger",
        },
        EXIT_REJECTED_AND_ACTIVE_EMPLOYEE: {
            text: "Exit Rejected & Active Employee",
            color: "danger",
        },
        FNF_APPROVED: {
            text: "FNF Approved",
            color: "success",
        },
        FNF_REJECTED: {
            text: "FNF Rejected",
            color: "danger",
        },
        FNF_REJECTED_AND_ACTIVE_EMPLOYEE: {
            text: "FNF Rejected & Active Employee",
            color: "danger",
        },
        NONE: {
            text: "None",
            color: "warning"
        },
        PENDING: {
            text: "Pending",
            color: "warning"
        },
        APPROVED: {
            text: "Approved",
            color: "success"
        },
        REJECTED: {
            text: "Rejected",
            color: "danger"
        },
        REJECTED_AND_ACTIVE_EMPLOYEE: {
            text: "Rejected & Active Employee",
            color: "danger"
        },
        NEW_JOINING_PENDING: {
            text: "New Joining Pending",
            color: "warning"
        },
        NEW_JOINING_APPROVED_USER_CREATED: {
            text: "New Joining Approved & User Created",
            color: "success"
        },
        NEW_JOINING_REJECTED: {
            text: "New Joining Rejected",
            color: "danger"
        },
        EXIT_EMPLOYEE_PENDING: {
            text: "Exit Employee Pending",
            color: "warning"
        },
        EXIT_EMPLOYEE_APPROVED_USER_SUSPENDED: {
            text: "Exit Employee Approved & User Suspended",
            color: "success"
        },
        EXIT_EMPLOYEE_REJECTED: {
            text: "Exit Employee Rejected",
            color: "danger"
        }
    };

    const config = map[stage];
    if (!config) return "-";

    return <Badge color={config.color} style={badgeStyle}>{config.text}</Badge>;
};
