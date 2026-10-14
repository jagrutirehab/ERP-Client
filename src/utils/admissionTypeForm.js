import * as Yup from "yup";
import {
  admissionTypeBranchFields,
  INDEPENDENT_ADMISSION,
  SUPPORTIVE_ADMISSION,
  EMERGENCY_ADMISSION,
} from "../Components/constants/patient";

/**
 * Form-side pieces shared by every place a user picks an admission type:
 * the Admission Type chart form and the direct-entry modal on the IPD card.
 *
 * Kept out of utils/admissionType.js on purpose — that module is imported by
 * read-only display components (the header summary card, the print renderers),
 * and it should not drag Yup into their bundles.
 *
 * The field DESCRIPTORS are not here: `admissionTypeFields` /
 * `admissionTypeBranchFields` already live in Components/constants/patient.js
 * and are shared by the display side too.
 */

// Every field belonging to some branch. Anything outside the current branch is
// cleared before saving.
export const ALL_BRANCH_FIELDS = Object.values(admissionTypeBranchFields).flat();

// Mirrored server-side in controllers/patient/setAdmissionType.controller.js —
// the API cannot trust a form to have enforced its own branch rules.
export const admissionTypeValidationSchema = Yup.object({
  admissionType: Yup.string().required("Admission type is required"),
  adultationType: Yup.string().when("admissionType", {
    is: INDEPENDENT_ADMISSION,
    then: (schema) => schema.required("Adultation type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  supportType: Yup.string().when("admissionType", {
    is: SUPPORTIVE_ADMISSION,
    then: (schema) => schema.required("Support type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  emergencyType: Yup.string().when("admissionType", {
    is: EMERGENCY_ADMISSION,
    then: (schema) => schema.required("Emergency type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  emergencyRestraint: Yup.string().when("admissionType", {
    is: EMERGENCY_ADMISSION,
    then: (schema) => schema.required("Restraint is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

/**
 * Drops the values of every field outside `admissionType`'s branch.
 *
 * RenderFields hides a field whose `showIf` no longer matches, but Formik keeps
 * its value — without this, choosing Independent › Adult and then switching to
 * Emergency would still submit `adultationType: "ADULT"`.
 */
export const stripInactiveBranchFields = (values = {}) => {
  const keep = admissionTypeBranchFields[values.admissionType] || [];
  const cleaned = { ...values };
  ALL_BRANCH_FIELDS.forEach((field) => {
    if (!keep.includes(field)) cleaned[field] = "";
  });
  return cleaned;
};

/**
 * The live counterpart of the above, for use in an effect as the user switches
 * branch. Clears both the value and the touched flag so a hidden field can't
 * carry a stale validation error.
 */
export const clearInactiveBranchFields = (validation) => {
  const keep =
    admissionTypeBranchFields[validation.values.admissionType] || [];
  ALL_BRANCH_FIELDS.forEach((field) => {
    if (!keep.includes(field) && validation.values[field]) {
      validation.setFieldValue(field, "");
      validation.setFieldTouched(field, false);
    }
  });
};
