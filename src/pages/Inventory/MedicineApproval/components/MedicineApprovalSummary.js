import { format } from "date-fns";
import { CheckCheck, X } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import DataTableComponent from "../../../../Components/Common/DataTable";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { getMedicineApprovals, updateApprovalStatus, submitPilotApproval } from "../../../../store/features/pharmacy/pharmacySlice";
import Select from "react-select";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import CheckPermission from "../../../../Components/HOC/CheckPermission";
import * as XLSX from "xlsx";
import { isPilotCenterRow } from "../../../../helpers/pilotCenter";
import ApproveMedicinesModal from "./ApproveMedicinesModal";
import RefreshButton from "../../../../Components/Common/RefreshButton";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import DetailedPrescriptionModal from "../../Components/DetailedPrescriptionModal";

const MedicineApprovalSummary = ({ activeTab, activeSubTab, hasUserPermission }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const { medicineApprovals, loading } = useSelector((state) => state.Pharmacy);
    const user = useSelector((state) => state.User);
    const centerList = useSelector((state) => state.Center.data);
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
    const [bulkResult, setBulkResult] = useState(null);
    const [bulkResultModal, setBulkResultModal] = useState(false);
    const [approveModalApprovalId, setApproveModalApprovalId] = useState(null);
    const [approveModalCenterId, setApproveModalCenterId] = useState(null);
    const [viewPrescriptionModal, setViewPrescriptionModal] = useState(false);
    const [viewPrescriptionPatient, setViewPrescriptionPatient] = useState(null);

    const openApproveModal = (approvalId, centerId) => {
        setApproveModalApprovalId(approvalId);
        setApproveModalCenterId(centerId);
    };

    const openViewPrescription = (row) => {
        setViewPrescriptionPatient({
            prescriptionId: row.prescriptionId,
            patient: { name: row.patient?.name },
        });
        setViewPrescriptionModal(true);
    };

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
            centerList
                ?.filter(c => user?.centerAccess?.includes(c._id))
                ?.map(c => ({
                    value: c._id,
                    label: c.title,
                })) || []
        )
    ];

    const selectedCenterOption = centerOptions.find(
        opt => opt.value === selectedCenter
    ) || centerOptions[0];

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, user?.centerAccess]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);


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

    useEffect(() => {
        if (activeSubTab !== "ALL" || !hasUserPermission) return;
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

    // Bulk approve/reject only — per-row approve now goes through the
    // View/Approve Medicines modal, and per-row reject goes through
    // handleRowReject below.
    const handleUpdateApprovalStatus = async (status, remarksOverride = "") => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : [selectedCenter];

            const payload = {
                centers,
                status,
                id: "bulk",
                type: activeTab,
                remarks: remarksOverride,
                update: "pendingApprovals",
            };

            setUpdatingRowId(`BULK-${status}`);

            const result = await dispatch(updateApprovalStatus(payload)).unwrap();

            if (result?.shortages || result?.failed > 0) {
                setBulkResult(result);
                setBulkResultModal(true);
                setUpdatingRowId(null);

                return toast.error("Cannot approve due to insufficient stock.");
            }

            toast.success("Updated successfully");
            setModalOpen(false);
            setUpdatingRowId(null);
            setPage(1);

        } catch (err) {
            setUpdatingRowId(null);

            if (err?.shortages || err?.failed > 0) {
                setBulkResult(err);
                setBulkResultModal(true);
                return toast.error("Cannot approve due to insufficient stock.");
            }

            toast.error(err.message || "Update failed");
        }
    };

    // Per-row reject — routed through the same approve/reject endpoint the
    // View/Approve Medicines modal uses, so it works uniformly whether or
    // not the medicine list is dispensed via pharmacy stock links.
    const handleRowReject = async (row, remarksOverride = "") => {
        setUpdatingRowId(`ROW-REJECTED-${row._id}`);
        try {
            await dispatch(
                submitPilotApproval({ approvalId: row._id, status: "REJECTED", remarks: remarksOverride })
            ).unwrap();

            toast.success("Approval rejected");
            setModalOpen(false);
            setUpdatingRowId(null);
            setPage(1);
        } catch (err) {
            setUpdatingRowId(null);
            toast.error(err?.message || "Failed to reject");
        }
    };

    const downloadFailedApprovalsXlsx = () => {
        if (!bulkResult) {
            toast.error("No failure data available");
            return;
        }
        if (bulkResult.type === "bulk" || bulkResult.failedApprovals) {

            const rows = [];

            (bulkResult.centersRes || []).forEach(center => {
                center.medicines.forEach(med => {
                    rows.push({
                        CenterName: center.centerName,
                        Medicine: med.medicineName,
                        TotalRequired: med.required,
                        TotalAvailable: med.available,
                        TotalMissing: med.missing,
                    });
                });
            });

            if (rows.length === 0) {
                toast.error("No failure data to download");
                return;
            }

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "BulkShortages");
            XLSX.writeFile(wb, "bulk_shortages.xlsx");
            return;
        }


        toast.error("Invalid failure structure");
    };


    const columns = [
        {
            name: <div>Patient Name</div>,
            selector: (row) => capitalizeWords(row?.patient?.name || "-"),
            wrap: true,
            minWidth: "100px"
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
            minWidth: "100px"
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
            name: <div>Status</div>,
            cell: (row) => renderStatusBadge(row.approvalStatus || "PENDING"),
            center: true,
        },
        {
            name: <div>Prescription</div>,
            cell: (row) => (
                <Button
                    color="primary"
                    size="sm"
                    className="text-white"
                    disabled={!row.prescriptionId}
                    onClick={() => openViewPrescription(row)}
                >
                    View
                </Button>
            ),
            center: true,
        },
        // Remarks column — commented out for now.
        false && canWrite("PHARMACY", "MEDICINEAPPROVAL") && {
            name: <div>Remarks</div>,
            cell: (row) => {
                if (isPilotCenterRow(row.center?._id)) return null;
                return (
                    <Button
                        onClick={() => openRemarksModal(row, "REMARK_ONLY")}
                        color="outline"
                    >
                        Add
                    </Button>
                );
            }
        },
        canWrite("PHARMACY", "MEDICINEAPPROVAL") && {
            name: <div>Actions</div>,
            cell: (row) => (
                <div className="d-flex gap-2">
                    <Button
                        color="success"
                        className="text-white"
                        size="sm"
                        onClick={() => openApproveModal(row._id, row.center?._id)}
                    >
                        <CheckCheck size={18} />
                    </Button>

                    <Button
                        color="danger"
                        className="text-white"
                        size="sm"
                        onClick={() => openRemarksModal(row, "REJECTED")}
                        disabled={updatingRowId === `ROW-REJECTED-${row._id}`}
                    >
                        {updatingRowId === `ROW-REJECTED-${row._id}` ? (
                            <Spinner size="sm" />
                        ) : (
                            <X size={16} />
                        )}
                    </Button>
                </div>
            ),
            center: true,
        },
    ].filter(Boolean);

    const pagination = medicineApprovals?.pagination || {};

    useEffect(() => {
        setTableData(medicineApprovals?.data);
    }, [medicineApprovals?.data]);

    useEffect(() => {
        if (user?.centerAccess?.length <= 1) {
            setSelectedCenter(user?.centerAccess?.[0] || "");
        }
    }, [user]);

    const resetAll = (approvalType) => {
        setBulkResultModal(false);
        setModalOpen(false);
        setPage(1);
        if (approvalType === "bulk") {
            fetchMedicineApprovals()
        }
    }

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
                                    { value: 40, label: "40" },
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

                    <div className="order-4 d-flex flex-row align-items-center gap-2 justify-content-start justify-content-md-end w-100 w-md-auto">
                        <RefreshButton loading={loading} onRefresh={fetchMedicineApprovals} />

                        {/* Approve All / Reject All — commented out for now.
                        {!loading && pagination?.totalDocs > 0 && !isPilotCenterRow(selectedCenter) ? (
                            <CheckPermission accessRolePermission={roles?.permissions} permission={"create"} subAccess={"MEDICINEAPPROVAL"}>
                                <>
                                    <Button
                                        className="btn btn-danger fw-semibold px-3 btn-sm text-white"
                                        onClick={() => openRemarksModal(null, "BULK_REJECT")}
                                        disabled={updatingRowId === "BULK-REJECT"}
                                    >
                                        {updatingRowId === "BULK-REJECT" ? <Spinner size="sm" /> : "Reject All"}
                                    </Button>

                                    <Button
                                        className="btn btn-success fw-semibold px-3 btn-sm text-white"
                                        onClick={() => openRemarksModal(null, "BULK_APPROVE")}
                                        disabled={updatingRowId === "BULK-APPROVED"}
                                    >
                                        {updatingRowId === "BULK-APPROVED" ? <Spinner size="sm" /> : "Approve All"}
                                    </Button>
                                </>
                            </CheckPermission>
                        ) : null}
                        */}
                    </div>

                </div>
            </div>

            <DataTableComponent
                columns={columns}
                data={tableData}
                loading={loading}
                pagination={pagination}
                limit={limit}
                page={page}
                setPage={setPage}
                setLimit={(rows) => {
                    setLimit(rows);
                    setPage(1);
                }}
                paginationRowsPerPageOptions={[10, 20, 30, 40, 50]}
            />
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
                <ModalHeader toggle={() => setModalOpen(false)}>
                    {actionType === "BULK_APPROVE" ? "Approve All" : "Reject Approval"}
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
                    <Button color="secondary" onClick={() => setModalOpen(false)}>
                        Cancel
                    </Button>
                    {actionType === "BULK_APPROVE" ? (
                        <Button
                            color="success"
                            className="text-white"
                            onClick={() => handleUpdateApprovalStatus("APPROVED", remarkText)}
                        >
                            Save & Approve
                        </Button>
                    ) : (
                        <Button
                            color="danger"
                            className="text-white"
                            onClick={() => {
                                if (actionType === "BULK_REJECT") {
                                    handleUpdateApprovalStatus("REJECTED", remarkText);
                                } else {
                                    handleRowReject(selectedRow, remarkText);
                                }
                            }}
                        >
                            Save & Reject
                        </Button>
                    )}
                </ModalFooter>

            </Modal>

            <Modal isOpen={bulkResultModal} toggle={() => resetAll(bulkResult?.type)} size="md">
                <ModalHeader toggle={() => resetAll(bulkResult?.type)}>
                    Bulk Approval Failed — Stock Shortage
                </ModalHeader>

                <ModalBody>
                    {bulkResult && (
                        <>
                            <h5 className="text-danger fw-bold mb-3">Summary</h5>
                            {bulkResult.type === "bulk" && (
                                <>
                                    <div className="d-flex gap-4 mb-4">
                                        <div className="p-2 border rounded text-center flex-fill">
                                            <div className="fw-bold text-success fs-4">
                                                {bulkResult.approved || 0}
                                            </div>
                                            <div>Requests Approved</div>
                                        </div>

                                        <div className="p-2 border rounded text-center flex-fill">
                                            <div className="fw-bold text-danger fs-4">
                                                {bulkResult.failed}
                                            </div>
                                            <div>Requests Failed</div>
                                        </div>
                                    </div>
                                    <p className="text-muted mb-0">
                                        Download the XLSX report for centerwise details.
                                    </p>
                                </>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={() => resetAll(bulkResult?.type)}>
                        Close
                    </Button>
                    <Button color="primary" className="text-white" onClick={downloadFailedApprovalsXlsx}>
                        Download XLSX
                    </Button>
                </ModalFooter>
            </Modal>

            <ApproveMedicinesModal
                isOpen={!!approveModalApprovalId}
                onClose={() => openApproveModal(null, null)}
                approvalId={approveModalApprovalId}
                centerId={approveModalCenterId}
                onDone={fetchMedicineApprovals}
            />

            <DetailedPrescriptionModal
                patient={viewPrescriptionPatient}
                modal={viewPrescriptionModal}
                setModal={setViewPrescriptionModal}
                readOnly
            />

        </div>
    );
};

MedicineApprovalSummary.propTypes = {
    activeTab: PropTypes.string,
    activeSubTab: PropTypes.string,
    hasUserPermission: PropTypes.bool
};

export default MedicineApprovalSummary;
