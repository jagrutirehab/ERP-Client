export const DEFAULT_PASS_MARK = 80;
export const MIN_PASS_MARK = 10;
export const MAX_PASS_MARK = 100;
export const PASS_MARK_STEP = 5;

export const PASS_MARK_OPTIONS = Array.from(
  { length: (MAX_PASS_MARK - MIN_PASS_MARK) / PASS_MARK_STEP + 1 },
  (_, index) => MIN_PASS_MARK + index * PASS_MARK_STEP,
);

export const PASS_MARK_SELECT_OPTIONS = PASS_MARK_OPTIONS.map((option) => ({
  value: String(option),
  label: String(option),
}));

const isValidPassMark = (value) =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= MIN_PASS_MARK &&
  value <= MAX_PASS_MARK &&
  value % PASS_MARK_STEP === 0;

export const normalizePassMark = (value) =>
  isValidPassMark(value) ? value : DEFAULT_PASS_MARK;

export const resolvePassMark = (training) => normalizePassMark(training?.passPercentage);

export const parsePassMarkText = (text) => {
  const value = String(text ?? "").trim();
  return /^\d{1,3}$/.test(value) && isValidPassMark(Number(value)) ? Number(value) : null;
};
