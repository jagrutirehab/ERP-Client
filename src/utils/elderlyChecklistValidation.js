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

const VALID_INFORMATION_SOURCE = new Set(["direct_observation", "resident", "caregiver_or_nursing_staff", "family", "other"]);
const VALID_SUPERVISION_REQUIRED = new Set(["none", "intermittent", "continuous", "not_known"]);
const VALID_STANDING_ABILITY = new Set(["independent", "support_required", "unable", "not_known"]);
const VALID_WALKING_MOBILITY = new Set(["independent", "assistance_required", "unable", "not_known"]);
const VALID_WALKING_AID_USED = new Set(["no", "yes", "not_known"]);
const VALID_PERSONAL_HYGIENE = new Set(["independent", "needs_assistance", "dependent", "not_known"]);
const VALID_SELF_CARE_ABILITY = new Set(["independent", "partially_dependent", "fully_dependent", "not_known"]);
const VALID_LEVEL_OF_ASSISTANCE = new Set(["none", "minimal", "moderate", "maximum", "total", "not_known"]);
const VALID_FOOD_INTAKE = new Set(["usual_adequate", "reduced", "poor", "not_known"]);
const VALID_FLUID_INTAKE = new Set(["usual_adequate", "reduced", "poor", "not_known"]);
const VALID_FEEDING_ASSISTANCE = new Set(["no", "yes", "not_known"]);
const VALID_URINE_PATTERN = new Set(["usual", "change_reported", "not_known"]);
const VALID_BOWEL_PATTERN = new Set(["usual", "change_reported", "not_known"]);
const VALID_URINE_CONTROL = new Set(["no_accidents_reported", "accidents_reported", "not_known"]);
const VALID_BOWEL_CONTROL = new Set(["no_accidents_reported", "accidents_reported", "not_known"]);
const VALID_CATHETER_STATUS = new Set(["absent", "present", "not_known"]);
const VALID_SKIN_CONCERNS = new Set(["none", "redness", "wound_sore", "not_known"]);
const VALID_SLEEP_AS_REPORTED = new Set(["usual", "interrupted", "less_than_usual", "not_known"]);
const VALID_ACTIVITY_PARTICIPATION = new Set(["joins_independently", "needs_encouragement", "does_not_join", "no_activity_offered_not_observed"]);
const VALID_EXPRESSING_NEEDS = new Set(["clearly", "with_prompting_gestures", "needs_help", "not_observed"]);
const VALID_FALL_SINCE_LAST_REVIEW = new Set(["no", "yes", "not_known"]);
const VALID_CONCERN_SHARED_WITH = new Set(["nurse", "doctor", "care_team", "not_required"]);

export const validateElderlyChecklist = (rawValues = {}) => {
  const values = parseElderlyChecklist(rawValues);
  const errors = {};

  if (!VALID_INFORMATION_SOURCE.has(values.informationSource)) {
    errors.informationSource = "Information source is required";
  }
  if (
    values.informationSource === "other" &&
    !values.informationSourceOther?.trim()
  ) {
    errors.informationSourceOther = "Please specify information source";
  }

  if (!VALID_SUPERVISION_REQUIRED.has(values.supervisionRequired)) {
    errors.supervisionRequired = "Supervision required is required";
  }
  if (!VALID_STANDING_ABILITY.has(values.standingAbility)) {
    errors.standingAbility = "Standing ability is required";
  }
  if (!VALID_WALKING_MOBILITY.has(values.walkingMobility)) {
    errors.walkingMobility = "Walking / mobility is required";
  }
  if (!VALID_WALKING_AID_USED.has(values.walkingAidUsed)) {
    errors.walkingAidUsed = "Walking aid used is required";
  }
  if (!VALID_PERSONAL_HYGIENE.has(values.personalHygiene)) {
    errors.personalHygiene = "Personal hygiene is required";
  }
  if (!VALID_SELF_CARE_ABILITY.has(values.selfCareAbility)) {
    errors.selfCareAbility = "Self-care ability is required";
  }
  if (!VALID_LEVEL_OF_ASSISTANCE.has(values.levelOfAssistanceRequired)) {
    errors.levelOfAssistanceRequired = "Level of assistance required is required";
  }

  if (!VALID_FOOD_INTAKE.has(values.foodIntake)) {
    errors.foodIntake = "Food intake is required";
  }
  if (!VALID_FLUID_INTAKE.has(values.fluidIntake)) {
    errors.fluidIntake = "Fluid intake is required";
  }
  if (!VALID_FEEDING_ASSISTANCE.has(values.feedingAssistanceRequired)) {
    errors.feedingAssistanceRequired = "Feeding assistance required is required";
  }
  if (!VALID_URINE_PATTERN.has(values.urinePatternAsReported)) {
    errors.urinePatternAsReported = "Urine pattern is required";
  }
  if (!VALID_BOWEL_PATTERN.has(values.bowelPatternAsReported)) {
    errors.bowelPatternAsReported = "Bowel pattern is required";
  }
  if (!VALID_URINE_CONTROL.has(values.urineControl)) {
    errors.urineControl = "Urine control is required";
  }
  if (!VALID_BOWEL_CONTROL.has(values.bowelControl)) {
    errors.bowelControl = "Bowel control is required";
  }
  if (!VALID_CATHETER_STATUS.has(values.catheterStatus)) {
    errors.catheterStatus = "Catheter status is required";
  }

  if (
    !Array.isArray(values.skinConcerns) ||
    values.skinConcerns.length === 0 ||
    !values.skinConcerns.some((v) => VALID_SKIN_CONCERNS.has(v))
  ) {
    errors.skinConcerns = "Please select at least one skin concern";
  } else if (
    (values.skinConcerns.includes("redness") ||
      values.skinConcerns.includes("wound_sore")) &&
    !values.skinConcernDetails?.trim()
  ) {
    errors.skinConcernDetails = "Skin concern location / details are required";
  }

  if (!VALID_SLEEP_AS_REPORTED.has(values.sleepAsReported)) {
    errors.sleepAsReported = "Sleep as reported is required";
  }
  if (!VALID_ACTIVITY_PARTICIPATION.has(values.activityParticipation)) {
    errors.activityParticipation = "Activity participation is required";
  }
  if (!VALID_EXPRESSING_NEEDS.has(values.expressingNeeds)) {
    errors.expressingNeeds = "Expressing needs is required";
  }
  if (!VALID_FALL_SINCE_LAST_REVIEW.has(values.fallSinceLastReview)) {
    errors.fallSinceLastReview = "Fall since last review is required";
  }
  if (values.fallSinceLastReview === "yes" && !values.fallDate) {
    errors.fallDate = "Fall date is required";
  }
  if (!values.careNeedsChangesNoted?.trim()) {
    errors.careNeedsChangesNoted = "Care needs / changes noted is required";
  }
  if (!VALID_CONCERN_SHARED_WITH.has(values.concernSharedWith)) {
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
