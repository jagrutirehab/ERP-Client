import React from "react";
import DataTable from "react-data-table-component";
import { Badge } from "reactstrap";
import { format } from "date-fns";
import { historyData } from "../../dummydata";

const History = () => {

    const columns = [
        {
            name: "Patient Name",
            selector: (row) => row.patient.name,
            wrap: true
        },
        {
            name: "Patient UID",
            selector: (row) => row.patient.uid,
            wrap: true
        },
        {
            name: "Medicines",
            cell: (row) => (
                <div style={{ lineHeight: "1.6" }}>
                    {row.medicines.map((m, i) => (
                        <div
                            key={i}
                            className="d-flex justify-content-between mb-1"
                            style={{ gap: "12px" }}
                        >
                            <span className="fw-semibold">{m.name}</span>
                            <span
                                className="fw-semibold text-end"
                                style={{ width: "40px" }}
                            >
                                {m.totalCount}
                            </span>
                        </div>
                    ))}
                </div>
            ),
            wrap: true,
            width: "35%",
        },
        {
            name: "Prescription Date",
            selector: (row) => format(new Date(row.prescriptionDate), "dd MMM yyyy, hh:mm a"),
            center: true,
            wrap: true
        },
        {
            name: "Approval Date",
            selector: (row) => format(new Date(row.approvalDate), "dd MMM yyyy, hh:mm a"),
            center: true,
            wrap: true
        },
        {
            name: "Status",
            cell: (row) => (
                <Badge
                    color={
                        row.status === "Approved"
                            ? "success"
                            : row.status === "Rejected"
                                ? "danger"
                                : "secondary"
                    }
                    style={{
                        minWidth: "90px",
                        textAlign: "center",
                        fontSize: "12px",
                        padding: "5px 8px",
                    }}
                >
                    {row.status}
                </Badge>
            ),
            center: true,
            wrap: true
        },
    ];

    return (
        <div className="px-3">
            <h5 className="mb-3">History</h5>
            <DataTable
                columns={columns}
                data={historyData}
                highlightOnHover
                striped
                responsive
                customStyles={{
                    rows: {
                        style: {
                            minHeight: "72px",
                            borderBottom: "1px solid #f1f1f1",
                        },
                    },
                    headCells: {
                        style: {
                            fontWeight: "600",
                            backgroundColor: "#f8f9fa",
                            borderBottom: "2px solid #e9ecef",
                        },
                    },
                    cells: {
                        style: {
                            paddingTop: "10px",
                            paddingBottom: "10px",
                        },
                    },
                }}
            />
        </div>
    );
};

export default History;
