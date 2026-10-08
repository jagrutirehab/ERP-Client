export const STATUS_STYLES = {
  not_started: { label: "Not started", color: "#4b5563", background: "#f3f4f6", bar: "#9ca3af" },
  started: { label: "Started", color: "#0369a1", background: "#e0f2fe", bar: "#38bdf8" },
  in_lessons: { label: "In lessons", color: "#1d4ed8", background: "#dbeafe", bar: "#3b82f6" },
  quiz_ready: { label: "Ready for quiz", color: "#4338ca", background: "#e0e7ff", bar: "#6366f1" },
  quiz_retrying: { label: "Quiz retrying", color: "#b45309", background: "#fef3c7", bar: "#f59e0b" },
  final_exam: { label: "Final exam", color: "#7e22ce", background: "#f3e8ff", bar: "#a855f7" },
  pending_ack: { label: "Pending acknowledgement", color: "#0f766e", background: "#ccfbf1", bar: "#14b8a6" },
  acknowledged: { label: "Acknowledged", color: "#15803d", background: "#dcfce7", bar: "#22c55e" },
  did_not_complete: { label: "Did not complete", color: "#b91c1c", background: "#fee2e2", bar: "#ef4444" },
};

export const STATUS_FILTERS = [
  "all",
  "started",
  "in_lessons",
  "quiz_ready",
  "quiz_retrying",
  "final_exam",
  "pending_ack",
  "acknowledged",
];

export const PAST_STATUS_FILTERS = ["all", "did_not_complete", "acknowledged"];

export const getAudienceLabels = (item) =>
  item?.positionNames?.length > 0 ? item.positionNames : item?.roles || [];

export const getStatusStyle = (status) =>
  STATUS_STYLES[status] || STATUS_STYLES.not_started;

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : "—";

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "—";

export const formatRelative = (value, now = Date.now()) => {
  if (!value) return "—";
  const seconds = Math.max(Math.round((now - new Date(value).getTime()) / 1000), 0);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return formatDate(value);
};

export const formatBytes = (bytes = 0) => {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const formatDuration = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
};

export const getFileNameFromHeaders = (headers, fallback) => {
  const disposition = headers?.["content-disposition"] || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : fallback;
};
