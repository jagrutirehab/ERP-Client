import React from "react";

// Shown alongside StatusBadge, never instead of it — inRenewal is an
// independent "applied, awaiting the authority" flag, not a status: an
// expired item that's in renewal should still read as expired.
const RenewalBadge = ({ inRenewal, className = "" }) => {
  if (!inRenewal) return null;
  return (
    <span
      className={`badge rounded-pill fw-medium d-inline-flex align-items-center gap-1 ${className}`}
      style={{
        background: "#EFE7FB",
        color: "#5A3E8F",
        border: "1px solid #D9C9F2",
        fontSize: 12,
        padding: "5px 10px 5px 8px",
      }}
    >
      Renewal applied
    </span>
  );
};

export default RenewalBadge;
