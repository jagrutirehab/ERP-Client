export const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");

export const ruleSummary = (rule) => {
  const cond = rule.targetBlocks?.[0]?.conditions?.[0];
  if (!cond) return "No conditions";
  return `${cond.model || "?"}.${cond.field || "?"} ${cond.operator || ""}`;
};
