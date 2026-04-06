export const PRESET_MEDICINE_FREQUENCIES = [
  { value: 1, label: "Everyday" },
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

export const getMedicineFrequencyPreset = (frequency) => {
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

export const getMedicineFrequencyLabel = (frequency) => {
  const normalizedFrequency = normalizeMedicineFrequency(frequency);

  if (normalizedFrequency === 1) {
    return "Everyday";
  }

  return `Every ${normalizedFrequency} days`;
};
