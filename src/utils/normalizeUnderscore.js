export const normalizeUnderscores = (val) =>
  val ? val.replace(/_/g, " ") : "";