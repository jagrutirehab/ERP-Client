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
];

export const medicineTypes2 = [
  "TABLET",
  "CAPSULE",
  "SYRUP",
  "INJECTION",
  "DEVICE",
  "SOAP",
  "AMPOULE",
  "VIAL",
  "CREAM",
  "LOTION",
  "OINTMENT",
  "GEL",
  "POWDER",
  "SOLUTION",
  "SUSPENSION",
  "SACHET",
  "EYE DROP",
  "EAR DROP",
  "DROPS",
  "GARGLE",
  "RINSE",
  "SUPPOSITORY",
  "SHAMPOO",
  "LOZENGES",
  "GUM",
  "PATCH",
  "SPRAY",
  "NASAL SPRAY",
  "INHALER",
  "RESPULE",
  "LIQUID",
  "SOLID FORM",
  "PEN CARTRIDGE",
  "PRE-FILLED SYRINGE",
  "SYRINGE",
  "PRE-FILLED PEN",
  "IV BOTTLE",
  "BOTTLE",
  "ENEMA",
  "OIL",
  "LACQUER",
  "PROCEDURE",
  "PAINT",
  "PEN"
]

export const medicineUnits = [GM, MCG, MG];

export const medicineForms = [
  "SOLID_FORM",
  "LIQUID_FORM",
  "INJECTABLE",
  "EXTERNAL_USE",
  "SPECIAL_CASE",
  "SURGICAL",
  "OTHERS",
  "TOPICAL",
  "OPHTHALMIC"
];

export const baseUnits = [
  "NOS",
  "ML",
  "VIAL",
  "AMPOULE",
  "GM",
  "DOSE",
  "SPRAY",
  "PATCH",
  "PEN",
  "INHALER_UNIT",
  "TABLET",
  "CAPSULE",
  "APPLICATION",
  "UNIT",
  "INJECTION",
  "RESPULE",
  "DROP",
  "PAIR",
  "SACHET",
  "LOZENGE",
  "ROLL",
  "PIECE",
  "STRIP",
  "SUPPOSITORY",
  "SCOOP",
  "SPOON",
  "TEASPOON",
  "SESSION",
  "PUFF",
  "BOTTLE"
];

export const normalizeLabel = (val) =>
  val ? val.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "";

export const purchaseUnits = [
  "TUBE",
  "BOTTLE",
  "INHALER_UNIT",
  "BOX",
  "STRIP",
  "UNIT",
  "PIECE",
  "PACK",
  "ROLL",
  "TABLET",
  "VIAL",
  "PEN",
  "TIN",
  "SESSION"
];

export const medicineCategories = [
  "REGULAR",
  "CONTROLLED",
  "OTC",
  "CRITICAL"
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

