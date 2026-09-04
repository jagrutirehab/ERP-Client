const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Recordings cannot predate the system by any sensible margin; anything earlier
// is a typo in a manually entered year.
const MIN_DATE = "2000-01-01";

// How many days back from today the date pickers open on. 2 starts the range
// the day before yesterday, so it covers three calendar days including today.
export const DEFAULT_RANGE_DAYS = 2;

const pad = (n) => String(n).padStart(2, "0");

/**
 * A Date as the value a native <input type="date"> expects.
 *
 * Built from the local date parts on purpose — toISOString() converts to UTC
 * first, which in IST (+5:30) reports yesterday for the whole evening.
 */
const toInputValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayInputValue = () => toInputValue(new Date());

/** N days back from today. setDate rolls over month and year boundaries. */
export const daysAgoInputValue = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toInputValue(date);
};

/**
 * The range the filters start on: DEFAULT_RANGE_DAYS back from today, through
 * today.
 */
export const defaultDateRange = () => ({
  fromDate: daysAgoInputValue(DEFAULT_RANGE_DAYS),
  toDate: todayInputValue(),
});

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isLeapYear = (year) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * Rejects both malformed input and impossible calendar dates like 2026-02-31.
 *
 * Checked arithmetically rather than by round-tripping through Date, which maps
 * years 0–99 to 1900–1999 — a typed "0002-01-01" would come back as 1902 and
 * pass as real.
 */
export const isRealDate = (value) => {
  if (!ISO_DATE.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);

  if (month < 1 || month > 12 || day < 1) return false;

  const maxDay =
    month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];

  return day <= maxDay;
};

/**
 * Validate a From/To pair. Returns "" when the range is usable, otherwise the
 * message to show.
 *
 * Compared as plain strings: YYYY-MM-DD sorts chronologically, and it is the
 * same shape Call_Date is stored and queried in on the server.
 */
export const validateDateRange = (fromDate, toDate) => {
  const today = todayInputValue();

  if (fromDate && !isRealDate(fromDate)) return "From date is not a valid date.";
  if (toDate && !isRealDate(toDate)) return "To date is not a valid date.";

  if (fromDate && fromDate > today) return "From date cannot be in the future.";
  if (toDate && toDate > today) return "To date cannot be in the future.";

  if (fromDate && fromDate < MIN_DATE) return "From date is too far in the past.";
  if (toDate && toDate < MIN_DATE) return "To date is too far in the past.";

  if (fromDate && toDate && fromDate > toDate) {
    return "From date cannot be after the To date.";
  }

  return "";
};
