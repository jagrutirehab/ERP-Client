export const permissionList = [
  {
    key: "CENTER",
    label: "Center",
    subModules: [],
  },
  {
    key: "NURSE",
    label: "Nurse",
    subModules: [],
  },
  {
    key: "EMERGENCY",
    label: "Emergency",
    subModules: [],
  },
  {
    key: "LEAD",
    label: "Lead",
    subModules: [],
  },
  {
    key: "BOOKING",
    label: "Booking",
    subModules: [
      {
        name: "PRESCRIPTION",
        label: "Prescription",
      },
      { name: "PAYMENT", label: "Payment" },
    ],
  },
  {
    key: "INTERN",
    label: "Intern",
    subModules: [
      { name: "INTERNTIMELINE", label: "Intern Timeline" },
      { name: "INTERNBILLING", label: "Intern Bill" },
      { name: "INTERNCERTIFICATE", label: "Intern Certificate" },
    ],
  },
  {
    key: "PATIENTS",
    label: "Paitents",
    subModules: [
      { name: "PATIENTSTIMELINE", label: "Paitents Timeline" },
      { name: "PATIENTSHISTORY", label: "Paitents History" },
      { name: "PATIENTSBILLING", label: "Paitents Bill" },
      { name: "PATIENTCHARTS", label: "Paitents Chart" },
    ],
  },
  {
    key: "USER",
    label: "User",
    subModules: [
      {
        name: "USERPASSWORDCHANGE",
        label: "User Password Change",
      },
      { name: "SUSPENDUSER", label: "Suspend User" },
    ],
  },
  {
    key: "CASH",
    label: "Cash",
    subModules: [
      { name: "CASHREPORTS", label: "Cash Reports" },
      { name: "CASHBALANCE", label: "Cash Base Balance" },
      { name: "CASHDEPOSITS", label: "Cash Deposits" },
      { name: "CASHSPENDING", label: "Cash Spending" },
      { name: "CASHINFLOW", label: "Cash Inflow" },
    ],
  },
  {
    key: "CENTRALPAYMENT",
    label: "Central Payment",
    subModules: [
      { name: "CENTRALPAYMENTSPENDING", label: "Expense" },
      { name: "CENTRALPAYMENTAPPROVAL", label: "Approval Dashboard" },
      {
        name: "CENTRALPAYMENTPROCESSING",
        label: "Payment Processing Dashboard",
      },
      { name: "CENTRALPAYMENTREPORTS", label: "Reports" },
    ],
  },
  {
    key: "SETTING",
    label: "Setting",
    subModules: [
      { name: "MEDICINESETTING", label: "Medicine" },
      { name: "INVOICESETTING", label: "Invoice" },
      {
        name: "ADVANCEPAYMENTSETTING",
        label: "Advanece Payment",
      },
      { name: "CALENDERSETTING", label: "Calender" },
      { name: "OFFERCODESETTING", label: "Offer Code" },
      { name: "TAXMANAGEMENTSETTING", label: "Tax Management" },
      { name: "ROLESSETTING", label: "Roles" },
      { name: "THERAPIESSETTING", label: "Therapies" },
      { name: "CONDITIONSSETTING", label: "Conditions" },
      { name: "SYMPTOMSETTING", label: "Symptoms" },
    ],
  },
  {
    key: "RECYCLEBIN",
    label: "Recycle Bin",
    subModules: [
      { name: "CENTERLIST", label: "Center List" },
      { name: "PATIENTSLIST", label: "Paitents List" },
      { name: "CHARTLIST", label: "Paitents Chart" },
      { name: "BILLLIST", label: "Paitents Bill" },
      { name: "LEADLIST", label: "Lead List" },
      { name: "MEDICINELIST", label: "Medicine List" },
      { name: "INTERNLIST", label: "Intern List" },
    ],
  },
  {
    key: "REPORT",
    label: "Report",
    subModules: [
      { name: "DASHBOARD", label: "Dashboard" },
      { name: "Report", label: "Report" },
      { name: "FINANCE", label: "Finance" },
      { name: "PATIENTANALYTICS", label: "Patient Analytics" },
      { name: "DOCTORANALYTICS", label: "Doctor Analytics" },
      { name: "DBLOGS", label: "DB Logs" },
      { name: "LEADANALYTICS", label: "Lead Analytics" },
      { name: "OPDANALYTICS", label: "OPD Analytics" },
    ],
  },
  {
    key: "PHARMACY",
    label: "Pharmacy",
    subModules: [
      { name: "DASHBOARD", label: "Dashboard" },
      { name: "PHARMACYMANAGEMENT", label: "Pharmacy Management" },
      { name: "GIVENMEDICINES", label: "Given Medicine" },
      { name: "MEDICINEAPPROVAL", label: "Medicine Approval" },
      { name: "AUDIT", label: "Audit" },
    ],
  },
  {
    key: "GUIDELINES",
    label: "Guidelines",
    subModules: [
      { name: "GUIDELINESMANAGEMENT", label: "Guidelines Management" },
    ],
  },
  {
    key: "INCIDENT_REPORTING",
    label: "Incident Reporting",
    subModules: [
      { name: "RAISE_INCIDENT", label: "Raise Incident" },
      { name: "INVESTIGATE_INCIDENT", label: "Investigate Incident" },
      { name: "APPROVE_INCIDENT", label: "Approve Incident" },
      { name: "CLOSE_INCIDENT", label: "Close Incident" },
    ],
  },
  {
    key: "ROUND_NOTES",
    label: "Round Notes",
    subModules: [
      // { name: "VIEW_ROUND_NOTES", label: "View Round Notes" },
      // { name: "CREATE_ROUND_NOTES", label: "Create Round Notes" },
      // { name: "UPDATE_ROUND_NOTES", label: "Update Round Notes" },
      // { name: "DELETE_ROUND_NOTES", label: "Delete Round Notes" },
    ],
  },
  {
    key: "HUBSPOT_REPORTING",
    label: "Hubspot Reporting",
    subModules: [
      { name: "VIEW_HUBSPOT_REPORTING", label: "View Hubspot Reporting" },
      { name: "HUBSPOT_CENTER_LEADS_COUNT", label: "Center Leads Count" },
      { name: "HUBSPOT_OWNER_LEADS_COUNT", label: "Owner Leads Count" },
      {
        name: "HUBSPOT_CITY_QUALITY_BREAKDOWN",
        label: "City Quality Breakdown",
      },
      {
        name: "HUBSPOT_OWNER_QUALITY_BREAKDOWN",
        label: "Owner Quality Breakdown",
      },
      { name: "HUBSPOT_CITY_VISIT_DATE", label: "City Visit Date" },
      { name: "HUBSPOT_OWNER_VISIT_DATE", label: "Owner Visit Date" },
      { name: "HUBSPOT_CITY_VISITED_DATE", label: "City Visited Date" },
      { name: "HUBSPOT_OWNER_VISITED_DATE", label: "Owner Visited Date" },
      { name: "HUBSPOT_CITY_LEAD_STATUS", label: "City Lead Status" },
      { name: "HUBSPOT_OWNER_LEAD_STATUS", label: "Owner Lead Status" },
    ],
  },
  {
    key: "HR",
    label: "HR",
    subModules: [
      // master employee
      { name: "MASTER_EMPLOYEE", label: "Master Employee" },
      // new joining
      { name: "NEW_JOINING_ADD_REQUEST", label: "New Joinings Add Request" },
      { name: "NEW_JOINING_APPROVAL", label: "New Joinings Approval" },
      { name: "NEW_JOINING_IT", label: "New Joinings IT" },
      // exit employee
      {
        name: "EXIT_EMPLOYEE_ADD_REQUEST",
        label: "Exit Employees Add Request",
      },
      { name: "EXIT_EMPLOYEE_APPROVAL", label: "Exit Employees Approval" },
      { name: "EXIT_EMPLOYEE_FNF", label: "Exit Employees FNF" },
      { name: "EXIT_EMPLOYEE_IT", label: "Exit Employees IT" },
      // salary advance
      {
        name: "SALARY_ADVANCE_ADD_REQUEST",
        label: "Salary Advance Add Request",
      },
      { name: "SALARY_ADVANCE_APPROVAL", label: "Salary Advance Approval" },
      // transfer employee
      {
        name: "TRANSFER_EMPLOYEE_ADD_REQUEST",
        label: "Employee Transfer Add Request",
      },
      {
        name: "TRANSFER_EMPLOYEE_APPROVAL",
        label: "Employee Transfer Approvals",
      },
      {
        name: "TRANSFER_EMPLOYEE_CURRENT_LOCATION_APPROVAL",
        label: "Outgoing Employee Transfer Approvals",
      },
      {
        name: "TRANSFER_EMPLOYEE_TRANSFER_LOCATION_APPROVAL",
        label: "Incoming Employee Transfer Approvals",
      },
      {
        name: "TRANSFER_EMPLOYEE_IT",
        label: "Employee Transfer IT",
      },
      // hiring
      {
        name: "HIRING_ADD_REQUEST",
        label: "Hiring Add Request",
      },
      {
        name: "HIRING_APPROVAL",
        label: "Hiring Approvals",
      },
      // TPM-Third Party Manpower
      {
        name: "THIRD_PARTY_MANPOWER_ADD_REQUEST",
        label: "Third Party Manpower Add Request",
      },
      {
        name: "THIRD_PARTY_MANPOWER_APPROVAL",
        label: "Third Party Manpower Approvals",
      },
    ],
  },
  {
    key: "HRMS",
    label: "HRMS",
    subModules: [{ name: "HRMS_ATTENDANCE", label: "Attendance Management" }],
  },
  {
    key: "WEBCAMSTATS",
    label: "Web Cam Stats",
    subModules: [
      { name: "DASHBOARD", label: "Dashboard" },
      { name: "STATS", label: "Stats" },
      { name: "APIKEYS", label: "Apikeys" },
    ],
  },
];

export const modulePermissionOptions = ["READ", "WRITE", "DELETE", "NONE"];

export const getFilteredSubmoduleOptions = (moduleType) => {
  switch (moduleType) {
    case "READ":
      return ["READ", "NONE"];
    case "WRITE":
      return ["READ", "WRITE", "NONE"];
    case "DELETE":
      return ["READ", "WRITE", "DELETE", "NONE"];
    default:
      return ["NONE"];
  }
};
