import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Badge, Input, Spinner } from "reactstrap";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getMedicineApprovals } from "../../../../store/features/pharmacy/pharmacySlice";
import { toast } from "react-toastify";
import { ExpandableText } from "../../../../Components/Common/ExpandableText";
import Select from "react-select";
import { capitalizeWords } from "../../../../utils/toCapitalize";

const History = ({ activeTab, activeSubTab, hasUserPermission }) => {
    const dispatch = useDispatch();
    const { medicineApprovals, loading } = useSelector((state) => state.Pharmacy);
    const user = useSelector((state) => state.User);
    const handleAuthError = useAuthError();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");


    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [{
                value: "ALL",
                label: "All Centers",
                isDisabled: false,
            }]
            : []
        ),
        ...(
            user?.centerAccess?.map(id => {
                const center = user?.userCenters?.find(c => c._id === id);
                return {
                    value: id,
                    label: center?.title || "Unknown Center"
                };
            }) || []
        )
    ];


    const selectedCenterOption = centerOptions.find(
        opt => opt.value === selectedCenter
    ) || centerOptions[0];



    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        if (activeSubTab !== "HISTORY" || !hasUserPermission) return;
        const fetchMedicineApprovals = async () => {
            try {
                const centers =
                    selectedCenter === "ALL"
                        ? user?.centerAccess
                        : [selectedCenter];

                await dispatch(
                    getMedicineApprovals({
                        page,
                        limit,
                        type: activeTab,
                        centers,
                        status: "HISTORY",
                        ...search.trim() !== "" && { search: debouncedSearch }
                    })
                ).unwrap();
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error.message || "Failed to fetch medicine approvals.");
                }
            }
        };

        fetchMedicineApprovals();

    }, [page, limit, activeTab, activeSubTab, selectedCenter, debouncedSearch])

    const columns = [
        {
            name: <div>Patient Name</div>,
            selector: (row) => capitalizeWords(row.patient?.name || "-"),
            wrap: true
        },
        {
            name: <div>Patient UID</div>,
            selector: (row) => `${row?.patientId?.prefix || ""} ${row?.patientId?.value || ""}`,
            wrap: true
        },
        {
            name: <div>Medicines</div>,
            cell: (row) => (
                <div style={{ lineHeight: "1.6", width: "100%" }}>
                    {row.medicineCounts?.map((medicine, index) => (
                        <div key={medicine._id} style={{ width: "100%" }}>
                            <div
                                className="d-flex justify-content-between mb-1"
                                style={{ gap: "12px" }}
                            >
                                <span className="fw-semibold">
                                    {medicine.medicineName}
                                </span>

                                <span
                                    className="fw-semibold text-end"
                                    style={{ minWidth: "90px" }}
                                >
                                    <div>Dispensed: {medicine.dispensedCount}</div>
                                    <div>Total: {medicine.totalQuantity}</div>
                                </span>
                            </div>
                            {index !== row.medicineCounts.length - 1 && (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "1px",
                                        backgroundColor: "#e5e5e5",
                                        margin: "4px 0"
                                    }}
                                ></div>
                            )}
                        </div>
                    ))}
                </div>
            ),
            wrap: true,
            width: "35%",
        },
        {
            name: <div>Prescription Date</div>,
            selector: (row) =>
                row?.prescription?.date
                    ? format(new Date(row.prescription.date), "dd MMM yyyy, hh:mm a")
                    : "-",
            wrap: true,
        },
        {
            name: <div>Approval Date</div>,
            selector: (row) =>
                row?.approvedAt
                    ? format(new Date(row.approvedAt), "dd MMM yyyy, hh:mm a")
                    : "-",
            wrap: true,
        },
        {
            name: <div>Status</div>,
            cell: (row) => (
                <Badge
                    color={
                        row.approvalStatus === "APPROVED"
                            ? "success"
                            : row.approvalStatus === "REJECTED"
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
                    {row.approvalStatus}
                </Badge>
            ),
            center: true,
            wrap: true
        },
        {
            name: <div>Remarks</div>,
            selector: (row) => <ExpandableText text={capitalizeWords(row.remarks) ?? "-"} />
        }
    ];

    const getPageRange = (total, current, maxButtons = 7) => {
        if (total <= maxButtons)
            return Array.from({ length: total }, (_, i) => i + 1);

        const sideButtons = Math.floor((maxButtons - 3) / 2);
        let start = Math.max(2, current - sideButtons);
        let end = Math.min(total - 1, current + sideButtons);
        if (current - 1 <= sideButtons) {
            start = 2;
            end = Math.min(total - 1, maxButtons - 2);
        }
        if (total - current <= sideButtons) {
            end = total - 1;
            start = Math.max(2, total - (maxButtons - 3));
        }

        const range = [1];
        if (start > 2) range.push("...");
        for (let i = start; i <= end; i++) range.push(i);
        if (end < total - 1) range.push("...");
        range.push(total);
        return range;
    };

    const historyData = medicineApprovals?.data || [];
    const pagination = medicineApprovals?.pagination || {};


    return (
        <div className="px-3">
            <div className="mb-3">
                <div
                    className="d-flex flex-column flex-md-row gap-3"
                    style={{ alignItems: "center" }}
                >

                    <div
                        className="order-1"
                        style={{ width: "110px" }}
                    >
                        <Select
                            value={{ value: limit, label: limit }}
                            onChange={(option) => {
                                setLimit(option.value);
                                setPage(1);
                            }}
                            options={[
                                { value: 10, label: "10" },
                                { value: 20, label: "20" },
                                { value: 30, label: "30" },
                                { value: 50, label: "50" },
                            ]}
                            classNamePrefix="react-select"
                            styles={{
                                container: base => ({ ...base, width: "100%" })
                            }}
                        />
                    </div>

                    <div
                        className="order-2 flex-grow-1"
                        style={{ minWidth: "200px", maxWidth: "200px" }}
                    >
                        <Select
                            value={selectedCenterOption}
                            onChange={(option) => {
                                setSelectedCenter(option?.value);
                                setPage(1);
                            }}
                            options={centerOptions}
                            placeholder="All Centers"
                            classNamePrefix="react-select"
                            styles={{
                                container: base => ({ ...base, width: "100%" })
                            }}
                        />
                    </div>

                    <div
                        className="order-3 flex-grow-1"
                        style={{ minWidth: "250px", maxWidth: "220px" }}
                    >
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="Search by patient name or UID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                </div>
            </div>

            <DataTable
                columns={columns}
                data={historyData}
                progressPending={loading}
                progressComponent={<Spinner className="text-primary" />}
                highlightOnHover
                striped
                responsive
                fixedHeader
                fixedHeaderScrollHeight="400px"
                customStyles={{
                    table: {
                        style: {
                            minHeight: "350px",
                        },
                    },
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
            {!loading && pagination.totalDocs > 0 && <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="small text-muted">
                    <>
                        Showing {(page - 1) * limit + 1} to{" "}
                        {Math.min(page * limit, pagination.totalDocs)} of{" "}
                        {pagination.totalDocs} entries
                    </>

                </div>

                <nav>
                    <ul className="pagination mb-0">
                        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                            <button
                                className="page-link"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                        </li>

                        {getPageRange(pagination.totalPages || 1, page, 7).map((p, idx) => (
                            <li
                                key={idx}
                                className={`page-item ${p === page ? "active" : ""} ${p === "..." ? "disabled" : ""
                                    }`}
                            >
                                {p === "..." ? (
                                    <span className="page-link">...</span>
                                ) : (
                                    <button className="page-link" onClick={() => setPage(p)}>
                                        {p}
                                    </button>
                                )}
                            </li>
                        ))}

                        <li
                            className={`page-item ${page === pagination.totalPages || pagination.totalDocs === 0
                                ? "disabled"
                                : ""
                                }`}
                        >
                            <button
                                className="page-link"
                                onClick={() =>
                                    setPage(Math.min(pagination.totalPages, page + 1))
                                }
                                disabled={
                                    page === pagination.totalPages || pagination.totalDocs === 0
                                }
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>}
        </div>
    );
};

export default History;
