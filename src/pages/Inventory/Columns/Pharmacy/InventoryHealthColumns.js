import React from "react";
import moment from "moment";
import { capitalizeWords } from "../../../../utils/toCapitalize";

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

const transitLossCell = (row) => {
  const hasLoss = row.transitLoss > 0;
  const hasOverdue = row.overdueCount > 0;

  if (!hasLoss && !hasOverdue) {
    return <span className="text-muted">—</span>;
  }

  return (
    <div className="d-flex flex-column py-1 text-center" style={{ gap: 3, alignItems: "center" }}>
      {hasLoss && (
        <>
          <span className="fw-bold text-danger">
            -{row.transitLoss} {unitLabel(row.baseUnit)}
          </span>
          <span style={pill("#f8d7da", "#721c24")}>
            {row.transferCount} transfer{row.transferCount === 1 ? "" : "s"}
          </span>
        </>
      )}
      {hasOverdue && (
        <span style={pill("#fff3cd", "#856404")} title="Dispatched over a week ago, not yet received — still in transit, not confirmed loss">
          {row.overdueQty} {unitLabel(row.baseUnit)} Stuck In Transit ({row.overdueCount})
        </span>
      )}
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

const expiryCell = (row) => {
  const hasPending = row.expiredQty > 0;
  const hasDiscarded = row.discardCount > 0;
  const hasMissingExpiry = row.missingExpiry;

  if (!hasPending && !hasDiscarded && !hasMissingExpiry) {
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
            Discard Pending · {days} day{days === 1 ? "" : "s"} ago
          </span>
        </>
      )}
      {hasDiscarded && (
        <span style={pill("#e2e3e5", "#41464b")}>
          {row.discardedQty} {unitLabel(row.baseUnit)} Discarded ({row.discardCount})
        </span>
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

export const getInventoryHealthColumns = ({ openDetail } = {}) => [
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
    minWidth: "80px",
  },
  {
    name: <div>Center</div>,
    selector: (row) => row.center,
    cell: (row) => row.center || "—",
    wrap: true,
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
    cell: expiryCell,
    center: true,
    minWidth: "220px",
  },
  {
    name: <div>Details</div>,
    cell: (row) => (
      <button
        type="button"
        className="btn btn-sm btn-primary text-white"
        onClick={(e) => {
          e.stopPropagation();
          if (openDetail) openDetail(row);
        }}
      >
        View
      </button>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];
