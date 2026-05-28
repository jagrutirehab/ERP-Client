// Maps a SOP `suggestedMedicine` row into the shape the prescription medicine
// table expects. After the schema-rename in SOPRules.model.js, the dose fields
// and intake strings are now identical to the Prescription side — this is a
// near-direct copy that just fills in prescription-only fields (duration,
// frequency, etc.) with sensible defaults.
export const mapSopMedicineToPrescription = (sopMed) => {
  const snap = sopMed.medicineSnapshot || {};
  const dose = sopMed.dosageAndFrequency || {};

  return {
    medicine: {
      _id: sopMed.medicine || "",
      name: snap.name || "",
      type: snap.type || "",
      strength: snap.strength || "",
      unit: snap.unit || "",
      isNew: !sopMed.medicine,
    },
    dosageAndFrequency: {
      morning: dose.morning || "",
      evening: dose.evening || "",
      night:   dose.night   || "",
      unit:    dose.unit    || "",
    },
    instructions: sopMed.instructions || "",
    intake: sopMed.intake || "After food",
    duration: "30",
    unit: "Day (s)",
    frequency: 1,
  };
};
