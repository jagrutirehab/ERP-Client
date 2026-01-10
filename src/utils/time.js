export const timeToMinutes = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const minutesToTime = (minutes) => {
  if (minutes === null || minutes === undefined) return "";
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

export const minutesToDate = (minutes) => {
  if (minutes == null) return null;
  const d = new Date();
  d.setHours(Math.floor(minutes / 60));
  d.setMinutes(minutes % 60);
  d.setSeconds(0);
  return d;
};