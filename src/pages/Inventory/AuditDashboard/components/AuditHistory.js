import React, { useState } from "react";
import { Card, CardBody, Button, Input } from "reactstrap";
import DataTable from "react-data-table-component";
import Header from "../../../Report/Components/Header";
import Select from "react-select";
import { endOfDay, startOfDay } from "date-fns";
import { useSelector } from "react-redux";
import { audits } from "../../dummydata";

const customStyles = {
    rows: {
        style: {
            minHeight: "45px",
        },
    },
    headCells: {
        style: {
            backgroundColor: "#f8f9fa",
            fontWeight: "600",
            fontSize: "13px",
        },
    },
    cells: {
        style: {
            fontSize: "13px",
        },
    },
};

const AuditHistory = () => {
    const user = useSelector((state) => state.User);

    const [selectedAudit, setSelectedAudit] = useState(null);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [search, setSearch] = useState("");
    const [reportDate, setReportDate] = useState({
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
    });

    const centerOptions =
        user?.userCenters?.map((center) => ({
            value: center?._id ?? center?.id ?? "",
            label: center?.title ?? center?.name ?? "Unknown",
        })) || [];

    const handleDateChange = (newDate) => setReportDate(newDate);

    const sampleMedicines = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        medicineCode: `MED-${1000 + i}`,
        medicineName: `Medicine ${i + 1}`,
        unitType: i % 2 === 0 ? "TAB" : "CAP",
        strength: `${10 + (i % 5)}`,
        MRP: Math.floor(Math.random() * 1000),
        puchasePrice: Math.floor(Math.random() * 1000),
        salesPrice: Math.floor(Math.random() * 1000),
        company: "Test company",
        manufacturer: "Test",
        rackNum: "test",
        expiry: "12 Nov, 2026",
        batch: `PJRA ${Math.floor(Math.random() * 100)}`,
        oldStock: Math.floor(Math.random() * 100),
        newStock: Math.floor(Math.random() * 100),
        variance: Math.floor(Math.random() * 10) - 5,

    }));

    const filteredMedicines = sampleMedicines.filter((med) =>
        med.medicineName.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            name: <div>Code</div>,
            selector: (row) => row.medicineCode,
            sortable: true,
            width: "110px",
        },
        {
            name: <div>Medicine Name</div>,
            selector: (row) => row.medicineName,
            sortable: true,
        },
        {
            name: <div>Unit</div>,
            selector: (row) => row.unitType,
            width: "80px",
        },
        {
            name: <div>Strength</div>,
            selector: (row) => row.strength,
            width: "90px",
        },
        {
            name: <div>Company</div>,
            selector: (row) => row.company,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: <div>Manufacturer</div>,
            selector: (row) => row.manufacturer,
            sortable: true,
            minWidth: "150px",
        },
        {
            name: <div>Rack</div>,
            selector: (row) => row.rackNum,
            sortable: true,
            width: "90px",
        },
        {
            name: <div>Batch</div>,
            selector: (row) => row.batch,
            sortable: true,
            width: "120px",
        },
        {
            name: <div>Expiry</div>,
            selector: (row) => row.expiry,
            sortable: true,
            width: "130px",
        },
        {
            name: <div>MRP</div>,
            selector: (row) => row.MRP,
            sortable: true,
            width: "90px",
        },
        {
            name: <div>Purchase Price</div>,
            selector: (row) => row.puchasePrice,
            sortable: true,
            minWidth: "130px",
        },
        {
            name: <div>Sales Price</div>,
            selector: (row) => row.salesPrice,
            sortable: true,
            minWidth: "120px",
        },
        {
            name: <div>Old Stock</div>,
            selector: (row) => row.oldStock,
            sortable: true,
            width: "100px",
        },
        {
            name: <div>New Stock</div>,
            selector: (row) => row.newStock,
            sortable: true,
            width: "100px",
        },
        {
            name: <div>Variance</div>,
            selector: (row) => row.variance,
            cell: (row) => {
                const variance = row.oldStock - row.newStock
                return (
                    <span
                        className={
                            variance > 0
                                ? "text-success fw-semibold"
                                : variance < 0
                                    ? "text-danger fw-semibold"
                                    : "text-muted"
                        }
                    >
                        {variance}
                    </span>
                )
            },
            sortable: true,
            width: "100px",
        },
    ];




    return (
        <div className="container-fluid py-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div style={{ minWidth: "200px" }}>
                        <Select
                            options={centerOptions}
                            placeholder="All Centers"
                            value={centerOptions.find((opt) => opt.value === selectedCenter) || null}
                            onChange={(option) => setSelectedCenter(option?.value || null)}
                        />
                    </div>

                    <div style={{ minWidth: "220px" }}>
                        <Header reportDate={reportDate} setReportDate={handleDateChange} />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-3 col-lg-2 border-end">
                    <div
                        className="d-flex flex-column"
                        style={{
                            maxHeight: "80vh",
                            overflowY: "auto",
                        }}
                    >
                        {audits.map((audit) => {
                            const isActive = selectedAudit?.id === audit.id;
                            return (
                                <div
                                    key={audit.id}
                                    onClick={() => setSelectedAudit(audit)}
                                    className={`p-2 px-3 mb-1 rounded-2 ${isActive ? "bg-primary text-white shadow-sm" : "bg-transparent text-dark"
                                        }`}
                                    style={{
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        fontSize: "13.5px",
                                    }}
                                >
                                    <div className="fw-semibold text-truncate">
                                        {audit.center}
                                    </div>
                                    <div
                                        className={`${isActive ? "text-light opacity-75" : "text-muted"
                                            }`}
                                        style={{ fontSize: "12px" }}
                                    >
                                        {new Date(audit.date).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>


                <div className="col-md-9 col-lg-10">
                    {selectedAudit ? (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0 text-dark">
                                    {selectedAudit.center} —{" "}
                                    {new Date(selectedAudit.date).toLocaleDateString()} by {selectedAudit.createdBy}
                                </h6>
                                <Button
                                    color="secondary"
                                    size="sm"
                                    onClick={() => setSelectedAudit(null)}
                                >
                                    Close
                                </Button>
                            </div>

                            <div className="mb-3">
                                <Input
                                    type="text"
                                    placeholder="Search medicine..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="shadow-sm border rounded">
                                <DataTable
                                    columns={columns}
                                    data={filteredMedicines}
                                    customStyles={customStyles}
                                    pagination
                                    highlightOnHover
                                    striped
                                    dense
                                    noDataComponent={<div className="py-3 text-muted">No medicines found</div>}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-5 text-muted border rounded bg-light">
                            <p className="fw-semibold mb-0">
                                Select an audit to view its medicines
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditHistory;
