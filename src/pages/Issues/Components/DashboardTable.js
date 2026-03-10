import React from "react";
import { Badge } from "reactstrap";
import { normalizeDates } from "../Helpers/normalizeDates";
import { getStatusColor } from "../Helpers/getStatusColor";

const DashboardTable = ({ data = [] }) => {

    const latestTickets = [...data]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div className="bg-white mt-5  ">

            <h5 className="mb-3 fw-bold ">Latest Tickets</h5>

            <div
                className="table-responsive "
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
                            <th className=" align-middle">Author</th>
                            <th className=" align-middle">Requested For</th>
                            <th className=" align-middle">Center</th>
                            <th className=" align-middle">Status</th>
                            <th className=" align-middle">Raised On</th>
                        </tr>
                    </thead>

                    <tbody>
                        {latestTickets.length > 0 ? (
                            latestTickets.map((row) => (
                                <tr key={row._id} style={{ height: "60px" }}>

                                    <td>{row?.author?.name || "-"}</td>

                                    <td>{row?.requestedFrom?.name || "-"}</td>

                                    <td>{row?.center?.title || "-"}</td>

                                    {/* <td>
                                        {row?.assignedTo?.name
                                            ? row.assignedTo.name.charAt(0).toUpperCase() +
                                            row.assignedTo.name.slice(1).toLowerCase()
                                            : "-"}
                                    </td> */}

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
                                <td colSpan="6" className="text-center">
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