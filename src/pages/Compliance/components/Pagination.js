import React from "react";
import { Pagination as RSPagination, PaginationItem, PaginationLink } from "reactstrap";

// Collapses to a page range with ellipses once there are more than a
// handful of pages, so this stays usable with hundreds of rows, not just 2-3.
function pageRange(page, pageCount) {
  const delta = 1;
  const range = [];
  for (let p = Math.max(1, page - delta); p <= Math.min(pageCount, page + delta); p++) {
    range.push(p);
  }
  if (range[0] > 1) {
    range.unshift(range[0] > 2 ? "…" : 1);
    if (range[0] !== 1) range.unshift(1);
  }
  if (range[range.length - 1] < pageCount) {
    if (range[range.length - 1] < pageCount - 1) range.push("…");
    range.push(pageCount);
  }
  return [...new Set(range)];
}

const Pagination = ({ page, pageCount, onChange, totalCount, pageSize }) => {
  if (totalCount === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalCount, page * pageSize);

  return (
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 mt-3">
      <span className="text-muted" style={{ fontSize: 13 }}>
        Showing {start}–{end} of {totalCount}
      </span>

      {pageCount > 1 && (
        <RSPagination size="sm" className="mb-0 flex-wrap">
          <PaginationItem disabled={page === 1}>
            <PaginationLink previous onClick={() => onChange(page - 1)} />
          </PaginationItem>

          {/* Full numbered range on larger screens */}
          <div className="d-none d-sm-flex">
            {pageRange(page, pageCount).map((p, idx) =>
              p === "…" ? (
                <PaginationItem disabled key={`ellipsis-${idx}`}>
                  <PaginationLink>…</PaginationLink>
                </PaginationItem>
              ) : (
                <PaginationItem active={p === page} key={p}>
                  <PaginationLink onClick={() => onChange(p)}>{p}</PaginationLink>
                </PaginationItem>
              ),
            )}
          </div>

          {/* Compact "page X of Y" on phones */}
          <PaginationItem disabled className="d-sm-none">
            <PaginationLink>
              {page} / {pageCount}
            </PaginationLink>
          </PaginationItem>

          <PaginationItem disabled={page === pageCount}>
            <PaginationLink next onClick={() => onChange(page + 1)} />
          </PaginationItem>
        </RSPagination>
      )}
    </div>
  );
};

export default Pagination;
