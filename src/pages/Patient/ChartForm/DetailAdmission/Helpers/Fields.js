import { getIn } from "formik";

export const YES_NO = ["Yes", "No"];
export const PRESENT_ABSENT = ["Present", "Absent"];
export const LOW_MOD_HIGH = ["Low", "Moderate", "High"];
export const NONE_LOW_MOD_HIGH = ["None", "Low", "Moderate", "High"];


export const SUBSTANCE_PROFILE_ROWS = [
  "Alcohol",
  "Opioids (specify)",
  "Cannabis / Ganja",
  "Tobacco / Nicotine",
  "Benzodiazepines",
  "Stimulants (specify)",
  "Inhalants",
  "Other (specify)",
];

export const BARTHEL_ACTIVITIES = [
  "Bathing / Grooming",
  "Feeding / Eating",
  "Dressing",
  "Toileting / Continence",
  "Transferring (bed ↔ chair)",
  "Ambulation / Mobility",
  "Using telephone",
  "Shopping / Managing finances",
  "Meal preparation",
  "Housekeeping / Laundry",
  "Managing medications",
  "Using transport / driving",
];

export const PAIN_PARAMETERS = [
  "Site / Location",
  "Character / Quality",
  "Radiation",
  "Onset & Duration",
  "Aggravating factors",
  "Relieving factors",
];

export const EPISODE_PHASES = [
  "First episode",
  "Second episode",
  "Third episode",
  "Subsequent episodes",
  "Current episode",
];

export const buildFixedRows = (rowLabels, labelKey, emptyRowShape) =>
  rowLabels.map((label) => ({ [labelKey]: label, ...emptyRowShape }));

export const humanize = (key) =>
  key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

export const setInPath = (obj, path, value) => {
  const keys = path.split(".");
  const result = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  let cursor = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const existing = cursor[key];
    const cloned = Array.isArray(existing)
      ? [...existing]
      : { ...(existing || {}) };
    cursor[key] = cloned;
    cursor = cloned;
  }
  cursor[keys[keys.length - 1]] = value;
  return result;
};


const isLeafFilled = (item, values) => {
  const val = getIn(values, item.path);
  if (item.type === "multiselect") return Array.isArray(val) && val.length > 0;
  if (item.type === "yesno") return val === true || val === false;
  if (val === null || val === undefined) return false;
  return String(val).trim() !== "";
};

const isGridFilled = (item, values) => {
  const rows = getIn(values, item.path);
  if (!Array.isArray(rows) || rows.length === 0) return false;
  return rows.some((row) =>
    item.columns.every((col) => {
      const v = row?.[col.key];
      return v !== null && v !== undefined && String(v).trim() !== "";
    }),
  );
};

export const validateSections = (sections, values) => {
  const errors = {};
  (sections || []).forEach((section) => {
    section.items.forEach((item) => {
      if (item.kind === "grid") {
        if (!isGridFilled(item, values)) {
          errors[item.path] =
            "Please complete at least one full row in this table.";
        }
      } else {
        if (!isLeafFilled(item, values)) {
          errors[item.path] = "This field is required.";
        }
      }
    });
  });
  return errors;
};
