export const AI_FIELD_LABELS = {
  genericName: "Generic Name",
  form: "Form",
  storageType: "Storage Type",
  category: "Category",
  composition: "Composition",
};

export const getAiFilledFields = (row) => {
  const ai = row?.aiSuggestions || {};
  const med = row?.proposedMedicine || {};
  return Object.keys(AI_FIELD_LABELS).filter(
    (key) => ai[key] && String(med[key] ?? "") === String(ai[key])
  );
};
