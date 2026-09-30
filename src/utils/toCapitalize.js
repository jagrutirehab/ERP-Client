export function capitalizeWords(str) {
  if (typeof str !== "string" || !str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
