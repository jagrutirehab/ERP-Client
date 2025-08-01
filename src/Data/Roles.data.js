export const permissionList = [
  {
    key: "CENTER",
    label: "Center",
    subModules: [
      { name: "CENTERLIST", label: "Center List", type: "LIST" },
      { name: "CREATECENTER", label: "Create Center", type: "CREATE" },
      { name: "EDITCENTER", label: "Edit Center", type: "EDIT" },
      { name: "DELETECENTER", label: "Delete Center", type: "DELETE" },
    ],
  },
  {
    key: "LEAD",
    label: "Lead",
    subModules: [
      { name: "LEADLIST", label: "Lead List", type: "LIST" },
      { name: "CREATELEAD", label: "Create Lead", type: "CREATE" },
      { name: "EDITLEAD", label: "Edit Lead", type: "EDIT" },
      { name: "DELETELEAD", label: "Delete Lead", type: "DELETE" },
    ],
  },
  {
    key: "BOOKING",
    label: "Booking",
    subModules: [
      { name: "BOOKINGLIST", label: "Booking List", type: "LIST" },
      { name: "CREATEBOOKING", label: "Create Booking", type: "CREATE" },
      { name: "EDITBOOKING", label: "Edit Booking", type: "EDIT" },
      { name: "DELETEBOOKING", label: "Delete Booking", type: "DELETE" },
      {
        name: "CREATEPRESCRIPTION",
        label: "Create Prescription",
        type: "CREATE",
      },
      { name: "EDITPRESCRIPTION", label: "Edit Prescription", type: "EDIT" },
      { name: "COLLECTPAYMENT", label: "Collect Payment", type: "CREATE" },
      { name: "VIEWINVOICE", label: "View Invoice", type: "LIST" },
    ],
  },
  {
    key: "INTERN",
    label: "Intern",
    subModules: [
      { name: "INTERNLIST", label: "Intern List", type: "LIST" },
      { name: "CREATEINTERN", label: "Create Intern", type: "CREATE" },
      { name: "EDITINTERN", label: "Edit Intern", type: "EDIT" },
      { name: "DELETEINTERN", label: "Delete Intern", type: "DELETE" },
      { name: "INTERNTIMELINE", label: "Intern Timeline", type: "LIST" },
      { name: "BILLLIST", label: "Intern Bill", type: "LIST" },
      { name: "CREATEBILL", label: "Create Bill", type: "CREATE" },
      { name: "EDITBILL", label: "Edit Bill", type: "EDIT" },
      { name: "DELETEBILL", label: "Delete Bill", type: "DELETE" },
    ],
  },
  {
    key: "PATIENTS",
    label: "Paitents",
    subModules: [
      { name: "PATIENTSLIST", label: "Paitents List", type: "LIST" },
      { name: "CREATEPATIENTS", label: "Create Paitents", type: "CREATE" },
      { name: "EDITPATIENTS", label: "Edit Paitents", type: "EDIT" },
      { name: "DELETEPATIENTS", label: "Delete Paitents", type: "DELETE" },
      { name: "PATIENTSTIMELINE", label: "Paitents Timeline", type: "LIST" },
      { name: "PATIENTSHISTORY", label: "Paitents History", type: "LIST" },
      { name: "BILLLIST", label: "Paitents Bill", type: "LIST" },
      { name: "CREATEBILL", label: "Create Bill", type: "CREATE" },
      { name: "EDITBILL", label: "Edit Bill", type: "EDIT" },
      { name: "DELETEBILL", label: "Delete Bill", type: "DELETE" },
      { name: "CHARTLIST", label: "Paitents Chart", type: "LIST" },
      { name: "CREATECHART", label: "Create Chart", type: "CREATE" },
      { name: "EDITCHART", label: "Edit Chart", type: "EDIT" },
      { name: "DELETECHART", label: "Delete Chart", type: "DELETE" },
    ],
  },
  {
    key: "USER",
    label: "User",
    subModules: [
      { name: "USERLIST", label: "User List", type: "LIST" },
      { name: "CREATEUSER", label: "Create User", type: "CREATE" },
      { name: "EDITUSER", label: "Edit User", type: "EDIT" },
      {
        name: "USERPASSWORDCHANGE",
        label: "User Password Change",
        type: "EDIT",
      },
      { name: "SUSPENDUSER", label: "Suspend User", type: "DELETE" },
      { name: "DELETEUSER", label: "Delete User", type: "DELETE" },
    ],
  },
  {
    key: "Settings",
    label: "Settings",
    subModules: [
      { name: "MEDICINELIST", label: "Medicine List", type: "LIST" },
      { name: "CREATEMEDICINE", label: "Create Medicine", type: "CREATE" },
      { name: "EDITMEDICINE", label: "Edit Medicine", type: "EDIT" },
      { name: "DELETEMEDICINE", label: "Delete Medicine", type: "DELETE" },
      { name: "INVOICELIST", label: "Invoice List", type: "LIST" },
      { name: "CREATEINVOICE", label: "Create Invoice", type: "CREATE" },
      { name: "EDITINVOICE", label: "Edit Invoice", type: "EDIT" },
      { name: "DELETEINVOICE", label: "Delete Invoice", type: "DELETE" },
      {
        name: "ADVANCEPAYMENTLIST",
        label: "Advanece Payment List",
        type: "LIST",
      },
      {
        name: "CREATEADVANCEPAYMENT",
        label: "Create Advanece Payment",
        type: "CREATE",
      },
      {
        name: "EDITADVANCEPAYMENT",
        label: "Edit Advanece Payment",
        type: "EDIT",
      },
      {
        name: "DELETEADVANCEPAYMENT",
        label: "Delete Advanece Payment",
        type: "DELETE",
      },
      { name: "CALENDERLIST", label: "Calender List", type: "LIST" },
      { name: "CREATECALENDER", label: "Create Calender", type: "CREATE" },
      { name: "EDITCALENDER", label: "Edit Calender", type: "EDIT" },
      { name: "DELETECALENDER", label: "Delete Calender", type: "DELETE" },
      { name: "OFFERCCODELIST", label: "Offer Code List", type: "LIST" },
      { name: "CREATEOFFERCCODE", label: "Create Offer Code", type: "CREATE" },
      { name: "EDITOFFERCCODE", label: "Edit Offer Code", type: "EDIT" },
      { name: "DELETEOFFERCCODE", label: "Delete Offer Code", type: "DELETE" },
      { name: "TAXMANAGEMENTLIST", label: "Tax Management List", type: "LIST" },
      {
        name: "CREATETAXMANAGEMENT",
        label: "Create Tax Management",
        type: "CREATE",
      },
      { name: "EDITTAXMANAGEMENT", label: "Edit Tax Management", type: "EDIT" },
      {
        name: "DELETETAXMANAGEMENT",
        label: "Delete Tax Management",
        type: "DELETE",
      },
      { name: "ROLESLIST", label: "Roles List", type: "LIST" },
      { name: "CREATEROLES", label: "Create Roles", type: "CREATE" },
      { name: "EDITROLES", label: "Edit Roles", type: "EDIT" },
      { name: "DELETEROLES", label: "Delete Roles", type: "DELETE" },
    ],
  },
  {
    key: "RECYCLEBEAN",
    label: "Recycle Bean",
    subModules: [
      { name: "CENTERLIST", label: "Center List", type: "LIST" },
      { name: "EDITCENTER", label: "Edit Center", type: "EDIT" },
      { name: "DELETECENTER", label: "Delete Center", type: "DELETE" },
      { name: "PATIENTSLIST", label: "Paitents List", type: "LIST" },
      { name: "EDITPATIENTS", label: "Edit Paitents", type: "EDIT" },
      { name: "DELETEPATIENTS", label: "Delete Paitents", type: "DELETE" },
      { name: "CHARTLIST", label: "Paitents Chart", type: "LIST" },
      { name: "EDITCHART", label: "Edit Chart", type: "EDIT" },
      { name: "DELETECHART", label: "Delete Chart", type: "DELETE" },
      { name: "BILLLIST", label: "Paitents Bill", type: "LIST" },
      { name: "EDITBILL", label: "Edit Bill", type: "EDIT" },
      { name: "DELETEBILL", label: "Delete Bill", type: "DELETE" },
      { name: "LEADLIST", label: "Lead List", type: "LIST" },
      { name: "EDITLEAD", label: "Edit Lead", type: "EDIT" },
      { name: "DELETELEAD", label: "Delete Lead", type: "DELETE" },
      { name: "MEDICINELIST", label: "Medicine List", type: "LIST" },
      { name: "EDITMEDICINE", label: "Edit Medicine", type: "EDIT" },
      { name: "DELETEMEDICINE", label: "Delete Medicine", type: "DELETE" },
      { name: "INTERNLIST", label: "Intern List", type: "LIST" },
      { name: "EDITINTERN", label: "Edit Intern", type: "EDIT" },
      { name: "DELETEINTERN", label: "Delete Intern", type: "DELETE" },
    ],
  },
  {
    key: "REPORT",
    label: "Report",
    subModules: [
      { name: "DASHBOARD", label: "Dashboard", type: "LIST" },
      { name: "Report", label: "Report", type: "LIST" },
      { name: "FINANCE", label: "Finance", type: "LIST" },
      { name: "PATIENTANALYTICS", label: "Patient Analytics", type: "LIST" },
      { name: "DBLOGS", label: "DB Logs", type: "LIST" },
      { name: "LEADANALYTICS", label: "Lead Analytics", type: "LIST" },
      { name: "OPDANALYTICS", label: "OPD Analytics", type: "LIST" },
    ],
  },
];

export const modulePermissionOptions = ["READ", "WRITE", "NONE"];
export const getSubmoduleOptions = (subType) => {
  switch (subType) {
    case "DELETE":
      return ["DELETE", "NONE"];
    case "LIST":
      return ["READ", "NONE"];
    case "CREATE":
    case "EDIT":
      return ["WRITE", "NONE"];
    default:
      return ["NONE"];
  }
};
