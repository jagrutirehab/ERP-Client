import authRoles from "./authRoles";

const userFields = [
  {
    label: "Name",
    name: "name",
    type: "text",
  },
  {
    label: "Email",
    name: "email",
    type: "email",
  },
  {
    label: "Role",
    name: "role",
    type: "select",
    options: authRoles,
  },
  {
    label: "Center Access",
    name: "centerAccess",
    type: "checkbox",
    options: [],
  },
];

//tabs
export const GENERAL_INFORMATION = "GENERAL_INFORMATION";
export const ATTENDENCE = "ATTENDENCE";
export const LEAVE_INFORMATION = "LEAVE_INFORMATION";
export const JOINING_DETAILS = "JOINING_DETAILS";
export const EXIT_FORMALITIES = "EXIT_FORMALITIES";
