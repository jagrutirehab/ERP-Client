//if patient is registered then disable the patient name, phone number, date of birth field disabled
const leadFields = (isRegister = false) => [
  {
    label: "Patient Name",
    name: "patientName",
    type: "text",
    disabled: isRegister,
  },
  {
    label: "Patient Phone Number",
    name: "patientPhoneNumber",
    type: "text",
    disabled: isRegister,
  },
  {
    label: "Patient Gender",
    name: "patientGender",
    type: "radio",
    options: ["MALE", "FEMALE", "OTHERS"],
    disabled: false,
  },
  {
    label: "Patient Age",
    name: "patientAge",
    type: "number",
    disabled: isRegister,
  },
  {
    label: "Attended By",
    name: "attendedBy",
    type: "text",
    disabled: false,
  },
  {
    label: "Location",
    name: "location",
    type: "checkbox",
    disabled: false,
  },
  {
    label: "Inquiry Details",
    name: "inquiry",
    type: "text",
    disabled: false,
  },
  {
    label: "Visitor Name",
    name: "visitorName",
    type: "text",
    disabled: false,
  },
  {
    label: "Relation With Patient",
    name: "relationWithPatient",
    type: "text",
    disabled: false,
  },
  {
    label: "Charges",
    name: "charges",
    type: "text",
    disabled: false,
  },
  {
    label: "Reffered By",
    name: "refferedBy",
    type: "text",
    disabled: false,
  },
  {
    label: "Comment",
    name: "comment",
    type: "text",
    disabled: false,
  },
  {
    label: "Inquiry Type",
    name: "inquiryType",
    type: "text",
    disabled: false,
  },
  {
    label: "Given Updates",
    name: "givenUpdates",
    type: "text",
    disabled: false,
  },
  // {
  //   label: "Follow Up",
  //   name: "followUp",
  //   type: "text",
  //   disabled: false,
  // },
];

export { leadFields };
