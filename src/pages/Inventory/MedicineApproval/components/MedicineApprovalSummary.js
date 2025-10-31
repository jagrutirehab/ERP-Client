import { format } from "date-fns";
import { CheckCheck, X } from "lucide-react";
import { useState } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { Button, Input } from "reactstrap";

const MedicineApprovalSummary = () => {
    const [data, setData] = useState([
        {
            patient: {
                name: "Aarav Sharma",
                uid: "UID2536"
            },
            prescriptionDate: "2025-10-14T12:30:03.307Z",
            medicines: [
                { name: "TAB DOLO 650 MG", totalCount: 10 },
                { name: "SURGICAL URETHRAL CATHATER NOS", totalCount: 5 },
                { name: "TAB PARI CR PLUS MG", totalCount: 1 },
            ],
        },
        {
            patient: {
                name: "Riya Patel",
                uid: "UID25456"
            },
            prescriptionDate: "2025-10-14T12:30:03.307Z",
            medicines: [
                { name: "TAB Q2 TAB MG", totalCount: 8 },
                { name: "TAB VENTAB PLUS 10 MG", totalCount: 2 },
            ],
        },
    ]);

    const handleCountChange = (patientIndex, medIndex, value) => {
        const updated = [...data];
        updated[patientIndex].medicines[medIndex].totalCount = value;
        setData(updated);
    };

    const handleApprove = () => {
        toast.success("medicines approved successfully");
    };

    const handleReject = () => {
        toast.success("medicines rejected successfully");
    };

    const columns = [
        {
            name: "Patient Name",
            selector: (row) => row.patient.name,
        },
        {
            name: "Patient UID",
            selector: (row) => row.patient.uid,
        },
        {
            name: "Prescription Date",
            selector: (row) => format(new Date(row.prescriptionDate), "dd MMM yyyy, hh:mm a"),
            wrap: true
        },
        {
            name: "Medicines",
            cell: (row, patientIndex) => (
                <div style={{ lineHeight: "1.8" }}>
                    {row.medicines.map((m, i) => (
                        <div
                            key={i}
                            className="d-flex align-items-center my-1"
                            style={{ gap: "12px" }}
                        >
                            <span
                                style={{
                                    flex: 1,
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#333",
                                }}
                            >
                                {m.name}
                            </span>
                            <Input
                                type="number"
                                value={m.totalCount}
                                onChange={(e) =>
                                    handleCountChange(patientIndex, i, e.target.value)
                                }
                                bsSize="sm"
                                style={{
                                    width: "60px",
                                    height: "28px",
                                    textAlign: "center",
                                    fontSize: "13px",
                                    borderRadius: "4px",
                                }}
                            />
                        </div>
                    ))}
                </div>
            ),
            wrap: true,
            width: "45%"
        },

        {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex flex-column align-items-center gap-2">
                    <Button
                        color="success"
                        size="sm"
                        onClick={() => handleApprove(row.patientName)}
                        className="d-flex align-items-center justify-content-center text-white"
                        style={{ minWidth: "85px", fontSize: "12px" }}
                    >
                        <CheckCheck size={14} className="me-1" />
                        Approve
                    </Button>

                    <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleReject(row.patientName)}
                        className="d-flex align-items-center justify-content-center text-white"
                        style={{ minWidth: "85px", fontSize: "12px" }}
                    >
                        <X size={14} className="me-1" />
                        Reject
                    </Button>
                </div>
            ),
            center: true,
        },
    ];

    return (
        <div className="px-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Medicine Summary</h5>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-danger btn-sm">Reject All</button>
                    <button className="btn btn-success btn-sm">Approve All</button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={data}
                highlightOnHover
                striped
                responsive
                customStyles={{
                    headCells: {
                        style: {
                            backgroundColor: "#f8f9fa",
                            fontWeight: "600",
                            borderBottom: "2px solid #e9ecef",
                        },
                    },
                    rows: {
                        style: {
                            minHeight: "60px",
                            borderBottom: "1px solid #f1f1f1",
                        },
                    },
                }}
            />
        </div>

    );
};

export default MedicineApprovalSummary;
