export const PRESET_MEDICINE_FREQUENCIES = [
  { value: 1, label: "Daily" },
  { value: 2, label: "Alternate days" },
  { value: 15, label: "Every 15 days" },
  { value: 30, label: "Every 30 days" },
];

export const normalizeMedicineFrequency = (frequency) => {
  const parsedFrequency = Number(frequency);

  if (!Number.isFinite(parsedFrequency) || parsedFrequency < 1) {
    return 1;
  }

  return Math.floor(parsedFrequency);
};

export const normalizeMonthlyDate = (monthlyDate) => {
  const parsedDate = Number(monthlyDate);

  if (!Number.isFinite(parsedDate) || parsedDate < 1) {
    return 1;
  }

  return Math.min(31, Math.floor(parsedDate));
};

// Accepts either a raw frequency number (legacy callers) or a
// medicine-like object ({ frequency, frequencyType, monthlyDate }).
const readFrequencyFields = (medicineOrFrequency) => {
  if (medicineOrFrequency !== null && typeof medicineOrFrequency === "object") {
    return {
      frequency: medicineOrFrequency.frequency,
      frequencyType: medicineOrFrequency.frequencyType,
      monthlyDate: medicineOrFrequency.monthlyDate,
    };
  }

  return { frequency: medicineOrFrequency, frequencyType: undefined, monthlyDate: undefined };
};

export const getMedicineFrequencyPreset = (medicineOrFrequency) => {
  const { frequency, frequencyType } = readFrequencyFields(medicineOrFrequency);

  if (frequencyType === "monthly") {
    return "monthly";
  }

  // Treat blank/empty as "custom" so the input stays visible while typing
  if (frequency === "" || frequency === null || frequency === undefined) {
    return "custom";
  }

  const normalizedFrequency = normalizeMedicineFrequency(frequency);

  return PRESET_MEDICINE_FREQUENCIES.some(
    ({ value }) => value === normalizedFrequency
  )
    ? String(normalizedFrequency)
    : "custom";
};

export const getMedicineFrequencyLabel = (medicineOrFrequency) => {
  const { frequency, frequencyType, monthlyDate } = readFrequencyFields(medicineOrFrequency);

  if (frequencyType === "monthly") {
    return `Day ${normalizeMonthlyDate(monthlyDate)} of every month`;
  }

  const normalizedFrequency = normalizeMedicineFrequency(frequency);

  if (normalizedFrequency === 1) {
    return "Daily";
  }

  if (normalizedFrequency === 2) {
    return "Alternate days";
  }

  return `Every ${normalizedFrequency} days`;
};

export const formatDosage = (val, unit) => {
  if (!val || val === "0" || val === 0) return val || "0";
  return unit ? `${val}${unit}` : val;
};
