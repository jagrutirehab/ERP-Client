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
