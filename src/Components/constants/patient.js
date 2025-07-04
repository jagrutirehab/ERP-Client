const CHARTING_VIEW = "CHARTING";
const BILLING_VIEW = "BILLING";
const TIMELINE_VIEW = "TIMELINE";
const OPD_VIEW = "OPD";
//Charts
const PRESCRIPTION = "PRESCRIPTION";
const VITAL_SIGN = "VITAL_SIGN";
const CLINICAL_NOTE = "CLINICAL_NOTE";
const LAB_REPORT = "LAB_REPORT";
const PROCEDURE = "PROCEDURE";
const RELATIVE_VISIT = "RELATIVE_VISIT";
const DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY";
const DETAIL_ADMISSION = "DETAIL_ADMISSION";
//Chart Bill Types
const OPD = "OPD";
const IPD = "IPD";
const CLINIC_TEST = "CLINICTEST";
export const GENERAL = "GENERAL";
//Admit Discharge
const ADMIT_PATIENT = "ADMIT_PATIENT";
const DISCHARGE_PATIENT = "DISCHARGE_PATIENT";
const EDIT_ADMISSION = "EDIT_ADMISSION";

//Bills
const ADVANCE_PAYMENT = "ADVANCE_PAYMENT";
const INVOICE = "INVOICE";
const DEPOSIT = "DEPOSIT";
export const DRAFT_INVOICE = "DRAFT_INVOICE";
const REFUND = "REFUND";
//Advance payment
const CASH = "CASH";
const CARD = "CARD";
const CHEQUE = "CHEQUE";
const BANK = "BANK";
//OPD Receipt
const UPI = "UPI";
//Genders
// const MALE = "MALE";
// const FEMALE = "FEMALE";
// const OTHERS = "OTHERS";

//Intern

const INTERN = "INTERN";

const records = [
  {
    name: "Doctors Prescription",
    category: PRESCRIPTION,
  },
  {
    name: "Vital Signs",
    category: VITAL_SIGN,
  },
  {
    name: "Clinical Notes",
    category: CLINICAL_NOTE,
  },
  {
    name: "Lab Reports",
    category: LAB_REPORT,
  },
  {
    name: "Relative Visit",
    category: RELATIVE_VISIT,
  },
  {
    name: "Discharge Summary",
    category: DISCHARGE_SUMMARY,
  },
  {
    name: "Detail History",
    category: DETAIL_ADMISSION,
  },
];

const testRecord = [
  // { name : "ROR" },
  // { name : "NIMHAS" },
  { name : "YMRS" },
  { name: "CIWA-AR" },
  { name: "C-SSRS" },
];

const prescriptionFormFields = [
  {
    label: "Dr Notes",
    name: "drNotes",
    type: "textarea",
  },
  {
    label: "Diagnosis",
    name: "diagnosis",
    type: "textarea",
  },
  {
    label: "Notes",
    name: "notes",
    type: "textarea",
  },
  {
    label: "Investigation Plan",
    name: "investigationPlan",
    type: "textarea",
  },
  {
    label: "Complaints",
    name: "complaints",
    type: "textarea",
  },
  {
    label: "Observation",
    name: "observation",
    type: "textarea",
  },
];

const vitalSignFields = [
  {
    label: "Weight",
    name: "weight",
    type: "text",
  },
  {
    label: "Blood Pressure (mm Hg)",
    fields: [
      {
        label: "Systolic",
        name: "systolic",
        type: "text",
      },
      {
        label: "Diastolic",
        name: "diastolic",
        type: "text",
      },
    ],
  },
  {
    label: "Pulse",
    name: "pulse",
    type: "text",
  },
  {
    label: "Temprature (°F)",
    name: "temprature",
    type: "text",
  },
  {
    label: "Respiration Rate (Breaths/min)",
    name: "respirationRate",
    type: "text",
  },
];

const clinicalNoteFields = [
  {
    label: "Complaints",
    name: "complaints",
    type: "textarea",
  },
  {
    label: "Observations",
    name: "observations",
    type: "textarea",
  },
  {
    label: "Diagnosis",
    name: "diagnosis",
    type: "textarea",
  },
  {
    label: "Notes",
    name: "notes",
    type: "textarea",
  },
];

const relativeVisitFields = [
  {
    label: "NAK info",
    name: "nakInfo",
    type: "textarea",
  },
  ...clinicalNoteFields,
];

const dischargeSummaryFields = [
  {
    label: "Diagnosis",
    name: "diagnosis",
    type: "textarea",
    xs: 12,
    md: 6,
  },
  {
    label: "Presenting Symptoms",
    name: "presentingSymptoms",
    type: "textarea",
    xs: 12,
    md: 6,
  },
  {
    label: "Mse at addmission",
    name: "mseAddmission",
    fields: [
      {
        label: "Appearance and Behavior",
        name: "appearance",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "ECC / Rapport",
        name: "ecc",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Speech",
        name: "speech",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Mood",
        name: "mood",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Affect",
        name: "affect",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Thoughts",
        name: "thoughts",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Perception",
        name: "perception",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Memory",
        name: "memory",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Abstract Thinking",
        name: "abstractThinking",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Social Judgment",
        name: "socialJudgment",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Insight",
        name: "insight",
        type: "text",
        xs: 6,
        md: 3,
      },
    ],
  },
  {
    label: "Past History",
    name: "pastHistory",
    type: "textarea",
    xs: 12,
    md: 4,
  },
  {
    label: "Medical History",
    name: "medicalHistory",
    type: "textarea",
    xs: 12,
    md: 4,
  },
  {
    label: "Family History",
    name: "familyHistory",
    type: "textarea",
    xs: 12,
    md: 4,
  },
  {
    label: "Personal History",
    name: "personalHistory",
    fields: [
      {
        label: "Smoking",
        name: "smoking",
        type: "text",
        xs: 6,
        md: 4,
      },
      {
        label: "Chewing Tobacco",
        name: "chewingTobacco",
        type: "text",
        xs: 6,
        md: 4,
      },
      {
        label: "Alcohol",
        name: "alcohol",
        type: "text",
        xs: 6,
        md: 4,
      },
    ],
  },
  {
    label: "Physical Examination",
    name: "physicalExamination",
    fields: [
      {
        label: "Temprature",
        name: "temprature",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Pulse",
        name: "pulse",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "B.P",
        name: "bp",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "CVS",
        name: "cvs",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "RS",
        name: "rs",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Abdomen",
        name: "abdomen",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "CNS",
        name: "cns",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Others",
        name: "others",
        type: "text",
        xs: 6,
        md: 3,
      },
    ],
  },
  {
    label: "Investigation (all reports attached with Discharge Card)",
    name: "investigation",
    type: "textarea",
    xs: 12,
    md: 6,
  },
  {
    label: "DISCUSSION / WARD MANAGMENT",
    name: "discussion",
    type: "textarea",
    xs: 12,
    md: 6,
  },
  {
    label: "Refernces",
    name: "refernces",
    type: "text",
    xs: 12,
    md: 6,
  },
  {
    label: "Modified ECT's / Ketamine / Other Treatment",
    name: "modifiedTreatment",
    type: "text",
    xs: 12,
    md: 6,
  },
  {
    label: "LA / Deport Administered",
    name: "deportAdministered",
    type: "textarea",
    xs: 12,
    md: 6,
  },
  {
    label: "PATIENT CONDITION / STATUS AT THE TIME OF DISCHARGE",
    name: "patientStatus",
    type: "textarea",
    xs: 12,
    md: 6,
  },
  {
    label: "Mse at discharge",
    name: "mseDischarge",
    fields: [
      {
        label: "Appearance and Behavior",
        name: "appearance",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "ECC / Rapport",
        name: "ecc",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Speech",
        name: "speech",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Mood",
        name: "mood",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Affect",
        name: "affect",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Thoughts",
        name: "thoughts",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Perception",
        name: "perception",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Memory",
        name: "memory",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Abstract Thinking",
        name: "abstractThinking",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Social Judgment",
        name: "socialJudgment",
        type: "text",
        xs: 6,
        md: 3,
      },
      {
        label: "Insight",
        name: "insight",
        type: "text",
        xs: 6,
        md: 3,
      },
    ],
  },
  {
    label: "Follow up",
    name: "followUp",
    type: "textarea",
    xs: 12,
    md: 6,
  },
  {
    label: "Note",
    name: "note",
    type: "textarea",
    xs: 12,
    md: 6,
  },
  {
    label: "Consultant Name",
    name: "consultantName",
    type: "text",
    xs: 12,
    md: 6,
  },
  {
    label: "MO/SMO/CMO/Consultant",
    name: "consultantSignature",
    type: "text",
    xs: 12,
    md: 6,
  },
  {
    label: "Consultant Psychologist",
    name: "consultantPsychologist",
    type: "text",
    xs: 12,
    md: 6,
  },
  {
    label: "Discharge Summary Prepared By",
    name: "summaryPreparedBy",
    type: "text",
    xs: 12,
    md: 6,
  },
  {
    label: "Type of Discharge",
    name: "dischargeType",
    type: "text",
    xs: 12,
    md: 6,
  },
  {
    label: "Discharge Routine",
    name: "dischargeRoutine",
    type: "text",
    xs: 12,
    md: 6,
  },
  {
    label: "Date of discharge",
    name: "dischargeDate",
    type: "date",
    xs: 12,
    md: 6,
  },
];

let addPatientFields = [
  {
    label: "Aadhaar Card Number",
    name: "aadhaarCardNumber",
    type: "text",
  },
  {
    label: "Aadhaar Card",
    name: "aadhaarCard",
    type: "file",
    accept: "image/*",
  },
  {
    label: "Name",
    name: "name",
    type: "text",
  },
  {
    label: "Phone Number",
    name: "phoneNumber",
    type: "number",
  },
  {
    label: "Email",
    name: "email",
    type: "email",
  },
  {
    label: "Date of Birth",
    name: "dateOfBirth",
    type: "date",
  },
  {
    label: "Gender",
    name: "gender",
    type: "radio",
    options: ["MALE", "FEMALE", "OTHERS"],
  },
  {
    label: "Address",
    name: "address",
    type: "text",
  },
  // {
  //   label: "Provisional Diagnosis",
  //   name: "provisionalDiagnosis",
  //   type: "text",
  // },
  // {
  //   label: "Doctor",
  //   name: "doctor",
  //   type: "select",
  // },
  // {
  //   label: "Psychologist",
  //   name: "psychologist",
  //   type: "select",
  // },
];

const patientGuradianFields = [
  {
    label: "Guardian Name",
    name: "guardianName",
    type: "text",
  },
  {
    label: "Relation",
    name: "guardianRelation",
    type: "text",
  },
  {
    label: "Phone Number",
    name: "guardianPhoneNumber",
    type: "text",
  },
  // {
  //   label: "Date Of Addmission",
  //   name: "dateOfAddmission",
  //   type: "date",
  // },
  {
    label: "Referred By",
    name: "referredBy",
    type: "text",
  },
  {
    label: "IPD File Number",
    name: "ipdFileNumber",
    type: "text",
  },
];

//PATIENT TYPES
const ALL_PATIENTS = "ALL_PATIENTS";
const ADMIT_PATIENTS = "ADMIT_PATIENTS";
const DISCHARGE_PATIENTS = "DISCHARGE_PATIENTS";
const OPD_PATIENTS = "OPD_PATIENTS";
export const MY_PATIENTS = "MY_PATIENTS";

//PATIENT LOG
const CREATED = "CREATED";
const ADMITTED = "ADMITTED";
const DISCHARGED = "DISCHARGED";
const DELETED = "DELETED";
const RESTORED = "RESTORED";
const SWITCHED_CENTER = "SWITCHED_CENTER";

const timelineFilters = [
  // {
  //   label: "All",
  //   name: "ALL",
  // },
  {
    label: "Basic",
    name: "PATIENT",
  },
  {
    label: "Status",
    name: "PATIENT_STATUS",
  },
  {
    label: "Chart",
    name: "PATIENT_CHART",
  },
  {
    label: "Bill",
    name: "PATIENT_BILL",
  },
  {
    label: "Clinicacl_test",
    name: "PATIENT_CLINICAL_TEST",
  },
];

const InternTimelineFilter = [
  {
    label: "Basic",
    name: "INTERN",
  },
  {
    label: "Intern",
    name: "UPDATED_INTERN_FORM",
  },
  {
    label: "delete_Intern",
    name: "DELETE_INTERN",
  },
  {
    label: "InternReceipt",
    name: "INTERN_RECEIPT",
  }
];

const categoryUnitOptions = {
  "2d echo charges": [{ label: "Nos", value: "nos" }],
  "ac charges": [
    { label: "Days", value: "days" },
    { label: "Month", value: "month" },
  ],
  "airbed charges": [{ label: "Nos", value: "nos" }],
  "ambulance charges": [{ label: "Nos", value: "nos" }],
  "attendant/care taker charges": [
    { label: "Days", value: "days" },
    { label: "Month", value: "month" },
  ],
  "bio medical waste charges": [{ label: "Nos", value: "nos" }],
  "bsl charges": [{ label: "Nos", value: "nos" }],
  "ct scan": [{ label: "Nos", value: "nos" }],
  "diaper charges": [
    { label: "Nos", value: "nos" },
    { label: "Pkt", value: "pkt" },
  ],
  "medical consumables": [{ label: "Nos", value: "nos" }],
  "discharge medicines": [
    { label: "Nos", value: "nos" },
    { label: "Strips", value: "strips" },
  ],
  "doctor consultation charges": [{ label: "Nos", value: "nos" }],
  "doppler charges": [{ label: "Nos", value: "nos" }],
  "dressing charges": [{ label: "Nos", value: "nos" }],
  "drug test": [{ label: "Nos", value: "nos" }],
  "ecg charges": [{ label: "Nos", value: "nos" }],
  "ect charges": [{ label: "Nos", value: "nos" }],
  "emergency charges": [{ label: "Nos", value: "nos" }],
  "emergency hospital charges": [{ label: "Nos", value: "nos" }],
  enema: [{ label: "Nos", value: "nos" }],
  "extra food charges": [{ label: "Nos", value: "nos" }],
  "hospital charges": [{ label: "Nos", value: "nos" }],
  injectables: [{ label: "Nos", value: "nos" }],
  "mrd charges": [{ label: "Nos", value: "nos" }],
  "mri charges": [{ label: "Nos", value: "nos" }],
  "nebulisation charges": [{ label: "Nos", value: "nos" }],
  "nursing charges": [
    { label: "Days", value: "days" },
    { label: "Month", value: "month" },
  ],
  "opd consultation charges": [{ label: "Nos", value: "nos" }],
  "other charges": [{ label: "Nos", value: "nos" }],
  medicines: [
    { label: "Nos", value: "nos" },
    { label: "Strips", value: "strips" },
  ],
  "physiotherapy charges": [{ label: "Nos", value: "nos" }],
  "procedure charges": [{ label: "Nos", value: "nos" }],
  "psychological counselling": [{ label: "Nos", value: "nos" }],
  "psychological test": [{ label: "Nos", value: "nos" }],
  refund: [{ label: "Nos", value: "nos" }],
  "registration charges": [{ label: "Nos", value: "nos" }],
  "room charges": [
    { label: "Days", value: "days" },
    { label: "Month", value: "month" },
  ],
  "sleep study charges": [{ label: "Nos", value: "nos" }],
  "travel expenses": [{ label: "Nos", value: "nos" }],
  "upt charges": [{ label: "Nos", value: "nos" }],
  "usg charges": [{ label: "Nos", value: "nos" }],
  "x-ray charges": [{ label: "Nos", value: "nos" }],
  "lab charges": [{ label: "Nos", value: "nos" }],
  "music therapy": [{ label: "Nos", value: "nos" }],
  // Default options for any uncategorized items
  default: [
    { label: "Nos", value: "nos" },
    { label: "Days", value: "days" },
    { label: "Month", value: "month" },
    { label: "Pkt", value: "pkt" },
    { label: "Strips", value: "strips" },
  ],
};

export {
  //PATIENT STATUS
  ADMIT_PATIENT,
  DISCHARGE_PATIENT,
  EDIT_ADMISSION,
  //PATIENT VIEWS
  CHARTING_VIEW,
  BILLING_VIEW,
  TIMELINE_VIEW,
  OPD_VIEW,
  //INVOICE CATEGORIES
  categoryUnitOptions,
  //PATIENT CHARTS
  PRESCRIPTION,
  VITAL_SIGN,
  CLINICAL_NOTE,
  LAB_REPORT,
  PROCEDURE,
  RELATIVE_VISIT,
  DISCHARGE_SUMMARY,
  DETAIL_ADMISSION,
  //PATIENT BILLS
  INVOICE,
  ADVANCE_PAYMENT,
  DEPOSIT,
  REFUND,
  //PATIENT CHECKUP TYPES
  OPD,
  IPD,
  CLINIC_TEST,
  //PATIENT ADVANCE PAYMENT OPTIONS
  CASH,
  CARD,
  CHEQUE,
  BANK,
  UPI,
  //PATIENT CHARTS
  records,
  //Test Record
  testRecord,
  //PATIENT CHARTS FORMS FIELDS
  prescriptionFormFields,
  vitalSignFields,
  clinicalNoteFields,
  relativeVisitFields,
  dischargeSummaryFields,
  //PATIENT FIELDS
  addPatientFields,
  patientGuradianFields,
  //PATIENT TYPES
  ALL_PATIENTS,
  ADMIT_PATIENTS,
  DISCHARGE_PATIENTS,
  OPD_PATIENTS,
  //PATIENT LOG
  CREATED,
  ADMITTED,
  DISCHARGED,
  DELETED,
  RESTORED,
  SWITCHED_CENTER,
  //TIMELINE FILTER
  timelineFilters,
  INTERN,
  InternTimelineFilter
};
