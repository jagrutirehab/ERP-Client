import React from "react";
import PropTypes from "prop-types";

// Reads both the new multi-row shape and legacy single-entry records
const normalizeRows = (data) => {
  if (data?.rows?.length) return data.rows;
  if (data?.activityType || data?.description) {
    return [{ activityType: data.activityType, description: data.description }];
  }
  return [];
};

const NurseSosProcedure = ({ data }) => {
  const rows = normalizeRows(data);

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
        style={{ minWidth: "500px", width: "100%" }}
      >
        <thead className="table-primary">
          <tr>
            <th
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "8px 6px",
                width: "35%",
              }}
            >
              Activity Type
            </th>
            <th
              style={{ fontSize: "12px", fontWeight: 600, padding: "8px 6px" }}
            >
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, idx) => (
              <tr key={idx}>
                <td className="font-size-14" style={{ padding: "10px 6px" }}>
                  {row.activityType || "—"}
                </td>
                <td
                  className="font-size-14"
                  style={{
                    padding: "10px 6px",
                    whiteSpace: "pre-line",
                    color: row.description ? "inherit" : "#9ca3af",
                  }}
                >
                  {row.description || "—"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={2}
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

NurseSosProcedure.propTypes = {
  data: PropTypes.object,
};

export default NurseSosProcedure;
