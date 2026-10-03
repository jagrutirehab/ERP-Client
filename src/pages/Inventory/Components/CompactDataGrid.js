import { Spinner } from "reactstrap";

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

const CompactDataGrid = ({
  columns,
  data,
  loading,
  page,
  setPage,
  limit,
  setLimit,
  total = 0,
  keyField = "id",
  noDataComponent = "No records found",
  rowsPerPageOptions = [10, 25, 50, 100],
  minBodyHeight = 420,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="d-flex flex-column h-100">
      <div
        className="flex-grow-1"
        style={{
          overflow: "auto",
          border: "1px solid #dee2e6",
          position: "relative",
          minHeight: minBodyHeight,
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: 11,
            lineHeight: 1.3,
          }}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  title={col.title}
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    background: "#f1f3f5",
                    borderBottom: "2px solid #dee2e6",
                    borderRight: "1px solid #e9ecef",
                    padding: "4px 6px",
                    textAlign: col.align || "left",
                    whiteSpace: "nowrap",
                    minWidth: col.minWidth || 70,
                    fontWeight: 700,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  <Spinner size="sm" className="text-primary" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">
                  {noDataComponent}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row[keyField] ?? rowIdx} style={{ background: rowIdx % 2 ? "#fafbfc" : "#fff" }}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        borderBottom: "1px solid #eee",
                        borderRight: "1px solid #f1f3f5",
                        padding: "3px 6px",
                        textAlign: col.align || "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 px-1" style={{ fontSize: 12 }}>
        <div className="text-muted">
          {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
        </div>
        <div className="d-flex align-items-center gap-1">
          <select
            className="form-select form-select-sm me-1"
            style={{ width: 80, fontSize: 12 }}
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {rowsPerPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            type="button"
            style={pageBtnStyle(false)}
            disabled={page <= 1}
            onClick={() => setPage(1)}
            title="First page"
          >
            «
          </button>
          <button
            type="button"
            style={pageBtnStyle(false)}
            disabled={page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
            title="Previous page"
          >
            ‹
          </button>

          {buildPageRange(totalPages, page).map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="text-muted px-1">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                style={pageBtnStyle(p === page)}
                onClick={() => setPage(p)}
                disabled={p === page}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            style={pageBtnStyle(false)}
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            title="Next page"
          >
            ›
          </button>
          <button
            type="button"
            style={pageBtnStyle(false)}
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
            title="Last page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompactDataGrid;
