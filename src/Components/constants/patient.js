const FORMS_VIEW = "FORMS";
const CHARTING_VIEW = "CHARTING";
const BILLING_VIEW = "BILLING";
const TIMELINE_VIEW = "TIMELINE";
const OPD_VIEW = "OPD";
//Charts
const PRESCRIPTION = "PRESCRIPTION";
const VITAL_SIGN = "VITAL_SIGN";
const CLINICAL_NOTE = "CLINICAL_NOTE";
const COUNSELLING_NOTE = "COUNSELLING_NOTE";
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
export const NOTES = "NOTES";
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
    name: "Counselling Notes",
    category: COUNSELLING_NOTE,
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

const Forms = [
  {
    name: "Admission Form",
    category: "ADMISSION FORM",
  },
  {
    name: "Consent Form",
    category: "CONSENT FORM",
  },
  {
    name: "Discharge Form",
    category: "DISCHARGE FORM",
  },
];
const testRecord = [
  // { name : "ROR" },
  // { name : "NIMHAS" },
  { name: "YMRS" },
  { name: "CIWA-AR" },
  { name: "C-SSRS" },
  { name: "MPQ-9" },
  { name: "MMSE" },
  { name: "Y-BOCS" },
  { name: "ACDS" },
  { name: "HAM-A" },
  { name: "HAM-D" },
  { name: "PANSS" },
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
  {
    label: "CNS",
    name: "cns",
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
    label: "PA",
    name: "pa",
    type: "text",
    xs: 6,
    md: 3,
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

const mentalExaminationFields = [
  { label: "Appearance & Behavior", name: "", type: "header" },
  {
    label: "Grooming",
    name: "grooming",
    type: "radio",
    options: ["good", "fair", "poor"],
  },
  {
    label: "Eye Contact",
    name: "eyeContact",
    type: "radio",
    options: ["normal", "avoidant", "excessive"],
  },
  {
    label: "Psychomotor Activity",
    name: "psychomotorActivity",
    type: "radio",
    options: ["normal", "retarded", "agitated"],
  },

  { label: "Speech", type: "header" },
  {
    label: "Rate",
    name: "rate",
    type: "radio",
    options: ["normal", "slow", "pressured"],
  },
  {
    label: "Volume",
    name: "volume",
    type: "radio",
    options: ["normal", "low", "loud"],
  },

  { label: "Mood", type: "header" },
  {
    label: "Affect",
    name: "affect",
    type: "radio",
    options: ["euthymic", "depressed", "irritable", "elated"],
  },
  {
    label: "Affect Notes",
    name: "affectNotes",
    type: "text",
  },
  {
    label: "Mood",
    name: "subjective",
    type: "text",
  },
  { label: "Thought", type: "header" },
  {
    label: "Delusions",
    name: "delusions",
    type: "radio",
    options: ["none", "present"],
  },
  {
    label: "Content",
    name: "content",
    type: "text",
  },
  {
    label: "If Delusion Present, Specify",
    name: "delusionNotes",
    type: "text",
    showIf: {
      field: "delusions",
      value: "present",
    },
  },

  { label: "Perception", type: "header" },
  {
    label: "Perception",
    name: "perception",
    type: "radio",
    options: ["normal", "hallucination", "illusion"],
    labelHidden: true,
  },

  { label: "Cognition", type: "header" },
  {
    label: "Orientation",
    name: "orientation",
    type: "radio",
    options: ["time", "place", "person"],
  },

  {
    label: "Memory",
    name: "memory",
    type: "radio",
    options: ["intact", "impaired"],
  },

  { label: "Insight", type: "header" },
  {
    label: "Grade",
    name: "grade",
    type: "select",
    options: ["I", "II", "III", "IV", "V", "VI"],
  },

  { label: "Judgment", type: "header" },
  {
    label: "Judgment",
    name: "judgment",
    type: "radio",
    options: ["intact", "impaired"],
    labelHidden: true,
  },

  { label: "Remarks / Impression", type: "header" },
  {
    label: "Remarks",
    name: "remarks",
    type: "text",
    labelHidden: true,
  },
];

const mentalExaminationV2Fields = [
  { label: "Cheif Complaints", type: "header" },
  {
    label: "Cheif Complaint",
    name: "chiefComplaints",
    type: "textarea",
    labelHidden: true,
  },

  { label: "Appearance & Behavior", type: "header" },
  {
    label: "Grooming",
    name: "grooming",
    type: "radio",
    options: ["good", "fair", "poor"],
  },
  {
    label: "General Appearance",
    name: "generalAppearance",
    type: "radio",
    options: [
      { label: "Kempt", value: "kempt" },
      { label: "Unkempt and untidy", value: "unkempt_and_untidy" },
      { label: "Overtly made up", value: "overtly_made_up" },
      { label: "Fair", value: "fair" },
      { label: "Poor", value: "poor" },
    ],
  },
  {
    label: "In Touch With Surroundings",
    name: "surroundingTouch",
    type: "radio",
    options: ["present", "partial", "absent"],
  },
  {
    label: "Eye Contact",
    name: "eyeContact",
    type: "radio",
    options: ["normal", "avoidant", "excessive"],
  },
  {
    label: "Psychomotor Activity",
    name: "psychomotorActivity",
    type: "radio",
    options: [
      { label: "Normal", value: "normal" },
      { label: "Retarded", value: "retarded" },
      { label: "Hyperactive", value: "hyperactive" },
      { label: "Agitated", value: "agitated" },
      { label: "Mannerisms", value: "mannerisms" },
      { label: "Restless", value: "restless" },
      { label: "Grimace", value: "grimace" },
      { label: "Hallucinatory Behaviour", value: "hallucinatory_behaviour" },
      { label: "Silly Smiling", value: "silly_smiling" },
      { label: "Aggressive", value: "aggressive" },
    ],
  },

  { label: "Speech", type: "header" },
  {
    label: "Rate",
    name: "rate",
    type: "radio",
    options: ["normal", "slow", "pressured"],
  },
  {
    label: "Tone",
    name: "tone",
    type: "radio",
    options: ["increased", "decreased"],
  },
  {
    label: "Volume",
    name: "volume",
    type: "radio",
    options: ["normal/audible", "low/soft", "loud"],
  },
  {
    label: "Reaction Time",
    name: "reactionTime",
    type: "radio",
    options: [
      { label: "Increased Reaction Time", value: "increased" },
      { label: "Decreased Reaction Time", value: "decreased" },
    ],
  },
  {
    label: "Productivity",
    name: "productivity",
    type: "radio",
    options: [
      { label: "Increased Productivity", value: "increased" },
      { label: "Decreased Productivity", value: "decreased" },
    ],
  },
  {
    label: "Speed",
    name: "speed",
    type: "radio",
    options: [
      { label: "Slow", value: "slow" },
      { label: "Rapid", value: "rapid" },
      { label: "Pressure Of Speech", value: "pressure_of_speech" },
    ],
  },
  {
    label: "Relevance",
    name: "relevance",
    type: "radio",
    options: ["relevant", "irrelevant"],
  },
  {
    label: "Coherence",
    name: "coherence",
    type: "radio",
    options: ["coherent", "incoherent"],
  },
  {
    label: "Goal Direction",
    name: "goalDirection",
    type: "radio",
    options: [
      { label: "Goal Directed", value: "goal_directed" },
      { label: "Non Goal Directed", value: "non_goal_directed" },
    ],
  },

  { label: "Mood", type: "header" },
  // {
  //   label: "Objective Mood",
  //   name: "objective",
  //   type: "textarea",
  // },
  {
    label: "Subjective Mood",
    name: "subjective",
    type: "textarea",
  },
  // {
  //   label: "Lability",
  //   name: "lability",
  //   type: "radio",
  //   options: ["present", "absent"],
  // },
  // {
  //   label: "Appropriateness",
  //   name: "appropriateness1",
  //   type: "text",
  // },

  { label: "Affect", type: "header" },
  // {
  //   label: "Affect",
  //   name: "affect",
  //   type: "radio",
  //   options: ["euthymic", "depressed", "irritable", "elated"],
  // },
  {
    label: "Quality",
    name: "quality",
    type: "radio",
    options: [
      "dysphoric",
      "anxious",
      "irritable",
      "depressed",
      "elevated",
      "euphoric",
      "elated",
      "exalted",
      "ecstatic",
      "euthymic",
    ],
  },
  {
    label: "Intensity of Affect",
    name: "intensity",
    type: "radio",
    options: ["shallow", "blunted", "flat"],
  },
  {
    label: "Mobility of Affect",
    name: "mobility",
    type: "radio",
    options: ["constricted", "fixed", "labile "],
  },
  {
    label: "Range",
    name: "range",
    type: "radio",
    options: ["full", "constricted"],
  },
  {
    label: "Reactivity",
    name: "reactivity",
    type: "radio",
    options: ["present", "absent"],
  },
  {
    label: "Communicability",
    name: "communicability",
    type: "radio",
    options: ["present", "absent"],
  },
  {
    label: "Diurnal Variation of Affect",
    name: "diurnalVariation",
    type: "radio",
    options: [
      { label: "Worse in Morning", value: "worse_in_morning" },
      { label: "Worse in Evening", value: "worse_in_evening" },
    ],
  },
  {
    label: "Appropriateness",
    name: "appropriateness2",
    type: "text",
  },
  {
    label: "Affect Notes",
    name: "affectNotes",
    type: "textarea",
  },

  { label: "Thought", type: "header" },

  {
    label: "Delusions",
    name: "delusions",
    type: "radio",
    options: ["none", "present"],
  },
  {
    label: "Thought Content",
    name: "content",
    type: "textarea",
  },
  {
    label: "Thought Process",
    name: "process",
    type: "textarea",
  },
  {
    label: "If Delusion Present, Specify",
    name: "delusionNotes",
    type: "textarea",
    showIf: {
      field: "delusions",
      value: "present",
    },
  },

  { label: "Perception", type: "header" },
  {
    label: "Perception",
    name: "perception",
    type: "radio",
    options: ["normal", "hallucination", "illusion"],
    labelHidden: true,
  },
  {
    label: "Perception Notes",
    name: "perceptionNotes",
    type: "textarea",
    labelHidden: true,
  },

  { label: "Cognition", type: "header" },
  {
    label: "Orientation",
    name: "orientation",
    type: "checkbox",
    options: ["time", "place", "person"],
  },
  {
    label: "Attention",
    name: "attention",
    type: "radio",
    options: [
      { label: "Easily Distractible", value: "easily_distractible" },
      { label: "Attention Maintained", value: "attention_maintained" },
      { label: "Disturbance in Attention", value: "disturbance_in_attention" },
    ],
  },
  {
    label: "Concentration",
    name: "concentration",
    type: "radio",
    options: [
      {
        label: "Able to Concentrate and Focus",
        value: "able_to_concentrate_and_focus",
      },
      {
        label: "Unable to Concentrate and Focus",
        value: "unable_to_concentrate_and_focus",
      },
    ],
  },
  {
    label: "Memory",
    name: "memory",
    type: "radio",
    options: ["intact", "partial", "impaired"],
  },

  { label: "Insight", type: "header" },
  {
    label: "Grade",
    name: "grade",
    type: "select2",
    options: [
      {
        label: "Grade 1 - Complete Denial of Illness",
        value: "grade_1-_complete_denial_of_illness",
      },
      {
        label: "Grade 2 - Slight Awareness But Still Denying",
        value: "grade_2-_slight_awareness_byt_still_denying",
      },
      {
        label:
          "Grade 3 - Awareness of Being Sick, But Blaming External Factors",
        value: "grade_3-_awareness_of_being_sick_but_blaming_external_factors",
      },
      {
        label:
          "Grade 4 - Aware Something Is Wrong And Self Is Involved, But Feels Helpless And Attributes It To Unknown/Organic Factors.",
        value:
          "grade_4-_aware_something_is_wrong_and_self_is_involved,_but_feels_helpless_and_attributes_it_to_unknown/organic_factors",
      },
      {
        label:
          "Grade 5 - Understands They're Contributing To the Issue But Has No Clue How To Fix It.",
        value:
          "grade_5-_understands_they're_contributing_to_the_issue_but_has_no_clue_how_to_fix_it",
      },
      {
        label:
          "Grade 6 - Fully Aware Of The Problem, Accepts Responsibility, And Is Willing To Take Help And Make Changes.",
        value:
          "grade_6-_fully_aware_of_the_problem,_accepts_responsibility,_and_willing_to_help_and_make_changes",
      },
    ],
    labelHidden: true,
  },

  { label: "Judgment", type: "header" },
  {
    label: "Judgment",
    name: "judgment",
    type: "radio",
    options: ["intact", "partial", "impaired"],
    labelHidden: true,
  },

  { label: "Remarks / Impression", type: "header" },
  {
    label: "Remarks",
    name: "remarks",
    type: "textarea",
    labelHidden: true,
  },

  { label: "Observation", type: "header" },
  {
    label: "Observation",
    name: "observation",
    type: "textarea",
    labelHidden: true,
  },
];

const counsellingNoteFields = [
  {
    label: "Objective of the session",
    name: "objective",
    type: "textarea",
  },
  {
    label: "Short term goals",
    name: "shortTermGoals",
    type: "textarea",
  },
  {
    label: "Long term goals",
    name: "longTermGoals",
    type: "textarea",
  },
  {
    label: "Notes",
    name: "notes",
    type: "textarea",
  },
  {
    label: "Homework/Task assigned",
    name: "homework",
    type: "textarea",
  },
  {
    label: "Review of previous task",
    name: "reviewPreviousTask",
    type: "textarea",
  },
  {
    label: "Conclusion",
    name: "conclusion",
    type: "textarea",
  },
  {
    label: "Goal for next session",
    name: "nextEndGoal",
    type: "textarea",
  },
  {
    label: "Next session date",
    name: "nextSessionDate",
    type: "date",
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
    label: "Name",
    name: "name",
    type: "text",
  },
  {
    label: "Gender",
    name: "gender",
    type: "radio",
    options: ["MALE", "FEMALE", "OTHERS"],
  },
  {
    label: "Date of Birth",
    name: "dateOfBirth",
    type: "date",
  },
  {
    label: "Marital Status",
    name: "maritalstatus",
    type: "radio",
    options: ["MARRIED", "UNMARRID", "SEPRATED"],
  },
  {
    label: "Religion",
    name: "religion",
    type: "text",
  },
  {
    label: "Socio Economic Status",
    name: "socioeconomicstatus",
    type: "text",
  },
  {
    label: "Address",
    name: "address",
    type: "textarea",
  },
  {
    label: "Area Type",
    name: "areatype",
    type: "radio",
    options: ["RURAL", "CITY"],
  },
  {
    label: "Phone Number",
    name: "phoneNumber",
    type: "number",
  },
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
    label: "Email",
    name: "email",
    type: "email",
  },
  {
    label: "Age",
    name: "age",
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
    required: true,
  },
  {
    label: "Relation",
    name: "guardianRelation",
    type: "text",
    required: true,
  },
  {
    label: "Phone Number",
    name: "guardianPhoneNumber",
    type: "text",
    required: true,
  },
  // {
  //   label: "Date Of Addmission",
  //   name: "dateOfAddmission",
  //   type: "date",
  // },
  // {
  //   label: "Referred By",
  //   name: "referredBy",
  //   type: "text",
  //   required: true,
  // },
  // {
  //   label: "IPD File Number",
  //   name: "ipdFileNumber",
  //   type: "text",
  //   required: false,
  // },
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
    label: "Clinical_test",
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
  },
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
  FORMS_VIEW,
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
  COUNSELLING_NOTE,
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
  counsellingNoteFields,
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
  InternTimelineFilter,
  Forms,
};
