const pages = [
  {
    id: "recyclebin",
    label: "Recycle bin",
    name: "Recycle bin",
    link: "/recyclebin",
    icon: "ri-delete-bin-6-line",
  },
  {
    id: "nurse",
    label: "Nurse",
    name: "Nurse",
    link: "/nurse",
    icon: "bx bx-user",
  },
  {
    id: "emergency",
    label: "Emergency",
    name: "Emergency",
    link: "/emergency",
    icon: "bx bxs-error",
  },
  {
    id: "centralpayment",
    label: "Central Payment",
    name: "Central Payment",
    link: "/centralpayment",
    icon: "bx bx-wallet-alt",
  },
  {
    id: "incident",
    label: "Incident Reporting",
    name: "Incident Reporting",
    link: "/incident-reporting",
    icon: "bx bx-error",
    permissions: {
      create: true,
      edit: true,
      delete: true,
    },
  },
  {
    id: "cash",
    label: "Cash",
    name: "Cash",
    link: "/cash",
    icon: "bx bx-rupee",
    permissions: {
      create: true,
      edit: true,
      delete: true,
    },
    // children: [
    //   {
    //     name: "Reports",
    //     permissions: {
    //       create: true,
    //       edit: true,
    //       delete: true,
    //     },
    //   },
    //   {
    //     name: "Balance",
    //     permissions: {
    //       create: true,
    //       edit: true,
    //       delete: true,
    //     },
    //   },
    //   {
    //     name: "Deposits",
    //     permissions: {
    //       create: true,
    //       edit: true,
    //       delete: true,
    //     },
    //   },
    //   {
    //     name: "Spending",
    //     permissions: {
    //       create: true,
    //       edit: true,
    //       delete: true,
    //     },
    //   },
    // ],
  },
  {
    id: "users",
    label: "User",
    name: "User",
    link: "/user",
    icon: "bx bx-user",
    permissions: {
      create: true,
      edit: true,
      delete: true,
    },
  },
  {
    id: "intern",
    label: "Intern",
    name: "Intern",
    link: "/intern/*",
    icon: "bx bx-user",
    permissions: {
      create: true,
      edit: true,
      delete: true,
    },
    children: [
      {
        name: "Timeline",
        permissions: {
          create: true,
          edit: true,
          delete: true,
        },
      },
      {
        name: "Billing",
        permissions: {
          create: true,
          edit: true,
          delete: true,
        },
      },
      {
        name: "Forms",
        permissions: {
          create: true,
          edit: true,
          delete: true,
        },
      },
      {
        name: "Certificate",
        permissions: {
          create: true,
          edit: true,
          delete: true,
        },
      },
    ],
  },
  {
    id: "lead",
    label: "Lead",
    name: "Lead",
    link: "/lead",
    icon: "bx bx-user",
    permissions: {
      create: true,
      edit: true,
      delete: true,
    },
  },
  {
    id: "patient",
    label: "Patient",
    name: "Patient",
    link: "/patient/*",
    icon: "bx bx-user-plus",
    permissions: {
      create: true,
      edit: true,
      delete: true,
    },
    children: [
      {
        name: "Charting",
        permissions: {
          create: true,
          edit: true,
          delete: true,
        },
      },
      {
        name: "Billing",
        permissions: {
          create: true,
          edit: true,
          delete: true,
        },
      },
      {
        name: "Forms",
        permissions: {
          create: true,
          edit: true,
          delete: true,
        },
      },
      {
        name: "OPD",
        permissions: {
          create: true,
          edit: true,
          delete: true,
        },
      },
      {
        name: "Timeline",
      },
    ],
  },
  {
    id: "booking",
    label: "Booking",
    name: "Booking",
    link: "/booking",
    icon: "bx bx-calendar",
    permissions: {
      create: true,
      edit: true,
      delete: true,
    },
  },
  {
    id: "setting",
    label: "Setting",
    name: "Setting",
    link: "/setting",
    icon: "bx bxs-cog",
    permissions: {
      create: true,
      edit: true,
      delete: true,
    },
  },
  {
    id: "report",
    label: "Report",
    name: "Report",
    link: "/report",
    icon: "bx bxs-report",
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    name: "Pharmacy",
    link: "/pharmacy",
    icon: "bx bx-book",
  },
  {
    id: "guidelines",
    label: "Guidelines",
    name: "Guidelines",
    link: "/guidelines",
    icon: "bx bx-book-open",
  },
];

export const Pharmacy = [
  {
    id: "pharmacy-dashboard",
    label: "Dashboard",
    link: "/pharmacy/dashboard",
    icon: "bx bx-home",
  },
  {
    id: "pharmacymanagement",
    label: "Inventory",
    link: "/pharmacy/management",
    icon: "bx bx-building-house",
  },
  {
    id: "givenmedicines",
    label: "Medicine Given",
    link: "/pharmacy/given-med",
    icon: "bx bx-building-house",
  },
  {
    id: "approval",
    label: "Medicine Approval",
    link: "/pharmacy/approval",
    icon: "bx bx-checkbox-checked",
  },
  {
    id: "audit",
    label: "Audit",
    link: "/pharmacy/audit",
    icon: "bx bx-fingerprint",
  },
];

export const setting = [
  {
    id: "medicine",
    label: "Medicine",
    link: "/setting/medicine",
    icon: "bx bx-capsule",
  },
  {
    id: "billing",
    label: "Billing",
    link: "/setting/billing",
    icon: "bx bx-receipt",
  },
  {
    id: "calender",
    label: "Calender",
    link: "/setting/calender",
    icon: "bx bxs-calendar",
  },
  {
    id: "offer",
    label: "Offer Code",
    link: "/setting/offercode",
    icon: "bx bxs-offer",
  },
  {
    id: "taxmanagement",
    label: "Tax Management",
    link: "/setting/taxmanagement",
    icon: "bx bx-stats",
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    link: "/setting/rolesmanagment",
    icon: "bx bx-fingerprint",
  },
  {
    id: "therapies",
    label: "Therapies",
    link: "/setting/therapies",
    icon: "bx bx-heart",
  },
  {
    id: "conditions",
    label: "Conditions",
    link: "/setting/conditions",
    icon: "bx bx-health",
  },
  {
    id: "symptoms",
    label: "Symptoms",
    link: "/setting/symptoms",
    icon: "bx bx-health",
  },
];

export const recyclebin = [
  {
    id: "center",
    label: "Center",
    link: "/recyclebin/center",
    icon: "bx bx-buildings",
  },
  {
    id: "patient",
    label: "Patient",
    link: "/recyclebin/patient",
    icon: "bx bx-capsule",
  },
  {
    id: "chart",
    label: "Chart",
    link: "/recyclebin/chart",
    icon: "bx bx-capsule",
  },
  {
    id: "bill",
    label: "Bill",
    link: "/recyclebin/bill",
    icon: "bx bx-capsule",
  },
  {
    id: "lead",
    label: "Lead",
    link: "/recyclebin/lead",
    icon: "bx bx-capsule",
  },
  {
    id: "medicine",
    label: "Medicine",
    link: "/recyclebin/medicine",
    icon: "bx bx-capsule",
  },
  {
    id: "intern",
    label: "Intern",
    link: "/recyclebin/intern",
    icon: "bx bx-capsule",
  },
];

export default pages;
