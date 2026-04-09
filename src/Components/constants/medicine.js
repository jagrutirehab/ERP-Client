//TYPE
export const CAPSULE = "CAP";
export const CREAM = "CREAM";
export const DROP = "DROP";
export const SYRUP = "SYP";
export const TAB = "TAB";
export const INJ = "INJ";
export const SPRAY = "ORAL SPRAY";
export const PATCH = "PATCH";
//UNIT
export const MG = "MG";
export const MCG = "MCG";
export const GM = "GM";

export const medicineTypes = [
  CAPSULE,
  CREAM,
  DROP,
  SYRUP,
  TAB,
  INJ,
  SPRAY,
  PATCH,
  "TABLET",
  "SOFTGEL",
  "DROPS",
  "INJECTION",
  "VIAL",
  "AMPOULE",
  "OINTMENT",
  "GEL",
  "LOTION",
  "INHALER",
  "NASAL SPRAY",
  "TRANSDERMAL PATCH"
];

export const medicineUnits = [GM, MCG, MG];

export const medicineForms = [
  "SOLID_FORM",
  "LIQUID_FORM",
  "INJECTABLE",
  "EXTERNAL_USE",
  "SPECIAL_CASE"
];

export const baseUnits = [
  "TUBE",
  "BOTTLE",
  "INHALER_UNIT",
  "BOX",
  "NOS",
  "ML",
  "VIAL",
  "AMPOULE",
  "GM",
  "DOSE",
  "SPRAY",
  "PATCH"
];

export const normalizeLabel = (val) =>
  val ? val.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "";

export const purchaseUnits = [
  "TUBE",
  "BOTTLE",
  "INHALER_UNIT",
  "BOX",
  "STRIP"
];

export const medicineCategories = [
  "REGULAR",
  "CONTROLLED",
  "NARCOTIC",
  "PSYCHOTROPIC",
  "OTC",
  "PRESCRIPTION"
];

export const storageTypes = [
  "ROOM",
  "COLD"
];

export const scheduleTypes = [
  "H",
  "H1",
  "X",
  "OTC",
];

