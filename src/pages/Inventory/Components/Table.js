export const Table = ({ children, tableStyle }) => (
  <div
    className="table-responsive rounded-lg border border-primary shadow-lg bg-white"
    style={{ overflowX: "auto", minHeight:"55vh" }}
  >
    <table className="table table-hover mb-0" style={{ minWidth: "1200px" }}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead
    style={{
      background: "linear-gradient(90deg,#6c5ce7,#00b8d8)",
      color: "#fff",
    }}
  >
    {children}
  </thead>
);
export const TableRow = ({ children }) => (
  <tr className="border-bottom">{children}</tr>
);
export const TableHead = ({ children, noWrap = false }) => (
  <th
    className="p-3 text-left font-weight-bold"
    style={noWrap ? { whiteSpace: "nowrap" } : {}}
  >
    {children}
  </th>
);
export const TableBody = ({ children }) => <tbody>{children}</tbody>;
export const TableCell = ({ children, className, noWrap = false }) => (
  <td
    className={`p-3 ${className || ""}`}
    style={noWrap ? { whiteSpace: "nowrap" } : {}}
  >
    {children}
  </td>
);
