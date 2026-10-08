export const AI_FIELD_LABELS = {
  genericName: "Generic Name",
  form: "Form",
  storageType: "Storage Type",
  category: "Category",
  composition: "Composition",
  baseUnit: "Base Unit",
  purchaseUnit: "Purchase Unit",
  type: "Type",
  scheduleType: "Schedule Type",
};

export const getAiFilledFields = (row) => {
  const ai = row?.aiSuggestions || {};
  const med = row?.proposedMedicine || {};
  const flat = Object.keys(AI_FIELD_LABELS).filter(
    (key) => ai[key] && String(med[key] ?? "") === String(ai[key])
  );
  const conversionFilled =
    ai.conversion?.purchaseQuantity &&
    ai.conversion?.baseQuantity &&
    Number(med.conversion?.purchaseQuantity) === ai.conversion.purchaseQuantity &&
    Number(med.conversion?.baseQuantity) === ai.conversion.baseQuantity;
  return conversionFilled ? [...flat, "conversion"] : flat;
};

// "conversion" isn't a direct proposedMedicine key (it's nested), so it needs its own label
// outside AI_FIELD_LABELS. Callers rendering labels for getAiFilledFields() results should
// use this instead of indexing AI_FIELD_LABELS directly.
export const getAiFieldLabel = (key) => (key === "conversion" ? "Conversion" : AI_FIELD_LABELS[key]);
