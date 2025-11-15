import { format } from "date-fns";
import { CheckCheck, X } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { clearMedicineApprovals, getMedicineApprovals, updateApprovalStatus } from "../../../../store/features/pharmacy/pharmacySlice";
import Select from "react-select";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import CheckPermission from "../../../../Components/HOC/CheckPermission";

const MedicineApprovalSummary = ({ activeTab, activeSubTab, hasUserPermission }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const { medicineApprovals, loading } = useSelector((state) => state.Pharmacy);
    const user = useSelector((state) => state.User);
    const [updatingRowId, setUpdatingRowId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [remarkText, setRemarkText] = useState("");
    const [actionType, setActionType] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [tableData, setTableData] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { roles } = usePermissions(token);

    const canWrite = (module, subModule) => {
        const mod = roles?.permissions?.find(p => p.module === module);
        if (!mod) return false;

        const sm = mod.subModules?.find(s => s.name === subModule);
        if (!sm) return false;

        return ["WRITE", "DELETE"].includes(sm.type);
    };

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
        if (activeSubTab !== "ALL" || !hasUserPermission) return;

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
                        status: "PENDING",
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
    }, [page, limit, activeTab, selectedCenter, debouncedSearch, user.centerAccess, hasUserPermission]);

    useEffect(() => {
        setPage(1);
    }, [activeTab, activeSubTab]);

    const openRemarksModal = (row, type) => {
        setSelectedRow(row);
        setActionType(type);
        setRemarkText("");
        setModalOpen(true);
    };

    const handleUpdateApprovalStatus = async (status, row = null, remarksOverride = "") => {
        try {

            let payload = {};

            if (row) {
                if (status === "APPROVED") {
                    setUpdatingRowId(`ROW-APPROVE-${row._id}`);
                } else {
                    setUpdatingRowId(`ROW-REJECT-${row._id}`);
                }
                payload.id = row._id;
                payload.status = status;
                payload.remarks = remarksOverride;

                const currentRowData = tableData.find(item => item._id === row._id);

                payload.medicines = currentRowData.medicineCounts.map(m => ({
                    medicineId: m.medicineId,
                    dispensedCount: m.totalQuantity
                }));
            } else {
                const centers =
                    selectedCenter === "ALL"
                        ? user?.centerAccess
                        : [selectedCenter];

                payload.centers = centers;
                payload.status = status;
                payload.id = "bulk";
                payload.type = activeTab;
                payload.remarks = remarksOverride;

                if (status === "APPROVED") {
                    setUpdatingRowId("BULK_APPROVE");
                } else {
                    setUpdatingRowId("BULK_REJECT");
                }
            }

            await dispatch(updateApprovalStatus(payload)).unwrap();

            toast.success("Updated successfully");
            setModalOpen(false);
            setUpdatingRowId(null);
            setPage(1);
        } catch (err) {
            setUpdatingRowId(null);
            toast.error(err.message || "Update failed");
        }
    };


    const handleDispenseChange = (approvalId, medicineId, value) => {
        const newValue = Number(value);

        setTableData(prev =>
            prev.map(item =>
                item._id !== approvalId
                    ? item
                    : {
                        ...item,
                        medicineCounts: item.medicineCounts.map((med, medIndex) =>
                            med.medicineId === medicineId
                                ? {
                                    ...med,
                                    totalQuantity: newValue
                                }
                                : med
                        )
                    }
            )
        );
    };

    const columns = [
        {
            name: <div>Patient Name</div>,
            selector: (row) => capitalizeWords(row?.patient?.name || "-"),
            wrap: true,
        },
        {
            name: <div>Patient UID</div>,
            selector: (row) =>
                `${row?.patientId?.prefix || ""} ${row?.patientId?.value || ""}`,
        },
        {
            name: <div>Center</div>,
            selector: (row) => capitalizeWords(row?.center?.title || "-"),
            wrap: true,
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
            name: <div>Medicines</div>,
            cell: (row) => (
                <div style={{ lineHeight: "1.8" }}>
                    {row.medicineCounts?.map((medicine, index) => (
                        <div
                            key={`${medicine.medicineId}`}
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
                                {medicine.medicineName}
                            </span>
                            {canWrite("PHARMACY", "MEDICINEAPPROVAL") ? (
                                <Input
                                    type="number"
                                    value={medicine.totalQuantity}
                                    bsSize="sm"
                                    onChange={(e) =>
                                        handleDispenseChange(row._id, medicine.medicineId, e.target.value)
                                    }
                                    style={{
                                        width: "60px",
                                        height: "28px",
                                        textAlign: "center",
                                        fontSize: "13px",
                                        borderRadius: "4px",
                                    }}
                                />
                            ) : (
                                <span style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                }}>{medicine.totalQuantity}</span>
                            )}
                        </div>
                    ))}
                </div>
            ),
            wrap: true,
            width: "40%",
        },
        canWrite("PHARMACY", "MEDICINEAPPROVAL") && {
            name: <div>Remarks</div>,
            cell: (row) => (
                <Button
                    onClick={() => openRemarksModal(row, "REMARK_ONLY")}
                    color="outline"
                >
                    Add
                </Button>

            )
        },
        canWrite("PHARMACY", "MEDICINEAPPROVAL") && {
            name: <div>Actions</div>,
            cell: (row) => (
                <div className="d-flex flex-column align-items-center gap-2">
                    <Button
                        color="success"
                        size="sm"
                        onClick={() => handleUpdateApprovalStatus("APPROVED", row)}
                        disabled={updatingRowId === `ROW-APPROVE-${row._id}`}
                        className="d-flex align-items-center justify-content-center text-white"
                        style={{ minWidth: "85px", fontSize: "12px" }}
                    >
                        {updatingRowId === `ROW-APPROVE-${row._id}` ? (
                            <Spinner size="sm" />
                        ) : (
                            <>
                                <CheckCheck size={14} className="me-1" />
                                Approve
                            </>
                        )}
                    </Button>


                    <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleUpdateApprovalStatus("REJECTED", row)}
                        disabled={updatingRowId === `ROW-REJECTED-${row._id}`}
                        className="d-flex align-items-center justify-content-center text-white"
                        style={{ minWidth: "85px", fontSize: "12px" }}
                    >
                        {updatingRowId === `ROW-REJECT-${row._id}` ? (
                            <Spinner size="sm" />
                        ) : (
                            <>
                                <X size={14} className="me-1" />
                                Reject
                            </>
                        )}
                    </Button>

                </div>
            ),
            center: true,
        },
    ].filter(Boolean);


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

    const pagination = medicineApprovals?.pagination || {};


    useEffect(() => {
        setTableData(medicineApprovals?.data);
    }, [medicineApprovals?.data]);

    useEffect(() => {
        if (user?.centerAccess?.length <= 1) {
            setSelectedCenter(user?.centerAccess?.[0] || "");
        }
    }, [user]);

    return (
        <div className="px-3">
            <div className="mb-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                    <div className="d-flex flex-column flex-md-row gap-3 w-100">

                        <div
                            className="order-1 order-md-1 w-100 w-md-auto flex-md-grow-0"
                            style={{ minWidth: "110px" }}
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
                                    { value: 30, label: "40" },
                                    { value: 50, label: "50" },
                                ]}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Limit"
                            />
                        </div>

                        <div
                            className="order-2 order-md-2 flex-grow-1"
                            style={{ minWidth: "200px" }}
                        >
                            <Select
                                value={selectedCenterOption}
                                onChange={(option) => {
                                    setSelectedCenter(option?.value);
                                    setPage(1);
                                }}
                                options={centerOptions}
                                placeholder="All Centers"
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>

                        <div
                            className="order-3 order-md-3 flex-grow-1"
                            style={{ minWidth: "220px" }}
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

                    <div className="order-4 d-flex flex-row gap-2 justify-content-start justify-content-md-end w-100 w-md-auto">
                        {!loading && pagination?.totalDocs > 0 ? (
                            <CheckPermission accessRolePermission={roles?.permissions} permission={"create"} subAccess={"MEDICINEAPPROVAL"}>
                                <>
                                    <Button
                                        className="btn btn-danger fw-semibold px-3 btn-sm text-white"
                                        onClick={() => openRemarksModal(null, "BULK_REJECT")}
                                        disabled={updatingRowId === "BULK_REJECT"}
                                    >
                                        {updatingRowId === "BULK_REJECT" ? <Spinner size="sm" /> : "Reject All"}
                                    </Button>

                                    <Button
                                        className="btn btn-success fw-semibold px-3 btn-sm text-white"
                                        onClick={() => openRemarksModal(null, "BULK_APPROVE")}
                                        disabled={updatingRowId === "BULK_APPROVE"}
                                    >
                                        {updatingRowId === "BULK_APPROVE" ? <Spinner size="sm" /> : "Approve All"}
                                    </Button>
                                </>
                            </CheckPermission>
                        ) : (
                            <div style={{ width: "1px" }}></div>
                        )}
                    </div>

                </div>
            </div>



            <DataTable
                columns={columns}
                data={tableData}
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
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
                <ModalHeader toggle={() => setModalOpen(false)}>
                    Add Remarks
                </ModalHeader>
                <ModalBody>
                    <Input
                        type="textarea"
                        rows={4}
                        value={remarkText}
                        onChange={(e) => setRemarkText(e.target.value)}
                        placeholder="Add your remarks..."
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        className="text-white"
                        onClick={() => {
                            if (actionType === "BULK_REJECT") {
                                handleUpdateApprovalStatus("REJECTED", null, remarkText);
                            } else {
                                handleUpdateApprovalStatus("REJECTED", selectedRow, remarkText);
                            }
                        }}
                        disabled={actionType === "APPROVED"}
                    >
                        Save & Reject
                    </Button>

                    <Button
                        color="success"
                        className="text-white"
                        onClick={() => {
                            if (actionType === "BULK_APPROVE") {
                                handleUpdateApprovalStatus("APPROVED", null, remarkText);
                            } else {
                                handleUpdateApprovalStatus("APPROVED", selectedRow, remarkText);
                            }
                        }}
                        disabled={actionType === "REJECTED"}
                    >
                        Save & Approve
                    </Button>
                </ModalFooter>

            </Modal>

        </div>
    );
};

MedicineApprovalSummary.propTypes = {
    activeTab: PropTypes.string,
    activeSubTab: PropTypes.string,
    hasUserPermission: PropTypes.bool
};

export default MedicineApprovalSummary;
