import { isBefore } from "date-fns";

export function isValidInterval(startDate, endDate, minDurationInMinutes) {
  // Check if end date is greater than or equal to start date
  if (isBefore(endDate, startDate)) {
    return false; // Invalid interval
  }
  return true;
}
