/**
 * Helper to handle null, undefined, or empty string values
 * Returns a dash "-" if the value is not "truthy" in the context of displayable text.
 * 
 * @param {any} v - The value to display
 * @returns {any} - The original value or "-"
 */
export const display = (v) => (v === undefined || v === null || v === "" ? "-" : v);
