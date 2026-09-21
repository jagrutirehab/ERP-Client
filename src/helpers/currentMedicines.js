import { PRESCRIPTION } from "../Components/constants/patient";

export const getDurationDays = (duration, unit) => {
  const d = Number(duration || 0);

  if (!Number.isFinite(d) || d <= 0) {
    return 0;
  }

  if (unit === "Year (s)") return d * 365;
  if (unit === "Month (s)") return d * 30;
  if (unit === "Week (s)") return d * 7;
  return d;
};

export const getMedicineEndDate = (startDate, medicine) => {
  const start = startDate ? new Date(startDate) : null;
  if (!start || Number.isNaN(start.getTime())) return null;

  const durationDays = getDurationDays(medicine?.duration, medicine?.unit);

  if (durationDays <= 0) return null;

  // The To date is the last dose day, so N days ends N-1 days after the start.
  const end = new Date(start);
  end.setDate(end.getDate() + durationDays - 1);
  return end;
};

export const getDaysBetween = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  // Both the From and To day count, so the same day is 1 day.
  const diffDays = Math.round((endMidnight - startMidnight) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

export const isMedicineCurrentlyRunning = (
  startDate,
  medicine,
  referenceDate = new Date(),
) => {
  // The To date is the last day the medicine is given, so it stays running
  // through the end of that day. A stored To date wins (that keeps
  // prescriptions saved under the old end-date rule as they were).
  const endDate = medicine?.endDate
    ? new Date(medicine.endDate)
    : getMedicineEndDate(startDate, medicine);
  if (!endDate || Number.isNaN(endDate.getTime())) return true; // no computable end date => treat as ongoing

  const lastMoment = new Date(endDate);
  lastMoment.setHours(23, 59, 59, 999);
  return referenceDate <= lastMoment;
};


export const drugIdentity = (drug) =>
  [drug?.name, drug?.strength, drug?.unit]
    .map((v) => String(v || "").toLowerCase().trim())
    .join("|");

const medicineKey = (medicine) => drugIdentity(medicine?.medicine);


export const buildCurrentMedicinesList = (charts, referenceDate = new Date()) => {
  const latestByKey = new Map();

  (charts || [])
    .filter((chart) => chart?.chart === PRESCRIPTION && chart?.prescription?.medicines?.length)
    .forEach((chart) => {
      const chartDate = chart.date || chart.createdAt;
      (chart.prescription.medicines || []).forEach((medicine) => {
        const key = medicineKey(medicine);
        if (!key) return;

        const existing = latestByKey.get(key);
        if (existing && new Date(existing.chartDate) >= new Date(chartDate)) {
          return;
        }

        latestByKey.set(key, {
          ...medicine,
          chartId: chart._id,
          chartAuthor: chart.author,
          chartDate,
          startDate: chartDate,
          endDate: medicine.endDate || getMedicineEndDate(chartDate, medicine),
        });
      });
    });

  return Array.from(latestByKey.values()).filter((entry) =>
    isMedicineCurrentlyRunning(entry.startDate, entry, referenceDate),
  );
};

export const getCurrentUserId = () => {
  try {
    return JSON.parse(localStorage.getItem("micrologin"))?.user?._id || null;
  } catch {
    return null;
  }
};
