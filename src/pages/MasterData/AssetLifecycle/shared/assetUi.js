import React, { useCallback, useRef, useState } from "react";

// Small helpers shared by the asset lifecycle screens (scans, tags, register).

export const DASH = "—";

// Who a verification job is assigned to: the ERP user when there is one, otherwise the name HiSYNC gave
// (shown with a small "(HiSYNC)"), otherwise a dash.
export const assigneeText = (job) =>
  job?.assignedToId?.name || (job?.externalAssignedTo?.name ? `${job.externalAssignedTo.name} (HiSYNC)` : DASH);

export const AssignedName = ({ job }) => {
  const erp = job?.assignedToId?.name;
  if (erp) return <>{erp}</>;
  const ext = job?.externalAssignedTo?.name;
  if (ext) return <>{ext} <span className="text-muted" style={{ fontSize: 11 }}>(HiSYNC)</span></>;
  return <>{DASH}</>;
};

export const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : DASH);
export const dateTimeFmt = (d) => (d ? new Date(d).toLocaleString("en-IN") : DASH);

// An empty cost / depreciation / net book value is shown as a dash, never as 0
export const moneyOrDash = (n) =>
  n === null || n === undefined || n === "" || Number.isNaN(Number(n))
    ? DASH
    : `₹${Number(n).toLocaleString("en-IN")}`;

// Old placeholder chip numbers (EPC-PENDING-...) are shown as a dash. The data is not changed.
export const chipText = (v) => (!v || String(v).startsWith("EPC-PENDING") ? DASH : v);

// The server's own message. Raw technical text (network errors, database words) is never shown.
const TECHNICAL = /status code \d|network error|timeout of|E11000|MongoServerError|MongooseError|ECONN|\[object|^\s*(undefined|null)\s*$|\bat \S+\.js/i;
export const errText = (error, fallback = "Something went wrong. Please try again.") => {
  const m = error?.response?.data?.message || error?.message;
  if (typeof m !== "string" || !m.trim() || TECHNICAL.test(m) || m.length > 300) return fallback;
  return m;
};

// One click = one request. The ref is checked at once, so a very fast double click cannot slip a
// second request in before the screen has re-drawn.
export const useBusy = () => {
  const ref = useRef(false);
  const [busy, setBusy] = useState(false);
  const run = useCallback(async (fn) => {
    if (ref.current) return undefined;
    ref.current = true;
    setBusy(true);
    try {
      return await fn();
    } finally {
      ref.current = false;
      setBusy(false);
    }
  }, []);
  return [busy, run];
};

// Saves a downloaded file (axios response with a Blob in .data)
export const saveBlob = (response, filename) => {
  const blob = response?.data instanceof Blob ? response.data : new Blob([response?.data]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// ---------- scan status ----------
export const SCAN_STATUS = {
  pending: { label: "New (waiting for review)", cls: "status-draft" },
  verified: { label: "Verified", cls: "status-active" },
  rejected: { label: "Rejected", cls: "status-blacklisted" },
  halted: { label: "Halted", cls: "status-inactive" },
};

export const ScanStatusPill = ({ status }) => {
  const s = SCAN_STATUS[status] || SCAN_STATUS.pending;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

export const TAG_STATUS_LABEL = { new: "New", old_plus_new: "Old + New", existing: "Existing" };

// "Furniture › Chairs › Office chair"
export const categoryPath = (row) =>
  [row?.categoryL1, row?.categoryL2, row?.categoryL3, row?.categoryL4]
    .map((c) => c?.name)
    .filter(Boolean)
    .join(" › ") || DASH;
