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

  const end = new Date(start);
  end.setDate(end.getDate() + durationDays);
  return end;
};

export const getDaysBetween = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

export const isMedicineCurrentlyRunning = (
  startDate,
  medicine,
  referenceDate = new Date(),
) => {
  const endDate = getMedicineEndDate(startDate, medicine);
  if (!endDate) return true; // no computable end date => treat as ongoing
  return referenceDate <= endDate;
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
          endDate: getMedicineEndDate(chartDate, medicine),
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
