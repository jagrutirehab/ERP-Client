// Salary unit conversion (client mirror of ERP-Server/src/utils/salaryUnit.js).
//
// HR enters salary on a YEARLY (CTC) basis. The forms keep yearly values; this
// helper derives the MONTHLY equivalents shown in the live preview and fed to
// calculatePayroll. The server performs the authoritative conversion on submit
// — this is display-only.
//
// Rule: each breakup component -> round(annual / 12); gross -> sum of the
// rounded breakup; other amounts -> round(annual / 12) individually.

export const BREAKUP_FIELDS = [
  "basicAmount",
  "HRAAmount",
  "SPLAllowance",
  "conveyanceAllowance",
  "statutoryBonus",
];

// Excluded on purpose:
//   - minimumWages: a MONTHLY statutory floor, stored/entered monthly.
//   - variable / reimbursement: pure YEARLY CTC-only add-ons, never split into
//     monthly — added directly to the yearly CTC and stored as-is.
export const OTHER_AMOUNT_FIELDS = [
  "insurance",
  "LWFSalary",
  "LWFEmployee",
  "LWFEmployer",
];

export const AMOUNT_FIELDS = [
  ...BREAKUP_FIELDS,
  "grossSalary",
  ...OTHER_AMOUNT_FIELDS,
];

const num = (v) => Number(v) || 0;

// Yearly values object -> monthly amounts. Gross is the sum of the rounded
// monthly breakup so it always matches the breakup total.
export const annualToMonthly = (annual = {}) => {
  const monthly = {};
  let grossSum = 0;

  for (const field of BREAKUP_FIELDS) {
    const value = Math.round(num(annual[field]) / 12);
    monthly[field] = value;
    grossSum += value;
  }
  monthly.grossSalary = grossSum;

  for (const field of OTHER_AMOUNT_FIELDS) {
    monthly[field] = Math.round(num(annual[field]) / 12);
  }

  return monthly;
};

// Monthly amounts -> yearly (exact ×12). Used to seed the form from records
// that only stored monthly values (saved before yearly entry existed).
export const monthlyToAnnual = (monthly = {}) => {
  const annual = {};
  let grossSum = 0;

  for (const field of BREAKUP_FIELDS) {
    const value = Math.round(num(monthly[field])) * 12;
    annual[field] = value;
    grossSum += value;
  }
  annual.grossSalary = grossSum;

  for (const field of OTHER_AMOUNT_FIELDS) {
    annual[field] = Math.round(num(monthly[field])) * 12;
  }

  return annual;
};

// Read a field's yearly value from a stored financeDetails object: prefer the
// persisted yearly snapshot, else fall back to monthly × 12.
export const annualFieldValue = (financeDetails, field) => {
  if (!financeDetails) return 0;
  if (financeDetails.annual && financeDetails.annual[field] !== undefined) {
    return num(financeDetails.annual[field]);
  }
  return Math.round(num(financeDetails[field])) * 12;
};

// Yearly gross to seed the form with. Gross is defined as the sum of the
// yearly breakup components, so seeding it independently (monthly gross × 12)
// can drift by a rupee or two from the breakup total and trip the
// "breakup must equal gross" check. Deriving it from the breakup keeps them
// consistent on load.
export const annualBreakupGross = (financeDetails) =>
  BREAKUP_FIELDS.reduce(
    (sum, field) => sum + annualFieldValue(financeDetails, field),
    0
  );
