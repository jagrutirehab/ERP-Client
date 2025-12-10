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
        USER_CREATED: {
            text: "User Created",
            color: "success"
        },
        EXIT_EMPLOYEE_PENDING: {
            text: "Exit Employee Pending",
            color: "warning"
        },
        USER_SUSPENDED: {
            text: "User Suspended",
            color: "danger"
        }

    };

    const config = map[stage];
    if (!config) return "-";

    return <Badge color={config.color} style={badgeStyle}>{config.text}</Badge>;
};
