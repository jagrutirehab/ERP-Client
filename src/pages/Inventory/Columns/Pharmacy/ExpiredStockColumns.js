import React from "react";
import moment from "moment";
import { ExpandableText } from "../../../../Components/Common/ExpandableText";
import { capitalizeWords } from "../../../../utils/toCapitalize";

const expiryPill = (days) => {
  const base = {
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
  if (days >= 180) return { ...base, background: "#f8d7da", color: "#721c24" };
  if (days >= 30) return { ...base, background: "#ffe3cc", color: "#8a4b08" };
  return { ...base, background: "#fff3cd", color: "#856404" };
};

const medicineCell = (row) => {
  const name = row.medicineName || row.batch?.medicineName || "—";
  const strength = row.Strength || row.batch?.Strength;
  const type = row.medicine?.type;
  const generic = row.medicine?.genericName;
  const brand = row.medicine?.brandName;

  return (
    <div className="d-flex flex-column py-1 text-uppercase">
      <span className="fw-medium">
        {[type, name, strength].filter(Boolean).join(" ")}
      </span>
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

const batchCell = (phrId, batch) => (
  <div className="d-flex flex-column py-1">
    <span className="fw-medium text-primary">{phrId || "—"}</span>
    <span className="text-muted" style={{ fontSize: 11 }}>
      Batch: {batch || "—"}
    </span>
  </div>
);

export const getExpiredStockColumns = ({
  openDetail,
  handleDiscard,
  hasWritePermission,
} = {}) => [
  {
    name: <div>Medicine</div>,
    selector: (row) => row.medicineName,
    cell: medicineCell,
    wrap: true,
    minWidth: "230px",
  },
  {
    name: <div>PHR ID / Batch</div>,
    cell: (row) => batchCell(row.id, row.Batch),
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Expired On</div>,
    selector: (row) => row.expiryDate,
    sortable: true,
    cell: (row) => {
      if (!row.expiryDate) return "—";
      // expiryDate is anchored to UTC midnight of the labelled day, so read it
      // back in UTC — local formatting would shift it a day west of GMT.
      const expired = moment.utc(row.expiryDate);
      const days = moment.utc().startOf("day").diff(expired, "days");
      return (
        <div className="d-flex flex-column py-1" style={{ gap: 3 }}>
          <span className="fw-medium text-dark">
            {expired.format("DD MMM YYYY")}
          </span>
          <span style={expiryPill(days)}>
            {days} day{days === 1 ? "" : "s"} ago
          </span>
        </div>
      );
    },
    wrap: true,
    minWidth: "140px",
  },
  {
    name: <div>Center</div>,
    selector: (row) => row.center?.title,
    cell: (row) => row.center?.title || "—",
    wrap: true,
  },
  {
    name: <div>Stock to Discard</div>,
    selector: (row) => row.stock,
    sortable: true,
    cell: (row) => (
      <span className="fw-bold text-danger">
        {row.stock} {row.medicine?.baseUnit || ""}
      </span>
    ),
    center: true,
    minWidth: "130px",
  },
  {
    name: <div>Action</div>,
    cell: (row) => (
      <div className="d-flex align-items-center gap-1 flex-wrap">
        {hasWritePermission && (
          <button
            type="button"
            className="btn btn-sm btn-success text-white"
            onClick={(e) => {
              e.stopPropagation();
              if (handleDiscard) handleDiscard(row);
            }}
            title="Discard — removes this batch from the center's inventory"
          >
            <i className="bx bx-check" />
          </button>
        )}
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={(e) => {
            e.stopPropagation();
            if (openDetail) openDetail(row);
          }}
        >
          <i className="bx bx-show me-1" />
          Details
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: "170px",
  },
];

export const getExpiredStockHistoryColumns = () => [
  {
    name: <div>Discarded On</div>,
    selector: (row) => row.removedAt,
    sortable: true,
    cell: (row) => (
      <div className="d-flex flex-column text-muted py-2" style={{ fontSize: 13, gap: 2 }}>
        {row.removedAt ? (
          <>
            <span className="fw-medium text-dark">
              {moment(row.removedAt).format("DD MMM YYYY")}
            </span>
            <span style={{ fontSize: 11 }}>
              {moment(row.removedAt).format("hh:mm A")}
            </span>
          </>
        ) : (
          "—"
        )}
      </div>
    ),
    wrap: true,
    minWidth: "120px",
  },
  {
    name: <div>Medicine</div>,
    cell: (row) => medicineCell({ ...row, medicineName: row.batch?.medicineName, Strength: row.batch?.Strength }),
    wrap: true,
    minWidth: "230px",
  },
  {
    name: <div>PHR ID / Batch</div>,
    cell: (row) => batchCell(row.batch?.id, row.batch?.Batch),
    wrap: true,
    minWidth: "150px",
  },
  {
    name: <div>Expiry</div>,
    cell: (row) =>
      row.batch?.expiryDate
        ? moment.utc(row.batch.expiryDate).format("DD MMM YYYY")
        : row.batch?.Expiry || "—",
    wrap: true,
    minWidth: "120px",
  },
  {
    name: <div>Center</div>,
    selector: (row) => row.center?.title,
    cell: (row) => row.center?.title || "—",
    wrap: true,
  },
  {
    name: <div>Qty Discarded</div>,
    selector: (row) => row.removedQty,
    cell: (row) => (
      <span className="fw-bold text-danger">
        {row.removedQty} {row.medicine?.baseUnit || ""}
      </span>
    ),
    center: true,
    minWidth: "120px",
  },
  {
    name: <div>Discarded By</div>,
    selector: (row) => row.removedBy?.name,
    cell: (row) => capitalizeWords(row.removedBy?.name) || "—",
    wrap: true,
  },
  {
    name: <div>Remarks</div>,
    cell: (row) => <ExpandableText text={capitalizeWords(row.remarks) || "—"} />,
    wrap: true,
    minWidth: "150px",
  },
];
