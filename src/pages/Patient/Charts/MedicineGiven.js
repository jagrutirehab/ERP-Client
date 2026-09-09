import React from "react";
import PropTypes from "prop-types";
import moment from "moment";

const MedicineGiven = ({ data }) => {
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
            <th style={{ fontSize: "12px", fontWeight: 600, padding: "8px 6px" }}>
              Slot
            </th>
            <th style={{ fontSize: "12px", fontWeight: 600, padding: "8px 6px" }}>
              Given At
            </th>
            <th style={{ fontSize: "12px", fontWeight: 600, padding: "8px 6px" }}>
              Given By
            </th>
            <th style={{ fontSize: "12px", fontWeight: 600, padding: "8px 6px" }}>
              Comment
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="font-size-14" style={{ padding: "10px 6px" }}>
              {data?.slot || "—"}
            </td>
            <td className="font-size-14" style={{ padding: "10px 6px" }}>
              {data?.takenAt ? moment(data.takenAt).format("D MMM YYYY, hh:mm A") : "—"}
            </td>
            <td className="font-size-14" style={{ padding: "10px 6px" }}>
              {data?.markedBy?.name || "—"}
            </td>
            <td
              className="font-size-14"
              style={{
                padding: "10px 6px",
                whiteSpace: "pre-line",
                color: data?.comment ? "inherit" : "#9ca3af",
              }}
            >
              {data?.comment || "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

MedicineGiven.propTypes = {
  data: PropTypes.object,
};

export default MedicineGiven;
