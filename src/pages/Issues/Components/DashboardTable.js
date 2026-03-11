import React, { useState } from "react";
import { Badge } from "reactstrap";
import Select from "react-select";
import { normalizeDates } from "../Helpers/normalizeDates";
import { getStatusColor } from "../Helpers/getStatusColor";

const options = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 15, label: "15" },
    { value: 20, label: "20" },
];

const DashboardTable = ({ data = [] }) => {
    const [limit, setLimit] = useState(5);

    const latestTickets = [...data]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

    return (
        <div className="bg-white">

            {/* Header + Dropdown */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                    Latest Tickets{" "}
                    <span className="fw-normal">(last {limit} tickets)</span>
                </h5>

                <div style={{ width: "100px" }}>
                    <Select
                        options={options}
                        value={options.find(o => o.value === limit)}
                        onChange={(selected) => setLimit(selected.value)}
                        isSearchable={false}
                    />
                </div>
            </div>

            <div
                className="table-responsive"
                style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    overflowX: "auto",
                }}
            >
                <table
                    className="table table-bordered table-hover align-middle mb-0"
                    style={{ minWidth: "700px" }}
                >
                    <thead className="table-light">
                        <tr style={{ height: "60px" }}>
                            <th className="align-middle">Sr No.</th>
                            <th className="align-middle">Author</th>
                            <th className="align-middle">Requested For</th>
                            <th className="align-middle">Center</th>
                            <th className="align-middle">Status</th>
                            <th className="align-middle">Raised On</th>
                        </tr>
                    </thead>

                    <tbody>
                        {latestTickets.length > 0 ? (
                            latestTickets.map((row, idx) => (
                                <tr key={row._id} style={{ height: "60px" }}>
                                    <td>{idx + 1}</td>
                                    <td>{row?.author?.name || "-"}</td>
                                    <td>{row?.requestedFrom?.name || "-"}</td>
                                    <td>{row?.center?.title || "-"}</td>

                                    <td>
                                        <Badge color={getStatusColor(row?.status)} pill>
                                            {row?.status?.replaceAll("_", " ") || "-"}
                                        </Badge>
                                    </td>

                                    <td>{normalizeDates(row?.createdAt) || "-"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No tickets found
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default DashboardTable;