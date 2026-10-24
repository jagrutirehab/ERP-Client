import React from "react";

// Mirrors src/pages/Inventory/Components/CompactDataGrid.js's pagination
// footer, so this matrix table and the pharmacy/inventory grids look and
// behave the same way.
const buildPageRange = (totalPages, current, maxButtons = 7) => {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const sideButtons = Math.floor((maxButtons - 3) / 2);
  let start = Math.max(2, current - sideButtons);
  let end = Math.min(totalPages - 1, current + sideButtons);
  if (current - 1 <= sideButtons) {
    start = 2;
    end = Math.min(totalPages - 1, maxButtons - 2);
  }
  if (totalPages - current <= sideButtons) {
    end = totalPages - 1;
    start = Math.max(2, totalPages - (maxButtons - 3));
  }

  const range = [1];
  if (start > 2) range.push("...");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPages - 1) range.push("...");
  range.push(totalPages);
  return range;
};

const pageBtnStyle = (active) => ({
  minWidth: 26,
  height: 26,
  padding: "0 4px",
  fontSize: 12,
  lineHeight: "24px",
  borderRadius: 4,
  border: "1px solid " + (active ? "#0d6efd" : "#dee2e6"),
  background: active ? "#0d6efd" : "#fff",
  color: active ? "#fff" : "#495057",
  fontWeight: active ? 700 : 400,
  cursor: active ? "default" : "pointer",
});

const Pagination = ({ page, pageCount, onChange, totalCount, pageSize }) => {
  if (totalCount === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalCount, page * pageSize);

  return (
    <div
      className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2"
      style={{ fontSize: 12 }}
    >
      <div className="text-muted">
        {start}–{end} of {totalCount}
      </div>

      {pageCount > 1 && (
        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            style={pageBtnStyle(false)}
            disabled={page <= 1}
            onClick={() => onChange(1)}
            title="First page"
          >
            «
          </button>
          <button
            type="button"
            style={pageBtnStyle(false)}
            disabled={page <= 1}
            onClick={() => onChange(Math.max(1, page - 1))}
            title="Previous page"
          >
            ‹
          </button>

          {buildPageRange(pageCount, page).map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="text-muted px-1">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                style={pageBtnStyle(p === page)}
                onClick={() => onChange(p)}
                disabled={p === page}
              >
                {p}
              </button>
            ),
          )}

          <button
            type="button"
            style={pageBtnStyle(false)}
            disabled={page >= pageCount}
            onClick={() => onChange(Math.min(pageCount, page + 1))}
            title="Next page"
          >
            ›
          </button>
          <button
            type="button"
            style={pageBtnStyle(false)}
            disabled={page >= pageCount}
            onClick={() => onChange(pageCount)}
            title="Last page"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
