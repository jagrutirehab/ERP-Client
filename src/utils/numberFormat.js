// Rounds to 2 decimals as a number, clearing IEEE-754 noise like
// 769.9999999999999 from unit-conversion math (e.g. liquid-form stock).
export const roundTo2Decimals = (value) => Number((Number(value) || 0).toFixed(2));

// Same rounding, formatted for display as a string with trailing ".00" dropped
// (e.g. "4.7" instead of "4.70", "5" instead of "5.00").
export const formatTwoDecimals = (value) =>
    (Number(value) || 0).toFixed(2).replace(/\.00$/, "");
