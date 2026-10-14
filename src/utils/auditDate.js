import { startOfDay, endOfDay, isSameDay } from "date-fns";

// The client owns the audit date. It sends its own local start-of-day as an ISO
// instant; the server stores that instant verbatim and never derives a date.
//
// Because local midnight becomes a UTC instant on the previous calendar day in
// any positive-offset zone, NEVER format these values with UTC helpers
// (getUTCDate, toISOString().slice(0,10)) — always use local-time formatting.

export const toAuditDateParam = (date) => startOfDay(date).toISOString();

export const toRangeStartParam = (date) => startOfDay(date).toISOString();

export const toRangeEndParam = (date) => endOfDay(date).toISOString();

export const isSameLocalDay = (a, b) => {
  if (!a || !b) return false;
  return isSameDay(new Date(a), new Date(b));
};

export const isTodayLocal = (date) => isSameLocalDay(date, new Date());

// Local-time display formatting, matching the convention used elsewhere.
export const formatAuditDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
