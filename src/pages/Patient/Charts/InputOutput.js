import React from "react";
import PropTypes from "prop-types";

const columns = [
  { label: "Intake", name: "intake" },
  { label: "Output", name: "output" },
  { label: "IV Fluid", name: "ivFluid" },
  { label: "Remark", name: "remark" },
];

const InputOutput = ({ data }) => {
  const rows = data?.rows || [];

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box",
      }}
    >
      <table
        className="table table-sm table-bordered align-middle mb-0"
        style={{ minWidth: "600px", width: "100%" }}
      >
        <thead className="table-primary">
          <tr>
            {columns.map(({ label }) => (
              <th
                key={label}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textAlign: "center",
                  padding: "8px 6px",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, idx) => (
              <tr key={idx}>
                {columns.map(({ name }) => (
                  <td
                    key={name}
                    className="font-size-14"
                    style={{
                      textAlign: name === "remark" ? "left" : "center",
                      padding: "10px 6px",
                      color: row[name] ? "inherit" : "#9ca3af",
                    }}
                  >
                    {row[name] || "—"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-muted"
                style={{ padding: "10px 6px" }}
              >
                No entries
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

InputOutput.propTypes = {
  data: PropTypes.object,
};

export default InputOutput;
