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
      color: "warning",
    },
    WEEK_OFFS: {
      text: "Week Off",
      color: "info",
    },
    FESTIVE_LEAVE: {
      text: "Festive Leave",
      color: "info",
    },
    PENDING: {
      text: "Pending",
      color: "warning",
    },
    PRESENT: {
      text: "Present",
      color: "success",
    },
    ABSENT: {
      text: "Absent",
      color: "danger",
    },
    REGULARIZED: {
      text: "Regularized",
      color: "success",
    },
    APPROVED: {
      text: "Approved",
      color: "success",
    },
    REJECTED: {
      text: "Rejected",
      color: "danger",
    },
    EARNED_LEAVE: {
      text: "Earned Leave",
      color: "info",
    },
    LEAVE_WTIHOUT_PAYS: {
      text: "Leave Without Pay",
      color: "info",
    },
    FULL_DAY: {
      text: "Full Day",
      color: "info",
    },
    HALF_DAY: {
      text: "HALF_DAY",
      color: "info",
    },
    FIRST_HALF: {
      text: "First Half",
      color: "success",
    },
    SECOND_HALF: {
      text: "Second Half",
      color: "success",
    },
    REJECTED_AND_ACTIVE_EMPLOYEE: {
      text: "Rejected & Active Employee",
      color: "danger",
    },
    NEW_JOINING_PENDING: {
      text: "New Joining Pending",
      color: "warning",
    },
    NEW_JOINING_APPROVED_USER_CREATED: {
      text: "New Joining Approved & User Created",
      color: "success",
    },
    NEW_JOINING_REJECTED: {
      text: "New Joining Rejected",
      color: "danger",
    },
    EXIT_EMPLOYEE_PENDING: {
      text: "Exit Employee Pending",
      color: "warning",
    },
    EXIT_EMPLOYEE_APPROVED_USER_SUSPENDED: {
      text: "Exit Employee Approved & User Suspended",
      color: "success",
    },
    EXIT_EMPLOYEE_REJECTED: {
      text: "Exit Employee Rejected",
      color: "danger",
    },
    CURRENT_LOCATION_PENDING: {
      text: "Current Location Pending",
      color: "warning",
    },
    CURRENT_LOCATION_REJECTED: {
      text: "Current Location Rejected",
      color: "danger",
    },
    TRANSFER_LOCATION_PENDING: {
      text: "Transfer Location Pending",
      color: "warning",
    },
    TRANSFER_LOCATION_APPROVED: {
      text: "Transfer Location Approved",
      color: "success",
    },
    TRANSFER_LOCATION_REJECTED: {
      text: "Transfer Location Rejected",
      color: "danger",
    },
    TRANSFER_EMPLOYEE_PENDING: {
      text: "Transfer Location Pending",
      color: "warning",
    },
    TRANSFER_EMPLOYEE_APPROVED_USER_UPDATED: {
      text: "Transfer Location Approved & User Updated",
      color: "success",
    },
    TRANSFER_EMPLOYEE_REJECTED: {
      text: "Transfer Location REJECTED",
      color: "success",
    },
    HOLD: {
      text: "Hold",
      color: "info",
    },
    CLOSED: {
      text: "Closed",
      color: "success",
    },
    NOT_STARTED_WORKING_YET: {
      text: "Not Started",
      color: "danger",
    },
    WIP: {
      text: "WIP",
      color: "warning",
    },
    LEAVE: {
      text: "Leave",
      color: "info",
    },
    REGULARIZATION: {
      text: "Regularization",
      color: "primary",
    },
    ADVANCE_SALARY: {
      text: "Advance Salary",
      color: "warning",
    },
    INCENTIVE: {
      text: "Incentive",
      color: "success",
    },
    NEW_JOINING: {
      text: "New Joining",
      color: "secondary",
    },
    EXIT_EMPLOYEE: {
      text: "Exit Employee",
      color: "danger",
    },
    TRANSFER_INCOMING: {
      text: "Transfer Incoming",
      color: "dark",
    },
    TRANSFER_OUTGOING: {
      text: "Transfer Outgoing",
      color: "dark",
    },
    EXIT_REQUEST: {
      text: "Exit Request",
      color: "danger",
    },
    FNF_CLOSURE: {
      text: "FNF Closure",
      color: "danger",
    },
    HIRING_REQUEST: {
      text: "Hiring Request",
      color: "primary",
    },
    TPM: {
      text: "TPM",
      color: "info",
    },
  };

  const config = map[stage];
  if (!config) return "-";

  return (
    <Badge color={config.color} style={badgeStyle}>
      {config.text}
    </Badge>
  );
};
