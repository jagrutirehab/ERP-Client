/**
 * Format a leave-day figure for display.
 *
 * Leave balances are genuinely fractional — festive and earned accrue a twelfth
 * of the annual entitlement each month — and the auto-deduction cron can leave
 * float residue behind, so a stored balance may look like
 * `-0.8200000000000003` or `3.8399999999999999`.
 *
 * Shows at most two decimals and drops trailing zeros, so whole numbers stay
 * clean: 4 -> "4", 3.84 -> "3.84", -0.8200000000000003 -> "-0.82".
 */
export const formatLeaveDays = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;

  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;

  // Number() strips the trailing zeros toFixed adds ("4.00" -> 4).
  return String(Number(n.toFixed(2)));
};

/** Same, but renders 0 rather than a dash when the value is missing. */
export const formatLeaveDaysZero = (value) => formatLeaveDays(value, "0");
