export const normalizeStatus = (status) => {
  if (!status) return "-";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};