import React from "react";
import { STATUS } from "../data";

const StatusBadge = ({ statusKey, className = "" }) => {
  const s = STATUS[statusKey];
  if (!s) return null;
  return (
    <span
      className={`badge rounded-pill fw-medium d-inline-flex align-items-center gap-1 ${className}`}
      style={{
        background: s.bg,
        color: s.fg,
        border: `1px ${s.dashed ? "dashed" : "solid"} ${s.border}`,
        fontSize: 12,
        padding: "5px 10px 5px 8px",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.fg,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
};

export default StatusBadge;
