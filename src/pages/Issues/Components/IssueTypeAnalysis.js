import React from "react";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";

const IssueTypeAnalysis = ({ data = [] }) => {

  const isMobile = useMediaQuery("(max-width: 768px)");

  const statusCounts = {
    new: data.filter(d => d.status === "new").length,
    assigned: data.filter(d => d.status === "assigned").length,
    in_progress: data.filter(d => d.status === "in_progress").length,
    on_hold: data.filter(d => d.status === "on_hold").length,
    pending_user: data.filter(d => d.status === "pending_user").length,
    pending_release: data.filter(d => d.status === "pending_release").length,
    resolved: data.filter(d => d.status === "resolved").length,
    closed: data.filter(d => d.status === "closed").length
  };

  const boxes = [
    { label: "New", value: statusCounts.new, color: "#0d6efd" },
    { label: "Assigned", value: statusCounts.assigned, color: "#6f42c1" },
    { label: "In Progress", value: statusCounts.in_progress, color: "#fd7e14" },
    { label: "On Hold", value: statusCounts.on_hold, color: "#ffc107" },
    { label: "Pending User", value: statusCounts.pending_user, color: "#20c997" },
    { label: "Pending Release", value: statusCounts.pending_release, color: "#6610f2" },
    { label: "Resolved", value: statusCounts.resolved, color: "#198754" },
    { label: "Closed", value: statusCounts.closed, color: "#6c757d" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        overflowX: isMobile ? "auto" : "hidden",
        marginTop: "10px"
      }}
    >
      {boxes.map((box, index) => (
        <div
          key={index}
          style={{
            flex: isMobile ? "0 0 140px" : "1",
            background: "#fff",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            borderLeft: `4px solid ${box.color}`
          }}
        >
          <div style={{ fontSize: "13px", color: "#6c757d" }}>
            {box.label}
          </div>

          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            {box.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IssueTypeAnalysis;