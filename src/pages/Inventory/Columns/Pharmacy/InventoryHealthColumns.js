import React from "react";
import moment from "moment";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { formatCurrency } from "../../../../utils/formatCurrency";

const pill = (bg, color) => ({
  borderRadius: 20,
  padding: "2px 10px",
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: "nowrap",
});

const unitLabel = (baseUnit) => (baseUnit ? `${capitalizeWords(baseUnit)}(s)` : "");

const medicineCell = (row) => {
  if (row.batchDeleted) {
    return (
      <div className="d-flex flex-column py-1">
        <span className="fw-medium text-muted" title="This batch's record was removed from inventory after this event happened — the event itself is still real">
          Batch deleted
        </span>
      </div>
    );
  }

  const name = row.medicineName || "—";
  const strength = row.Strength;
  const type = row.type;
  const generic = row.genericName;
  const brand = row.brandName;

  return (
    <div className="d-flex flex-column py-1 text-uppercase">
      <span className="fw-medium">{[type, name, strength].filter(Boolean).join(" ")}</span>
      {(generic || brand) && (
        <span className="text-muted" style={{ fontSize: 11 }}>
          {generic && <span>{generic}</span>}
          {generic && brand && <span className="mx-1">·</span>}
          {brand && <span>{brand}</span>}
        </span>
      )}
    </div>
  );
};

const batchCell = (phrId, batch, batchDeleted) => (
  <div className="d-flex flex-column py-1">
    <span className="fw-medium text-primary">{batchDeleted ? "—" : phrId || "—"}</span>
    <span className="text-muted" style={{ fontSize: 11 }}>
      Batch: {batchDeleted ? "—" : batch || "—"}
    </span>
  </div>
);

// Dispatched, not yet received — still genuinely in transit. Deliberately
// separate from confirmed loss: nothing is lost here, it just hasn't arrived
// yet, however recently it was sent.
const inTransitCell = (row) => {
  if (!row.inTransitCount) {
    return <span className="text-muted">—</span>;
  }
  return (
    <div className="d-flex flex-column py-1 text-center" style={{ gap: 3, alignItems: "center" }}>
      <span className="fw-bold text-warning" style={{ whiteSpace: "nowrap" }}>
        {row.inTransitQty} {unitLabel(row.baseUnit)}
      </span>
      <span
        style={pill("#fff3cd", "#856404")}
        title="Dispatched, not yet received — still in transit, not confirmed loss"
      >
        {row.inTransitCount} transfer{row.inTransitCount === 1 ? "" : "s"}
      </span>
    </div>
  );
};

// Confirmed loss only — dispatchedQty vs. what the receiving center actually
// logged as received, once the transfer closed out (partially or fully).
const transitLossCell = (row) => {
  if (!row.transitLoss) {
    return <span className="text-muted">—</span>;
  }
  return (
    <div className="d-flex flex-column py-1 text-center" style={{ gap: 3, alignItems: "center" }}>
      <span className="fw-bold text-danger">
        -{row.transitLoss} {unitLabel(row.baseUnit)}
      </span>
      <span style={pill("#f8d7da", "#721c24")}>
        {row.transferCount} transfer{row.transferCount === 1 ? "" : "s"}
      </span>
    </div>
  );
};

const varianceCell = (row) => {
  if (!row.auditCount) {
    return <span className="text-muted">—</span>;
  }
  const isShrinkage = row.variance < 0;
  const isOverage = row.variance > 0;
  return (
    <div className="d-flex flex-column py-1 text-center" style={{ gap: 3, alignItems: "center" }}>
      <span
        className={`fw-bold ${isShrinkage ? "text-danger" : isOverage ? "text-success" : "text-muted"
          }`}
      >
        {row.variance > 0 ? `+${row.variance}` : row.variance} {unitLabel(row.baseUnit)}
      </span>
      <span style={pill(isShrinkage ? "#f8d7da" : "#d4edda", isShrinkage ? "#721c24" : "#155724")}>
        {row.auditCount} audit{row.auditCount === 1 ? "" : "s"}
      </span>
    </div>
  );
};

// After transit loss, audit variance, and already-discarded stock are all
// netted against each other — the one number that answers "how much did
// this batch actually waste, on balance." Pending expiry is deliberately
// excluded: it isn't wasted yet, it's still in stock and still usable if
// caught before it's discarded.
const netValue = (row) => (row.variance || 0) - (row.transitLoss || 0) - (row.discardedQty || 0);

const netCell = (row) => {
  const hasAnyInput = row.transitLoss > 0 || row.auditCount > 0 || row.discardCount > 0;
  if (!hasAnyInput) {
    return <span className="text-muted">—</span>;
  }
  const net = netValue(row);
  const isWaste = net < 0;
  const isGain = net > 0;
  return (
    <span
      className={`fw-bold ${isWaste ? "text-danger" : isGain ? "text-success" : "text-muted"}`}
      style={{ whiteSpace: "nowrap" }}
      title="Variance − Transit Loss − Discarded — the net effect of everything combined, excluding stock still pending discard"
    >
      {net > 0 ? `+${net}` : net} {unitLabel(row.baseUnit)}
    </span>
  );
};

const pendingExpiryCell = (row) => {
  const hasPending = row.expiredQty > 0;
  const hasMissingExpiry = row.missingExpiry;

  if (!hasPending && !hasMissingExpiry) {
    return <span className="text-muted">—</span>;
  }

  const days = hasPending
    ? moment.utc().startOf("day").diff(moment.utc(row.expiryDate), "days")
    : null;

  return (
    <div className="d-flex flex-column py-1 text-center" style={{ gap: 3, alignItems: "center" }}>
      {hasPending && (
        <>
          <span className="fw-bold text-danger" style={{ whiteSpace: "nowrap" }}>
            {row.expiredQty} {unitLabel(row.baseUnit)}
          </span>
          <span style={pill("#ffe3cc", "#8a4b08")}>
            {days} day{days === 1 ? "" : "s"} ago
          </span>
        </>
      )}
      {hasMissingExpiry && (
        <span
          style={pill("#e2e3e5", "#495057")}
          title="This batch has no parseable expiry date on record, so it can never be flagged as expired automatically"
        >
          No expiry date
        </span>
      )}
    </div>
  );
};

const discardedExpiryCell = (row) => {
  if (!row.discardCount) {
    return <span className="text-muted">—</span>;
  }
  return (
    <div className="d-flex flex-column py-1 text-center" style={{ gap: 3, alignItems: "center" }}>
      <span className="fw-bold text-dark" style={{ whiteSpace: "nowrap" }}>
        {row.discardedQty} {unitLabel(row.baseUnit)}
      </span>
      <span style={pill("#e2e3e5", "#41464b")}>
        {row.discardCount} removal{row.discardCount === 1 ? "" : "s"}
      </span>
    </div>
  );
};

export const getInventoryHealthColumns = () => [
  {
    name: <div>Medicine</div>,
    selector: (row) => row.medicineName,
    cell: medicineCell,
    wrap: true,
    minWidth: "200px",
  },
  {
    name: <div>PHR ID / Batch</div>,
    cell: (row) => batchCell(row.id, row.Batch, row.batchDeleted),
    wrap: true,
    minWidth: "120px",
  },
  {
    name: <div>Center</div>,
    selector: (row) => row.center,
    cell: (row) => row.center || "—",
    wrap: true,
  },
  {
    name: <div>Net</div>,
    selector: netValue,
    sortable: true,
    cell: netCell,
    center: true,
    minWidth: "110px",
  },
  {
    name: <div>In Transit</div>,
    selector: (row) => row.inTransitQty,
    sortable: true,
    cell: inTransitCell,
    center: true,
    minWidth: "120px",
  },
  {
    name: <div>Transit Loss</div>,
    selector: (row) => row.transitLoss,
    sortable: true,
    cell: transitLossCell,
    center: true,
    minWidth: "120px",
  },
  {
    name: <div>Variance</div>,
    selector: (row) => row.variance,
    sortable: true,
    cell: varianceCell,
    center: true,
    minWidth: "150px",
  },
  {
    name: <div>Expired Stock</div>,
    selector: (row) => row.expiredQty,
    sortable: true,
    cell: pendingExpiryCell,
    center: true,
    minWidth: "180px",
  },
  {
    name: <div>Expired Stock Discarded</div>,
    selector: (row) => row.discardedQty,
    sortable: true,
    cell: discardedExpiryCell,
    center: true,
    minWidth: "160px",
  },
];

// ---------------------------------------------------------------------------
// Detailed view: same rows as the summary, but instead of one summed total
// per metric, every individual transfer/audit/discard that fed into that
// total gets its own column (Transfer 1, Transfer 2, Audit 1...). The column
// count is derived from whichever row on the current page has the most of
// that event type — rows with fewer just show "—" in the columns past their
// own count.
// ---------------------------------------------------------------------------

// One line per event: a signed number (− for loss/discard, + for overage,
// plain for pending) plus the unit. Everything else that used to be a
// second/third line (requisition #, remarks, exact date) moves into the
// hover title instead of taking up visible space.
const transferDetailCell = (entry, baseUnit) => {
  if (!entry) return <span className="text-muted">—</span>;

  const title = [
    entry.requisitionNumber,
    entry.date ? moment(entry.date).format("DD MMM YYYY") : null,
    (entry.status || "").replace(/_/g, " "),
    unitLabel(baseUnit),
  ]
    .filter(Boolean)
    .join(" · ");

  if (entry.status === "DISPATCHED") {
    return (
      <span title={title}>
        <span className="fw-bold text-warning">→{entry.dispatchedQty}</span>
        {compactSub(unitLabel(baseUnit))}
      </span>
    );
  }

  const delta = -(entry.loss || 0);
  return (
    <span title={title}>
      <span className={`fw-bold ${delta < 0 ? "text-danger" : "text-muted"}`}>
        {delta === 0 ? "0" : delta}
      </span>
      {compactSub(unitLabel(baseUnit))}
    </span>
  );
};

const auditDetailCell = (entry, baseUnit) => {
  if (!entry) return <span className="text-muted">—</span>;
  const isShrinkage = entry.variance < 0;
  const isOverage = entry.variance > 0;
  const title = [
    entry.auditDate ? moment(entry.auditDate).format("DD MMM YYYY") : null,
    `${entry.oldStock} → ${entry.newStock} ${unitLabel(baseUnit)}`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <span title={title}>
      <span className={`fw-bold ${isShrinkage ? "text-danger" : isOverage ? "text-success" : "text-muted"}`}>
        {entry.variance > 0 ? `+${entry.variance}` : entry.variance}
      </span>
      {compactSub(unitLabel(baseUnit))}
    </span>
  );
};

const discardDetailCell = (entry, baseUnit) => {
  if (!entry) return <span className="text-muted">—</span>;
  const title = [
    entry.date ? moment(entry.date).format("DD MMM YYYY") : null,
    entry.remarks,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <span title={title}>
      <span className="fw-bold text-danger">-{entry.removedQty}</span>
      {compactSub(unitLabel(baseUnit))}
    </span>
  );
};

// Compact single-line versions of the Summary tab's medicine/batch cells —
// for the dense MI-style grid, used via CompactDataGrid's `render`, not
// react-data-table-component's `cell`.
const compactMedicineCell = (row) => {
  if (row.batchDeleted) return <span className="text-muted">Batch deleted</span>;
  const title = [row.genericName, row.brandName].filter(Boolean).join(" · ");
  return (
    <span className="text-uppercase" title={title || undefined}>
      {[row.type, row.medicineName, row.Strength].filter(Boolean).join(" ")}
    </span>
  );
};

const compactBatchCell = (row) => {
  if (row.batchDeleted) return <span className="text-muted">—</span>;
  return (
    <span>
      <span className="fw-bold text-primary">{row.id || "—"}</span>
      {row.Batch ? ` / ${row.Batch}` : ""}
    </span>
  );
};

// Compact summary metric cells — same numbers as the padded card-style cells
// above, but the value and its count/days-ago badge sit side by side on one
// line (not stacked, not just in a hover title) so the detail stays visible
// while the row stays short enough for CompactDataGrid.
const compactSub = (text) => (
  <span className="text-muted" style={{ fontSize: 10, marginLeft: 4 }}>
    {text}
  </span>
);

const compactNetCell = (row) => {
  const hasAnyInput = row.transitLoss > 0 || row.auditCount > 0 || row.discardCount > 0;
  if (!hasAnyInput) return <span className="text-muted">—</span>;
  const net = netValue(row);
  const isWaste = net < 0;
  const isGain = net > 0;
  return (
    <span title="Variance − Transit Loss − Discarded">
      <span className={`fw-bold ${isWaste ? "text-danger" : isGain ? "text-success" : "text-muted"}`}>
        {net > 0 ? `+${net}` : net}
      </span>
      {compactSub(unitLabel(row.baseUnit))}
    </span>
  );
};

const compactInTransitCell = (row) => {
  if (!row.inTransitCount) return <span className="text-muted">—</span>;
  return (
    <span>
      <span className="fw-bold text-warning">{row.inTransitQty}</span>
      {compactSub(unitLabel(row.baseUnit))}
      {compactSub(`${row.inTransitCount} transfer${row.inTransitCount === 1 ? "" : "s"}`)}
    </span>
  );
};

const compactTransitLossCell = (row) => {
  if (!row.transitLoss) return <span className="text-muted">—</span>;
  return (
    <span>
      <span className="fw-bold text-danger">-{row.transitLoss}</span>
      {compactSub(unitLabel(row.baseUnit))}
      {compactSub(`${row.transferCount} transfer${row.transferCount === 1 ? "" : "s"}`)}
    </span>
  );
};

const compactVarianceCell = (row) => {
  if (!row.auditCount) return <span className="text-muted">—</span>;
  const isShrinkage = row.variance < 0;
  const isOverage = row.variance > 0;
  return (
    <span>
      <span className={`fw-bold ${isShrinkage ? "text-danger" : isOverage ? "text-success" : "text-muted"}`}>
        {row.variance > 0 ? `+${row.variance}` : row.variance}
      </span>
      {compactSub(unitLabel(row.baseUnit))}
      {compactSub(`${row.auditCount} audit${row.auditCount === 1 ? "" : "s"}`)}
    </span>
  );
};

const compactPendingExpiryCell = (row) => {
  const hasPending = row.expiredQty > 0;
  const hasMissingExpiry = row.missingExpiry;
  if (!hasPending && !hasMissingExpiry) return <span className="text-muted">—</span>;
  if (hasPending) {
    const days = moment.utc().startOf("day").diff(moment.utc(row.expiryDate), "days");
    return (
      <span>
        <span className="fw-bold text-danger">{row.expiredQty}</span>
        {compactSub(unitLabel(row.baseUnit))}
        {compactSub(`${days} day${days === 1 ? "" : "s"} ago`)}
      </span>
    );
  }
  return (
    <span className="text-muted" title="No parseable expiry date on record">
      No expiry date
    </span>
  );
};

const compactDiscardedExpiryCell = (row) => {
  if (!row.discardCount) return <span className="text-muted">—</span>;
  return (
    <span>
      <span className="fw-bold text-dark">{row.discardedQty}</span>
      {compactSub(`${unitLabel(row.baseUnit)} removed`)}
    </span>
  );
};

const lossCell = (value) => (
  <span className={`fw-bold ${value < 0 ? "text-danger" : value > 0 ? "text-success" : ""}`}>
    {formatCurrency(value)}
  </span>
);

const moneyColumns = [
  { key: "mrp", header: "MRP", align: "right", minWidth: 80, render: (row) => formatCurrency(row.mrp) },
  { key: "lossAtMrp", header: "Loss @ MRP", align: "right", minWidth: 100, render: (row) => lossCell(row.lossAtMrp) },
  { key: "purchasePrice", header: "Purchase Price", align: "right", minWidth: 100, render: (row) => formatCurrency(row.purchasePrice) },
  { key: "lossAtPurchase", header: "Loss @ Purchase Price", align: "right", minWidth: 110, render: (row) => lossCell(row.lossAtPurchase) },
];

export const getInventoryHealthSummaryGridColumns = () => [
  { key: "medicine", header: "Medicine", minWidth: 170, render: compactMedicineCell },
  { key: "batch", header: "PHR / Batch", minWidth: 100, render: compactBatchCell },
  { key: "center", header: "Center", minWidth: 90, render: (row) => row.center || "—" },
  { key: "net", header: "Net", align: "right", minWidth: 70, render: compactNetCell },
  ...moneyColumns,
  { key: "inTransit", header: "In Transit", align: "right", minWidth: 90, render: compactInTransitCell },
  { key: "transitLoss", header: "Transit Loss", align: "right", minWidth: 95, render: compactTransitLossCell },
  { key: "variance", header: "Variance", align: "right", minWidth: 90, render: compactVarianceCell },
  { key: "expired", header: "Expired", align: "right", minWidth: 85, render: compactPendingExpiryCell },
  { key: "discarded", header: "Discarded", align: "right", minWidth: 85, render: compactDiscardedExpiryCell },
];

// Column definitions for CompactDataGrid (key/header/align/render), not
// react-data-table-component's shape — same rows as the Summary tab, but
// every individual transfer/audit/discard gets its own narrow column
// (T1, T2, A1...) instead of one summed total. Column count comes from the
// backend's maxEventCounts (computed over the WHOLE filtered result set),
// not from whichever rows happen to be on the current page — a page's rows
// are sorted by combined severity, not by event count, so the busiest row
// for any one event type can easily land on a different page than page 1,
// and deriving counts per-page would silently drop columns for it.
export const getInventoryHealthDetailedGridColumns = (
  maxEventCounts = { transfers: 0, audits: 0, discards: 0 }
) => {
  const { transfers: maxTransfers = 0, audits: maxAudits = 0, discards: maxDiscards = 0 } =
    maxEventCounts;

  const baseColumns = [
    { key: "medicine", header: "Medicine", minWidth: 170, render: compactMedicineCell },
    { key: "batch", header: "PHR / Batch", minWidth: 100, render: compactBatchCell },
    { key: "center", header: "Center", minWidth: 90, render: (row) => row.center || "—" },
    ...moneyColumns,
  ];

  const transferColumns = Array.from({ length: maxTransfers }, (_, i) => ({
    key: `transfer-${i}`,
    header: `Transfer ${i + 1}`,
    align: "right",
    minWidth: 100,
    render: (row) => transferDetailCell(row.transferHistory?.[i], row.transferHistory?.[i]?.baseUnit || row.baseUnit),
  }));

  const auditColumns = Array.from({ length: maxAudits }, (_, i) => ({
    key: `audit-${i}`,
    header: `Audit ${i + 1}`,
    align: "right",
    minWidth: 100,
    render: (row) => auditDetailCell(row.auditHistory?.[i], row.baseUnit),
  }));

  const pendingExpiryColumn = {
    key: "expired",
    header: "Expired (Discard Pending)",
    align: "right",
    minWidth: 100,
    render: compactPendingExpiryCell,
  };

  const discardColumns = Array.from({ length: maxDiscards }, (_, i) => ({
    key: `discard-${i}`,
    header: `Discard ${i + 1}`,
    align: "right",
    minWidth: 100,
    render: (row) => discardDetailCell(row.discardHistory?.[i], row.baseUnit),
  }));

  return [...baseColumns, ...transferColumns, ...auditColumns, pendingExpiryColumn, ...discardColumns];
};
