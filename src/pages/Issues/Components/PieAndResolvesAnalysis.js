import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PieAndResolvesAnalysis = ({ data = [] }) => {

    console.log("data", data);

    // STATUS COUNTS
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

    const chartData = [
        { name: "New", value: statusCounts.new, color: "#0d6efd" },
        { name: "Assigned", value: statusCounts.assigned, color: "#6f42c1" },
        { name: "In Progress", value: statusCounts.in_progress, color: "#fd7e14" },
        { name: "On Hold", value: statusCounts.on_hold, color: "#ffc107" },
        { name: "Pending User", value: statusCounts.pending_user, color: "#20c997" },
        { name: "Pending Release", value: statusCounts.pending_release, color: "#6610f2" },
        { name: "Resolved", value: statusCounts.resolved, color: "#198754" },
        { name: "Closed", value: statusCounts.closed, color: "#6c757d" }
    ];

    // RESOLVED + ASSIGNED INSIGHTS
    const resolvedByUser = {};
    const assignedToUser = {};

    data.forEach(ticket => {

        if (ticket.status === "resolved") {
            const name = ticket?.assignedTo?.name || "Unknown";
            resolvedByUser[name] = (resolvedByUser[name] || 0) + 1;
        }

        if (ticket.status === "assigned") {
            const name = ticket?.assignedTo?.name || "Unknown";
            assignedToUser[name] = (assignedToUser[name] || 0) + 1;
        }

    });

    const resolvedSummary = Object.entries(resolvedByUser);
    const assignedSummary = Object.entries(assignedToUser);

    return (
        <div
            style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                background: "#fff",
                borderRadius: "8px",
                padding: "15px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
            }}
        >

            {/* LEFT BOX → PIE */}
            <div style={{ flex: "1 1 350px", height: 300 }}>
                <h6 style={{ fontWeight: 600, marginBottom: "10px" }}>
                    Ticket Status Distribution
                </h6>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>

                        <Legend
                            layout="vertical"
                            align="left"
                            verticalAlign="middle"
                        />

                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            label
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>

                        <Tooltip />

                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* RIGHT BOX → INSIGHTS */}
            <div
                style={{
                    flex: "1 1 250px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                }}
            >

                <h6 style={{ fontWeight: 600 }}>Insights</h6>

                {resolvedSummary.map(([name, count], i) => (
                    <div
                        key={`resolved-${i}`}
                        style={{
                            padding: "10px 12px",
                            borderRadius: "6px",
                            background: "#e8f5e9",
                            borderLeft: "4px solid #198754"
                        }}
                    >
                        <strong>{count}</strong> ticket{count > 1 ? "s" : ""} resolved by{" "}
                        <strong>{name}</strong>
                    </div>
                ))}

                {assignedSummary.map(([name, count], i) => (
                    <div
                        key={`assigned-${i}`}
                        style={{
                            padding: "10px 12px",
                            borderRadius: "6px",
                            background: "#eef2ff",
                            borderLeft: "4px solid #6f42c1"
                        }}
                    >
                        <strong>{count}</strong> ticket{count > 1 ? "s" : ""} assigned to{" "}
                        <strong>{name}</strong>
                    </div>
                ))}

                {resolvedSummary.length === 0 && assignedSummary.length === 0 && (
                    <div style={{ color: "#6c757d" }}>
                        No insights available
                    </div>
                )}

            </div>

        </div>
    );
};

export default PieAndResolvesAnalysis;