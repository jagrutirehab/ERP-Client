import * as Yup from "yup";

export const elderlyChecklistYupShape = {
  // center: Yup.string().required(
  //   "Patient's admission center is missing - cannot proceed",
  // ),
  // residentNameId: Yup.string().trim().required("Resident Name / ID is required"),
  // checklistDateTime: Yup.string().trim().required("Date / Time is required"),
  informationSource: Yup.string().trim().required("Information source is required"),
  informationSourceOther: Yup.string().when("informationSource", {
    is: "other",
    then: (schema) =>
      schema.trim().required("Please specify information source"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),

  supervisionRequired: Yup.string()
    .trim()
    .required("Supervision required is required"),
  standingAbility: Yup.string().trim().required("Standing ability is required"),
  walkingMobility: Yup.string().trim().required("Walking / mobility is required"),
  walkingAidUsed: Yup.string().trim().required("Walking aid used is required"),
  personalHygiene: Yup.string().trim().required("Personal hygiene is required"),
  selfCareAbility: Yup.string().trim().required("Self-care ability is required"),
  levelOfAssistanceRequired: Yup.string()
    .trim()
    .required("Level of assistance required is required"),

  foodIntake: Yup.string().trim().required("Food intake is required"),
  fluidIntake: Yup.string().trim().required("Fluid intake is required"),
  feedingAssistanceRequired: Yup.string()
    .trim()
    .required("Feeding assistance required is required"),
  urinePatternAsReported: Yup.string()
    .trim()
    .required("Urine pattern is required"),
  bowelPatternAsReported: Yup.string()
    .trim()
    .required("Bowel pattern is required"),
  urineControl: Yup.string().trim().required("Urine control is required"),
  bowelControl: Yup.string().trim().required("Bowel control is required"),
  catheterStatus: Yup.string().trim().required("Catheter status is required"),
  skinConcerns: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one skin concern"),
  skinConcernDetails: Yup.string().when("skinConcerns", {
    is: (val) =>
      Array.isArray(val) &&
      (val.includes("redness") || val.includes("wound_sore")),
    then: (schema) =>
      schema.trim().required("Skin concern location / details are required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),

  sleepAsReported: Yup.string().trim().required("Sleep as reported is required"),
  activityParticipation: Yup.string()
    .trim()
    .required("Activity participation is required"),
  expressingNeeds: Yup.string().trim().required("Expressing needs is required"),
  fallSinceLastReview: Yup.string()
    .trim()
    .required("Fall since last review is required"),
  fallDate: Yup.string().when("fallSinceLastReview", {
    is: "yes",
    then: (schema) => schema.trim().required("Fall date is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  careNeedsChangesNoted: Yup.string()
    .trim()
    .required("Care needs / changes noted is required"),
  concernSharedWith: Yup.string()
    .trim()
    .required("Concern shared with is required"),
  sharedNameDateTime: Yup.string().when("concernSharedWith", {
    is: (val) => val && val !== "not_required",
    then: (schema) => schema.trim().required("Name / Date / Time is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
};

export const elderlyChecklistValidationSchema = Yup.object(
  elderlyChecklistYupShape,
);

export const parseElderlyChecklist = (raw) => {
  let parsed = {};
  if (raw && typeof raw === "object") {
    parsed = raw;
  } else if (typeof raw === "string") {
    try {
      const json = JSON.parse(raw);
      if (json && typeof json === "object") parsed = json;
    } catch {
      parsed = {};
    }
  }
  return {
    ...parsed,
    skinConcerns: Array.isArray(parsed.skinConcerns) ? parsed.skinConcerns : [],
  };
};

export const validateElderlyChecklist = (rawValues = {}) => {
  const values = parseElderlyChecklist(rawValues);
  const errors = {};

  // if (!values.center) {
  //   errors.center = "Patient's admission center is missing - cannot proceed";
  // }
  // if (!values.residentNameId?.trim()) {
  //   errors.residentNameId = "Resident Name / ID is required";
  // }
  // if (!values.checklistDateTime) {
  //   errors.checklistDateTime = "Date / Time is required";
  // }
  if (!values.informationSource) {
    errors.informationSource = "Information source is required";
  }
  if (
    values.informationSource === "other" &&
    !values.informationSourceOther?.trim()
  ) {
    errors.informationSourceOther = "Please specify information source";
  }

  if (!values.supervisionRequired) {
    errors.supervisionRequired = "Supervision required is required";
  }
  if (!values.standingAbility) {
    errors.standingAbility = "Standing ability is required";
  }
  if (!values.walkingMobility) {
    errors.walkingMobility = "Walking / mobility is required";
  }
  if (!values.walkingAidUsed) {
    errors.walkingAidUsed = "Walking aid used is required";
  }
  if (!values.personalHygiene) {
    errors.personalHygiene = "Personal hygiene is required";
  }
  if (!values.selfCareAbility) {
    errors.selfCareAbility = "Self-care ability is required";
  }
  if (!values.levelOfAssistanceRequired) {
    errors.levelOfAssistanceRequired = "Level of assistance required is required";
  }

  if (!values.foodIntake) {
    errors.foodIntake = "Food intake is required";
  }
  if (!values.fluidIntake) {
    errors.fluidIntake = "Fluid intake is required";
  }
  if (!values.feedingAssistanceRequired) {
    errors.feedingAssistanceRequired = "Feeding assistance required is required";
  }
  if (!values.urinePatternAsReported) {
    errors.urinePatternAsReported = "Urine pattern is required";
  }
  if (!values.bowelPatternAsReported) {
    errors.bowelPatternAsReported = "Bowel pattern is required";
  }
  if (!values.urineControl) {
    errors.urineControl = "Urine control is required";
  }
  if (!values.bowelControl) {
    errors.bowelControl = "Bowel control is required";
  }
  if (!values.catheterStatus) {
    errors.catheterStatus = "Catheter status is required";
  }

  if (!Array.isArray(values.skinConcerns) || values.skinConcerns.length === 0) {
    errors.skinConcerns = "Please select at least one skin concern";
  } else if (
    (values.skinConcerns.includes("redness") ||
      values.skinConcerns.includes("wound_sore")) &&
    !values.skinConcernDetails?.trim()
  ) {
    errors.skinConcernDetails = "Skin concern location / details are required";
  }

  if (!values.sleepAsReported) {
    errors.sleepAsReported = "Sleep as reported is required";
  }
  if (!values.activityParticipation) {
    errors.activityParticipation = "Activity participation is required";
  }
  if (!values.expressingNeeds) {
    errors.expressingNeeds = "Expressing needs is required";
  }
  if (!values.fallSinceLastReview) {
    errors.fallSinceLastReview = "Fall since last review is required";
  }
  if (values.fallSinceLastReview === "yes" && !values.fallDate) {
    errors.fallDate = "Fall date is required";
  }
  if (!values.careNeedsChangesNoted?.trim()) {
    errors.careNeedsChangesNoted = "Care needs / changes noted is required";
  }
  if (!values.concernSharedWith) {
    errors.concernSharedWith = "Concern shared with is required";
  } else if (
    values.concernSharedWith !== "not_required" &&
    !values.sharedNameDateTime?.trim()
  ) {
    errors.sharedNameDateTime = "Name / Date / Time is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
