export const timeAgo = (date) => {
  if (!date) return "";
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

export const dateLabel = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown";
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (dayStart === todayStart) return "Today";
  if (dayStart === todayStart - 86400000) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

// An alert with no `source` predates the field and is rule-sourced.
export const isRuleSourced = (a) => !a?.source || a.source === "SOP_RULE";

/**
 * What to show in the alert's "Source" column.
 *
 * The "(deleted rule)" fallback survives, but only for alerts that genuinely
 * ARE rule-sourced and lost their rule. A baseline-package alert never had one,
 * so showing "(deleted rule)" for it would be factually wrong — nothing was
 * deleted. The server already falls `rule.ruleName` back to `sourceLabel`; this
 * covers the case where it didn't.
 */
export const alertSourceLabel = (a) =>
  a?.rule?.ruleName || a?.sourceLabel || (isRuleSourced(a) ? "(deleted rule)" : "—");
