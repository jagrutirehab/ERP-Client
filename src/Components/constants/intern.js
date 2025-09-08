export const GENERAL = "GENERAL";
export const BILLING_VIEW = "BILLING";
export const TIMELINE_VIEW = "TIMELINE";
export const FORMS_VIEW = "FORMS";
export const CERTIFICATE_VIEW="CERTIFICATE";
const RECEIPT = "RECEIPT";
const DEPOSIT = "DEPOSIT";
export const DRAFT_INVOICE = "DRAFT_INVOICE";
const REFUND = "REFUND";
export const ADD_INTERN = "ADDINTERN";
export const CASH = "CASH";
export const CARD = "CARD";
export const CHEQUE = "CHEQUE";
export const BANK = "BANK";
export const UPI = "UPI";
const INTERN_ADMISSION = "INTERN_ADMISSION";
const EDIT_INTERN_ADMISSION = "EDIT_INTERN_ADMISSION";
export const INTERN = "INTERN";
export const ALL_INTERNS = "ALL_INTERNS";

let addInternFields = [
  { label: "Name", name: "name", type: "text", required: true },
  { label: "Date of Birth", name: "dateOfBirth", type: "date", required: true },
  {
    label: "Contact Number",
    name: "contactNumber",
    type: "phoneNumber",
    required: true,
  },
  {
    label: "Email Address",
    name: "emailAddress",
    type: "email",
    required: true,
  },
  {
    label: "Gender",
    name: "gender",
    type: "radio",
    options: ["MALE", "FEMALE", "OTHERS"],
    required: true,
  },
  { label: "Street", name: "street", type: "text" },
  { label: "City", name: "city", type: "text" },
  { label: "State", name: "state", type: "text" },
  { label: "Country", name: "country", type: "text" },
  { label: "Postal Code", name: "postalCode", type: "text" },
  {
    label: "Educational Institution",
    name: "educationalInstitution",
    type: "text",
    required: true,
  },
  {
    label: "Course/Program",
    name: "courseProgram",
    type: "text",
    required: true,
  },
  {
    label: "Year of Study",
    name: "yearOfStudy",
    type: "number",
    required: true,
  },
  {
    label: "Internship Duration",
    name: "internshipDuration",
    type: "text",
    required: true,
  },
  {
    label: "Emergency Contact Name",
    name: "emergencyContactName",
    type: "text",
    required: true,
  },
  {
    label: "Emergency Contact Phone",
    name: "emergencyContactPhoneNumber",
    type: "phoneNumber",
    required: true,
  },
  {
    label: "Emergency Contact Email",
    name: "emergencyContactEmail",
    type: "email",
  },
];

export {
  addInternFields,
  RECEIPT,
  DEPOSIT,
  REFUND,
  EDIT_INTERN_ADMISSION,
  INTERN_ADMISSION,
};
