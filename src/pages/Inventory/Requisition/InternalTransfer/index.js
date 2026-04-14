import { useEffect, useState, useRef } from "react";
import {
    Card,
    CardBody,
    Row,
    Col,
    Input,
    Nav,
    NavItem,
    NavLink,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner,
} from "reactstrap";
import Select from "react-select";
import moment from "moment";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { generateGRNNumber } from "../../../../helpers/backend_helper";
import {
    fetchInternalTransferRequisitions,
    fetchInternalTransferById,
    reviewInternalTransfer,
    dispatchInternalTransfer,
    grnInternalTransfer,
} from "../../../../store/features/pharmacy/pharmacySlice";
import DataTableComponent from "../../../../Components/Common/DataTable";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { getInternalTransferColumns } from "../../Columns/Pharmacy/InternalTransferColumns";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "DISPATCHED", label: "Dispatched" },
    { value: "PARTIALLY_RECEIVED,FULFILLED", label: "Received" },
    { value: "REJECTED", label: "Rejected" },
];

const STATUS_COLORS = {
    PENDING: "warning",
    APPROVED: "info",
    DISPATCHED: "primary",
    PARTIALLY_RECEIVED: "warning",
    FULFILLED: "success",
    REJECTED: "danger",
};


const InternalTransfer = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission } = usePermissions(token);
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const {
        internalTransfer: {
            loading,
            data: requisitions,
            totalCount,
        },
    } = useSelector((state) => state.Pharmacy);
    const { submitLoading } = useSelector((state) => state.Pharmacy);
    const user = useSelector((state) => state.User);

    const [searchQuery, setSearchQuery] = useState("");

    // ── Review modal ────────────────────────────────────────────────────────
    const [reviewModal, setReviewModal] = useState({ open: false, mode: null, row: null });
    const [approveItems, setApproveItems] = useState([]);
    const [reviewRemarks, setReviewRemarks] = useState("");

    // ── Dispatch modal ──────────────────────────────────────────────────────
    const [dispatchModal, setDispatchModal] = useState({ open: false, row: null });
    const [dispatchItems, setDispatchItems] = useState([]);
    const [dispatchNote, setDispatchNote] = useState("");

    // ── GRN modal ───────────────────────────────────────────────────────────
    const [grnModal, setGrnModal] = useState({ open: false, row: null });
    const [grnItems, setGrnItems] = useState([]);
    const [grnNumber, setGrnNumber] = useState("");
    const [receiveNote, setReceiveNote] = useState("");

    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [selectedCenter, setSelectedCenter] = useState("ALL");

    const [detailModal, setDetailModal] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [expandedRows, setExpandedRows] = useState({});
    const toggleExpand = (reqId) => setExpandedRows(p => ({ ...p, [reqId]: !p[reqId] }));

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const searchTimerRef = useRef(null);

    const hasWritePermission = hasPermission(
        "PHARMACY",
        "REQUISITION_INTERNAL_TRANSFER",
        "WRITE"
    ) || hasPermission(
        "PHARMACY",
        "REQUISITION_INTERNAL_TRANSFER",
        "DELETE"
    );

    const allUserCenterIds = (user?.centerAccess || []).join(",");

    const centerOptions = [
        ...(user?.centerAccess?.length > 1
            ? [{ value: "ALL", label: "All Centers" }]
            : []),
        ...(user?.centerAccess?.map((id) => {
            const center = user?.userCenters?.find((c) => c._id === id);
            return { value: id, label: center?.title || "Unknown Center" };
        }) || []),
    ];

    const selectedCenterOption =
        centerOptions.find((o) => o.value === selectedCenter) ||
        centerOptions[0] ||
        null;

    const getCenterIds = () =>
        selectedCenter !== "ALL" ? selectedCenter : allUserCenterIds;

    useEffect(() => {
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setCurrentPage(1);
        }
    }, [user?.centerAccess, selectedCenter]);

    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 350);
        return () => clearTimeout(searchTimerRef.current);
    }, [searchQuery]);

    const reloadTable = () => {
        dispatch(
            fetchInternalTransferRequisitions({
                page: currentPage,
                limit: pageSize,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
                centerIds: getCenterIds() || undefined,
            })
        ).unwrap().catch((error) => {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Failed to fetch requisitions.");
            }
        });
    };

    useEffect(() => {
        dispatch(
            fetchInternalTransferRequisitions({
                page: currentPage,
                limit: pageSize,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
                centerIds: getCenterIds() || undefined,
            })
        )
            .unwrap()
            .catch((error) => {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to fetch requisitions.");
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, debouncedSearch, statusFilter, selectedCenter, allUserCenterIds]);

    const openDetail = (row) => {
        setSelectedReq(null);
        setDetailModal(true);
        setDetailLoading(true);
        dispatch(fetchInternalTransferById(row._id))
            .unwrap()
            .then((res) => setSelectedReq(res?.data || res))
            .catch((error) => {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to load details.");
                }
                setDetailModal(false);
            })
            .finally(() => setDetailLoading(false));
    };

    const closeDetail = () => {
        setDetailModal(false);
        setSelectedReq(null);
        setDetailLoading(false);
    };



    const handleEdit = (row) => {
        navigate(`/pharmacy/requisition/internal-transfer/edit/${row._id}`);
    };

    const openDispatch = (row) => {
        setDispatchItems(
            (row.items || [])
                .filter((item) => (item.approvedQty ?? 0) > 0)
                .map((item) => {
                    const pharm = item.pharmacyId || {};
                    const med = pharm.medicineId || {};
                    return {
                        itemId: item._id,
                        customId: pharm.id || "—",
                        medicineName: pharm.medicineName || item.medicineName || "Unknown",
                        type: med.type || "",
                        strength: pharm.Strength || pharm.strength || item.strength || "",
                        unit: pharm.unitType || pharm.unit || item.unit || "",
                        genericName: med.genericName || "",
                        brandName: med.brandName || med.name || "",
                        approvedQty: item.approvedQty,
                        dispatchedQty: item.approvedQty,
                    };
                })
        );
        setDispatchNote("");
        setDispatchModal({ open: true, row });
    };

    const closeDispatchModal = () => {
        if (submitLoading) return;
        setDispatchModal({ open: false, row: null });
        setDispatchItems([]);
        setDispatchNote("");
    };

    const handleDispatchSubmit = async () => {
        const itemsToSend = dispatchItems.filter((i) => Number(i.dispatchedQty) > 0);
        if (itemsToSend.length === 0) {
            toast.warning("At least one item must have a dispatched quantity greater than 0.");
            return;
        }
        try {
            await dispatch(dispatchInternalTransfer({
                id: dispatchModal.row._id,
                dispatchNote,
                items: itemsToSend.map((i) => ({
                    itemId: i.itemId,
                    dispatchedQty: Number(i.dispatchedQty),
                })),
            })).unwrap();
            toast.success("Requisition dispatched successfully!");
            closeDispatchModal();
            reloadTable();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Dispatch failed.");
            }
        }
    };

    const openGrn = (row) => {
        setGrnItems(
            (row.items || [])
                .filter((item) => (item.dispatchedQty ?? 0) > 0)
                .map((item) => {
                    const pharm = item.pharmacyId || {};
                    const med = pharm.medicineId || {};
                    return {
                        itemId: item._id,
                        customId: pharm.id || "—",
                        medicineName: pharm.medicineName || item.medicineName || "Unknown",
                        type: med.type || "",
                        strength: pharm.Strength || pharm.strength || item.strength || "",
                        unit: pharm.unitType || pharm.unit || item.unit || "",
                        genericName: med.genericName || "",
                        brandName: med.brandName || med.name || "",
                        dispatchedQty: item.dispatchedQty,
                        receivedQty: item.dispatchedQty,
                    };
                })
        );
        setGrnNumber("");
        setReceiveNote("");
        setGrnModal({ open: true, row });
        generateGRNNumber()
            .then((res) => setGrnNumber(res?.grnNumber || res?.data?.grnNumber || ""))
            .catch(() => { });
    };

    const closeGrnModal = () => {
        if (submitLoading) return;
        setGrnModal({ open: false, row: null });
        setGrnItems([]);
        setGrnNumber("");
        setReceiveNote("");
    };

    const handleGrnSubmit = async () => {
        if (grnItems.length === 0) return;
        const totalReceived = grnItems.reduce((sum, i) => sum + Number(i.receivedQty || 0), 0);
        if (totalReceived === 0) {
            toast.warning("Cannot generate GRN: At least one item must have a received quantity greater than 0.");
            return;
        }
        try {
            await dispatch(grnInternalTransfer({
                id: grnModal.row._id,
                receiveNote,
                items: grnItems.map((i) => ({
                    itemId: i.itemId,
                    receivedQty: Number(i.receivedQty),
                })),
            })).unwrap();
            toast.success("GRN recorded successfully!");
            closeGrnModal();
            reloadTable();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Failed to record GRN.");
            }
        }
    };

    const openApprove = (row) => {
        setApproveItems(
            (row.items || []).map((item) => {
                const pharm = item.pharmacyId || {};
                const med = pharm.medicineId || {};
                return {
                    itemId: item._id,
                    customId: pharm.id || "—",
                    medicineName: pharm.medicineName || item.medicineName || "Unknown",
                    type: med.type || "",
                    strength: pharm.Strength || pharm.strength || item.strength || "",
                    unit: pharm.unitType || pharm.unit || item.unit || "",
                    genericName: med.genericName || "",
                    brandName: med.brandName || med.name || "",
                    requestedQty: item.requestedQty,
                    approvedQty: item.requestedQty,
                };
            })
        );
        setReviewRemarks("");
        setReviewModal({ open: true, mode: "approve", row });
    };

    const openReject = (row) => {
        setReviewRemarks("");
        setReviewModal({ open: true, mode: "reject", row });
    };

    const closeReviewModal = () => {
        if (submitLoading) return;
        setReviewModal({ open: false, mode: null, row: null });
        setApproveItems([]);
        setReviewRemarks("");
    };

    const handleReviewSubmit = async () => {
        const { mode, row } = reviewModal;
        const payload = { id: row._id, action: mode === "approve" ? "APPROVED" : "REJECTED", remarks: reviewRemarks };
        if (mode === "approve") {
            const approvedOnly = approveItems.filter((i) => Number(i.approvedQty) > 0);
            if (approvedOnly.length === 0) {
                toast.warning("At least one item must have an approved quantity greater than 0.");
                return;
            }
            payload.items = approvedOnly.map((i) => ({
                itemId: i.itemId,
                approvedQty: Number(i.approvedQty),
            }));
        }
        try {
            await dispatch(reviewInternalTransfer(payload)).unwrap();
            toast.success(mode === "approve" ? "Requisition approved!" : "Requisition rejected!");
            closeReviewModal();
            reloadTable();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Review action failed.");
            }
        }
    };

    const columns = getInternalTransferColumns({
        expandedRows,
        toggleExpand,
        openDetail,
        STATUS_COLORS,
        handleEdit,
        handleApprove: openApprove,
        handleReject: openReject,
        handleDispatch: openDispatch,
        handleReceive: openGrn,
        statusFilter,
        hasWritePermission
    });

    return (
        <CardBody
            className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
                <div>
                    <h5 className="mb-1 fw-semibold">Internal Transfer Requisitions</h5>
                    <p className="text-muted mb-0 fs-13">
                        Manage stock transfer requests between centers
                    </p>
                </div>
                {hasWritePermission && (
                    <Button
                        color="primary"
                        className="text-white d-flex align-items-center gap-1 w-100 w-sm-auto justify-content-center"
                        onClick={() =>
                            navigate("/pharmacy/requisition/internal-transfer/add")
                        }
                        style={{ maxWidth: "160px" }}
                    >
                        <i className="bx bx-plus fs-5" />
                        <span>Add Request</span>
                    </Button>
                )}
            </div>

            {/* Status Tabs */}
            <Nav tabs className="flex-wrap mb-0" style={{ borderBottom: "1px solid #dee2e6" }}>
                {STATUS_OPTIONS.map((option) => {
                    const isActive = statusFilter === option.value;
                    return (
                        <NavItem key={option.value || "ALL"}>
                            <NavLink
                                href="#"
                                active={isActive}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setStatusFilter(option.value);
                                    setCurrentPage(1);
                                }}
                                style={{
                                    fontSize: 13,
                                    fontWeight: isActive ? 700 : 500,
                                    cursor: "pointer",
                                    color: isActive ? "#212529" : "#0d6efd",
                                    background: isActive ? "#fff" : "transparent",
                                    border: isActive ? "1px solid #dee2e6" : "none",
                                    borderBottom: isActive ? "1px solid #fff" : "none",
                                    borderRadius: isActive ? "4px 4px 0 0" : 0,
                                    padding: "6px 14px",
                                    marginBottom: -1,
                                    textDecoration: "none",
                                }}
                            >
                                {option.label}
                            </NavLink>
                        </NavItem>
                    );
                })}
            </Nav>

            {/* Filters */}
            <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: "0 0 8px 8px" }}>
                <CardBody className="py-3">
                    <Row className="g-2 align-items-center">
                        <Col md={4} lg={3}>
                            <Select
                                classNamePrefix="react-select"
                                options={centerOptions}
                                value={selectedCenterOption}
                                onChange={(option) => {
                                    setSelectedCenter(option?.value || "ALL");
                                    setCurrentPage(1);
                                }}
                                placeholder="All My Centers"
                            />
                        </Col>
                        <Col md={5} lg={4}>
                            <div className="position-relative">
                                <i
                                    className="bx bx-search position-absolute text-muted"
                                    style={{ top: "50%", left: 10, transform: "translateY(-50%)" }}
                                />
                                <Input
                                    type="text"
                                    placeholder="Search by requisition ID or GRN ID"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: 32 }}
                                />
                            </div>
                        </Col>

                    </Row>
                </CardBody>
            </Card>

            {/* Table */}
            <Card className="shadow-sm border-0">
                <CardBody className="p-0">
                    <DataTableComponent
                        columns={columns}
                        data={requisitions}
                        loading={loading}
                        pagination={{ totalDocs: totalCount }}
                        limit={pageSize}
                        setLimit={setPageSize}
                        page={currentPage}
                        setPage={setCurrentPage}
                    />
                </CardBody>
            </Card>

            {/* Detail Modal */}
            <Modal isOpen={detailModal} toggle={closeDetail} size="xl">
                <ModalHeader toggle={closeDetail} className="d-flex align-items-start gap-2">
                    <i className="bx bx-transfer me-2 text-primary" />
                    <span className="me-2">Requisition Details</span>
                    {renderStatusBadge(selectedReq?.status)}
                </ModalHeader>
                <ModalBody>
                    {detailLoading ? (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="text-muted mt-2 mb-0" style={{ fontSize: 13 }}>Loading details…</p>
                        </div>
                    ) : selectedReq ? (
                        <>
                            {/* ── Requisition Info ──────────────────────────────── */}
                            <p className="text-muted fw-semibold fs-12 mb-2 text-uppercase" style={{ letterSpacing: "0.05em" }}>
                                <i className="bx bx-file me-1" />Requisition Info
                            </p>
                            <Row className="mb-3 g-3">
                                <Col sm={6} md={3}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="text-muted fs-12 mb-1">Requisition ID</p>
                                        <p className="fw-semibold mb-0">{selectedReq.requisitionNumber || "—"}</p>
                                    </div>
                                </Col>
                                <Col sm={6} md={3}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="text-muted fs-12 mb-1">Date</p>
                                        <p className="fw-semibold mb-0">
                                            {selectedReq.createdAt ? moment(selectedReq.createdAt).format("DD MMM YYYY, hh:mm A") : "—"}
                                        </p>
                                    </div>
                                </Col>
                                <Col sm={6} md={3}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="text-muted fs-12 mb-1">Requesting Center</p>
                                        <p className="fw-semibold mb-0">{selectedReq.requestingCenter?.title || "—"}</p>
                                    </div>
                                </Col>
                                <Col sm={6} md={3}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="text-muted fs-12 mb-1">Fulfilling Center</p>
                                        <p className="fw-semibold mb-0">{selectedReq.fulfillingCenter?.title || "—"}</p>
                                    </div>
                                </Col>
                            </Row>

                            {/* ── Review Info ───────────────────────────────────── */}
                            {selectedReq.status !== "PENDING" && selectedReq.review && (
                                <>
                                    <p className="text-muted fw-semibold fs-12 mb-2 text-uppercase" style={{ letterSpacing: "0.05em" }}>
                                        <i className="bx bx-check-shield me-1 text-success" />Review
                                    </p>
                                    <Row className="mb-3 g-3">
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Reviewed By</p>
                                                <p className="fw-semibold mb-0">{selectedReq.review.actionBy?.name || "—"}</p>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Reviewed At</p>
                                                <p className="fw-semibold mb-0">
                                                    {selectedReq.review.actionAt ? moment(selectedReq.review.actionAt).format("DD MMM YYYY, hh:mm A") : "—"}
                                                </p>
                                            </div>
                                        </Col>
                                        {selectedReq.review.remarks && (
                                            <Col sm={12} md={6}>
                                                <div className="p-3 bg-light rounded">
                                                    <p className="text-muted fs-12 mb-1">Remarks</p>
                                                    <p className="fw-semibold mb-0">{capitalizeWords(selectedReq.review.remarks)}</p>
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </>
                            )}

                            {/* ── Dispatch Info ─────────────────────────────────── */}
                            {selectedReq.dispatch?.dispatchedAt && (
                                <>
                                    <p className="text-muted fw-semibold fs-12 mb-2 text-uppercase" style={{ letterSpacing: "0.05em" }}>
                                        <i className="bx bx-package me-1 text-primary" />Dispatch
                                    </p>
                                    <Row className="mb-3 g-3">
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Dispatched By</p>
                                                <p className="fw-semibold mb-0">{selectedReq.dispatch.dispatchedBy?.name || "—"}</p>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Dispatched At</p>
                                                <p className="fw-semibold mb-0">
                                                    {moment(selectedReq.dispatch.dispatchedAt).format("DD MMM YYYY, hh:mm A")}
                                                </p>
                                            </div>
                                        </Col>
                                        {selectedReq.dispatch.dispatchNote && (
                                            <Col sm={12} md={6}>
                                                <div className="p-3 bg-light rounded">
                                                    <p className="text-muted fs-12 mb-1">Dispatch Note</p>
                                                    <p className="fw-semibold mb-0">{selectedReq.dispatch.dispatchNote}</p>
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </>
                            )}

                            {/* ── Receive / GRN Info ────────────────────────────── */}
                            {selectedReq.receive?.receivedAt && (
                                <>
                                    <p className="text-muted fw-semibold fs-12 mb-2 text-uppercase" style={{ letterSpacing: "0.05em" }}>
                                        <i className="bx bx-check-double me-1 text-success" />Receive / GRN
                                    </p>
                                    <Row className="mb-3 g-3">
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Received By</p>
                                                <p className="fw-semibold mb-0">{selectedReq.receive.receivedBy?.name || "—"}</p>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Received At</p>
                                                <p className="fw-semibold mb-0">
                                                    {moment(selectedReq.receive.receivedAt).format("DD MMM YYYY, hh:mm A")}
                                                </p>
                                            </div>
                                        </Col>
                                        {selectedReq.receive.grnNumber && (
                                            <Col sm={6} md={3}>
                                                <div className="p-3 bg-light rounded">
                                                    <p className="text-muted fs-12 mb-1">GRN Number</p>
                                                    <p className="fw-semibold mb-0 text-primary">{selectedReq.receive.grnNumber}</p>
                                                </div>
                                            </Col>
                                        )}
                                        {selectedReq.receive.receiveNote && (
                                            <Col sm={12} md={6}>
                                                <div className="p-3 bg-light rounded">
                                                    <p className="text-muted fs-12 mb-1">Receive Remarks</p>
                                                    <p className="fw-semibold mb-0">{selectedReq.receive.receiveNote}</p>
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </>
                            )}

                            {/* ── Items table ───────────────────────────────────── */}
                            <h6 className="fw-semibold mb-3">
                                <i className="bx bx-list-ul me-2 text-primary" />
                                Items
                            </h6>
                            {(selectedReq.items || []).length === 0 ? (
                                <p className="text-muted text-center py-3">No items found.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ fontSize: 12 }}>#</th>
                                                <th style={{ fontSize: 12 }}>Medicine</th>
                                                <th className="text-center" style={{ fontSize: 12 }}>Requested</th>
                                                {selectedReq.review && <th className="text-center" style={{ fontSize: 12 }}>Approved</th>}
                                                {selectedReq.dispatch?.dispatchedAt && <th className="text-center" style={{ fontSize: 12 }}>Dispatched</th>}
                                                {selectedReq.receive?.receivedAt && <th className="text-center" style={{ fontSize: 12 }}>Received</th>}
                                                <th style={{ fontSize: 12 }}>Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedReq.items.map((item, idx) => {
                                                const pharm = item.pharmacyId || {};
                                                const med = pharm.medicineId || {};
                                                const primaryLabel = [med.type, pharm.medicineName || item.medicineName, pharm.Strength || pharm.strength || item.strength, pharm.unitType || pharm.unit || item.unit].filter(Boolean).join(" ");
                                                const customId = pharm.id;
                                                const genericName = med.genericName || "";
                                                const brandName = med.brandName || med.name || "";
                                                return (
                                                    <tr key={item._id || idx}>
                                                        <td className="text-muted" style={{ fontSize: 12 }}>{idx + 1}</td>
                                                        <td style={{ minWidth: 200 }}>
                                                            <p className="mb-0 fw-semibold" style={{ fontSize: 13 }}>{primaryLabel || "—"}</p>
                                                            <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                                                                {customId && <span className="fw-medium text-primary">ID: {customId}</span>}
                                                                {(genericName || brandName) && (
                                                                    <>
                                                                        {customId && <span className="mx-1">·</span>}
                                                                        {genericName && <span>{genericName}</span>}
                                                                        {genericName && brandName && <span className="mx-1">·</span>}
                                                                        {brandName && <span>{brandName}</span>}
                                                                    </>
                                                                )}
                                                            </p>
                                                        </td>
                                                        <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{item.requestedQty}</td>
                                                        {selectedReq.review && <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{item.approvedQty ?? "—"}</td>}
                                                        {selectedReq.dispatch?.dispatchedAt && <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{item.dispatchedQty ?? "—"}</td>}
                                                        {selectedReq.receive?.receivedAt && <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{item.receivedQty ?? "—"}</td>}
                                                        <td className="text-muted" style={{ fontSize: 12 }}>{item.itemRemarks || "—"}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : null}
                </ModalBody>
                <ModalFooter>
                    {selectedReq?.status === "PENDING" ? (
                        <div className="d-flex w-100 justify-content-end gap-2">
                            <Button color="danger" outline onClick={() => { closeDetail(); openReject(selectedReq); }}>
                                <i className="bx bx-x me-1" />
                                Reject
                            </Button>
                            <Button color="success" onClick={() => { closeDetail(); openApprove(selectedReq); }} className="text-white">
                                <i className="bx bx-check me-1" />
                                Approve
                            </Button>
                        </div>
                    ) : (
                        <Button color="secondary" outline onClick={closeDetail}>
                            Close
                        </Button>
                    )}
                </ModalFooter>
            </Modal>

            {/* ── Review Modal (Approve / Reject) ─────────────────────────── */}
            <Modal isOpen={reviewModal.open} toggle={closeReviewModal} size={reviewModal.mode === "approve" ? "lg" : "md"}>
                <ModalHeader toggle={closeReviewModal}>
                    {reviewModal.mode === "approve" ? (
                        <><i className="bx bx-check-circle me-2 text-success" />Approve Requisition</>
                    ) : (
                        <><i className="bx bx-x-circle me-2 text-danger" />Reject Requisition</>
                    )}
                    {reviewModal.row?.requisitionNumber && (
                        <span className="ms-2 text-muted" style={{ fontSize: 13, fontWeight: 400 }}>
                            — {reviewModal.row.requisitionNumber}
                        </span>
                    )}
                </ModalHeader>

                <ModalBody>
                    {reviewModal.mode === "approve" && (
                        <>
                            <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                                Set the approved quantity for each item. Items with&nbsp;
                                <strong>0</strong> will be excluded from the approval.
                            </p>
                            <div className="table-responsive mb-3">
                                <table className="table table-sm table-bordered mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ fontSize: 12 }}>#</th>
                                            <th style={{ fontSize: 12 }}>Medicine</th>
                                            <th className="text-center" style={{ fontSize: 12 }}>Requested Qty</th>
                                            <th className="text-center" style={{ fontSize: 12 }}>Approved Qty</th>
                                            <th className="text-center" style={{ fontSize: 12 }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approveItems.map((item, idx) => {
                                            const isSkipped = Number(item.approvedQty) === 0;
                                            return (
                                                <tr key={item.itemId} style={isSkipped ? { opacity: 0.5, background: "#fff5f5" } : {}}>
                                                    <td className="text-muted" style={{ fontSize: 12 }}>{idx + 1}</td>
                                                    <td>
                                                        <p className="mb-0 fw-semibold" style={{ fontSize: 13 }}>
                                                            {[item.type, item.medicineName, item.strength, item.unit].filter(Boolean).join(" ")}
                                                        </p>
                                                        <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                                                            <span className="fw-medium text-primary">ID: {item.customId || "—"}</span>
                                                            {(item.genericName || item.brandName) && (
                                                                <>
                                                                    <span className="mx-1">·</span>
                                                                    {item.genericName && <span>{item.genericName}</span>}
                                                                    {item.genericName && item.brandName && <span className="mx-1">·</span>}
                                                                    {item.brandName && <span>{item.brandName}</span>}
                                                                </>
                                                            )}
                                                        </p>
                                                    </td>
                                                    <td className="text-center fw-semibold" style={{ fontSize: 13 }}>
                                                        {item.requestedQty}
                                                    </td>
                                                    <td style={{ width: 110 }}>
                                                        <Input
                                                            type="number"
                                                            bsSize="sm"
                                                            min={0}
                                                            max={item.requestedQty}
                                                            value={item.approvedQty}
                                                            onChange={(e) => {
                                                                let val = parseInt(e.target.value, 10);
                                                                if (isNaN(val) || val < 0) val = 0;
                                                                if (val > item.requestedQty) val = item.requestedQty;
                                                                setApproveItems((prev) =>
                                                                    prev.map((i) =>
                                                                        i.itemId === item.itemId ? { ...i, approvedQty: val } : i
                                                                    )
                                                                );
                                                            }}
                                                            style={{ textAlign: "center", fontWeight: 700 }}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        {isSkipped ? (
                                                            <span className="badge bg-danger" style={{ fontSize: 10 }}>Skipped</span>
                                                        ) : (
                                                            <span className="badge bg-success" style={{ fontSize: 10 }}>Approved</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="fw-medium mb-1 d-block" style={{ fontSize: 13 }}>
                            {reviewModal.mode === "approve" ? "Remarks (optional)" : "Rejection Note (optional)"}
                        </label>
                        <Input
                            type="textarea"
                            rows={3}
                            placeholder={
                                reviewModal.mode === "approve"
                                    ? "Add any remarks for this approval…"
                                    : "Reason for rejection…"
                            }
                            value={reviewRemarks}
                            onChange={(e) => setReviewRemarks(e.target.value)}
                            style={{ resize: "none", fontSize: 13 }}
                        />
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button color="secondary" outline onClick={closeReviewModal} disabled={submitLoading}>
                        Cancel
                    </Button>
                    <Button
                        color={reviewModal.mode === "approve" ? "success" : "danger"}
                        onClick={handleReviewSubmit}
                        disabled={submitLoading}
                        className="text-white"
                    >
                        {submitLoading ? (
                            <><Spinner size="sm" className="me-2" />{reviewModal.mode === "approve" ? "Approving…" : "Rejecting…"}</>
                        ) : reviewModal.mode === "approve" ? (
                            <><i className="bx bx-check me-1" />Confirm Approval</>
                        ) : (
                            <><i className="bx bx-x me-1" />Confirm Rejection</>
                        )}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* ── Dispatch Modal ───────────────────────────────────────────── */}
            <Modal isOpen={dispatchModal.open} toggle={closeDispatchModal} size="lg">
                <ModalHeader toggle={closeDispatchModal}>
                    <i className="bx bx-package me-2 text-primary" />
                    Dispatch Requisition
                    {dispatchModal.row?.requisitionNumber && (
                        <span className="ms-2 text-muted" style={{ fontSize: 13, fontWeight: 400 }}>
                            — {dispatchModal.row.requisitionNumber}
                        </span>
                    )}
                </ModalHeader>
                <ModalBody>
                    <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                        Confirm the dispatched quantity for each item. Items with&nbsp;
                        <strong>0</strong> will not be dispatched.
                    </p>
                    <div className="table-responsive mb-3">
                        <table className="table table-sm table-bordered mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ fontSize: 12 }}>#</th>
                                    <th style={{ fontSize: 12 }}>Medicine</th>
                                    <th className="text-center" style={{ fontSize: 12 }}>Approved Qty</th>
                                    <th className="text-center" style={{ fontSize: 12 }}>Dispatched Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dispatchItems.map((item, idx) => {
                                    const isSkipped = Number(item.dispatchedQty) === 0;
                                    return (
                                        <tr key={item.itemId} style={isSkipped ? { opacity: 0.5, background: "#fff5f5" } : {}}>
                                            <td className="text-muted" style={{ fontSize: 12 }}>{idx + 1}</td>
                                            <td>
                                                <p className="mb-0 fw-medium" style={{ fontSize: 13 }}>
                                                    {item.type && <span className="text-muted me-1" style={{ fontSize: 11 }}>[{item.type}]</span>}
                                                    {[item.medicineName, item.strength, item.unit].filter(Boolean).join(" ")}
                                                </p>
                                                <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                                                    {item.customId && <span className="text-primary me-1">{item.customId}</span>}
                                                    {[item.genericName, item.brandName].filter(Boolean).join(" · ")}
                                                </p>
                                            </td>
                                            <td className="text-center fw-semibold" style={{ fontSize: 13 }}>
                                                {item.approvedQty}
                                            </td>
                                            <td style={{ width: 110 }}>
                                                <Input
                                                    type="number"
                                                    bsSize="sm"
                                                    min={0}
                                                    max={item.approvedQty}
                                                    value={item.dispatchedQty}
                                                    onChange={(e) => {
                                                        let val = parseInt(e.target.value, 10);
                                                        if (isNaN(val) || val < 0) val = 0;
                                                        if (val > item.approvedQty) val = item.approvedQty;
                                                        setDispatchItems((prev) =>
                                                            prev.map((i) =>
                                                                i.itemId === item.itemId ? { ...i, dispatchedQty: val } : i
                                                            )
                                                        );
                                                    }}
                                                    style={{ textAlign: "center", fontWeight: 700 }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <label className="fw-medium mb-1 d-block" style={{ fontSize: 13 }}>
                            Dispatch Note (optional)
                        </label>
                        <Input
                            type="textarea"
                            rows={3}
                            placeholder="Add any dispatch notes or instructions…"
                            value={dispatchNote}
                            onChange={(e) => setDispatchNote(e.target.value)}
                            style={{ resize: "none", fontSize: 13 }}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" outline onClick={closeDispatchModal} disabled={submitLoading}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={handleDispatchSubmit} disabled={submitLoading} className="text-white">
                        {submitLoading ? (
                            <><Spinner size="sm" className="me-2" />Dispatching…</>
                        ) : (
                            <><i className="bx bx-send me-1" />Confirm Dispatch</>
                        )}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* ── GRN / Receive Modal ──────────────────────────────────────── */}
            <Modal isOpen={grnModal.open} toggle={closeGrnModal} size="lg">
                <ModalHeader toggle={closeGrnModal}>
                    <i className="bx bx-check-double me-2 text-success" />
                    Record Receipt (GRN)
                    {grnModal.row?.requisitionNumber && (
                        <span className="ms-2 text-muted" style={{ fontSize: 13, fontWeight: 400 }}>
                            — {grnModal.row.requisitionNumber}
                        </span>
                    )}
                </ModalHeader>
                <ModalBody>
                    <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                        Enter the quantity actually received for each item. Items with&nbsp;
                        <strong>0</strong> will be marked as not received.
                    </p>

                    <div className="table-responsive mb-3">
                        <table className="table table-sm table-bordered mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ fontSize: 12 }}>#</th>
                                    <th style={{ fontSize: 12 }}>Medicine</th>
                                    <th className="text-center" style={{ fontSize: 12 }}>Dispatched Qty</th>
                                    <th className="text-center" style={{ fontSize: 12 }}>Received Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grnItems.map((item, idx) => {
                                    const received = Number(item.receivedQty);
                                    const isShort = received < item.dispatchedQty && received > 0;
                                    const isMissing = received === 0;
                                    const rowStyle = isMissing
                                        ? { opacity: 0.5, background: "#fff5f5" }
                                        : isShort
                                            ? { background: "#fffbe6" }
                                            : {};
                                    return (
                                        <tr key={item.itemId} style={rowStyle}>
                                            <td className="text-muted" style={{ fontSize: 12 }}>{idx + 1}</td>
                                            <td>
                                                <p className="mb-0 fw-medium" style={{ fontSize: 13 }}>
                                                    {item.type && <span className="text-muted me-1" style={{ fontSize: 11 }}>[{item.type}]</span>}
                                                    {[item.medicineName, item.strength, item.unit].filter(Boolean).join(" ")}
                                                </p>
                                                <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                                                    {item.customId && <span className="text-primary me-1">{item.customId}</span>}
                                                    {[item.genericName, item.brandName].filter(Boolean).join(" · ")}
                                                </p>
                                            </td>
                                            <td className="text-center fw-semibold" style={{ fontSize: 13 }}>
                                                {item.dispatchedQty}
                                            </td>
                                            <td style={{ width: 110 }}>
                                                <Input
                                                    type="number"
                                                    bsSize="sm"
                                                    min={0}
                                                    max={item.dispatchedQty}
                                                    value={item.receivedQty}
                                                    onChange={(e) => {
                                                        let val = parseInt(e.target.value, 10);
                                                        if (isNaN(val) || val < 0) val = 0;
                                                        if (val > item.dispatchedQty) val = item.dispatchedQty;
                                                        setGrnItems((prev) =>
                                                            prev.map((i) =>
                                                                i.itemId === item.itemId ? { ...i, receivedQty: val } : i
                                                            )
                                                        );
                                                    }}
                                                    style={{ textAlign: "center", fontWeight: 700 }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <Row className="g-3">
                        <Col md={5}>
                            <label className="fw-medium mb-1 d-block" style={{ fontSize: 13 }}>
                                GRN Number
                            </label>
                            <Input
                                type="text"
                                value={grnNumber || "Generating…"}
                                disabled
                                style={{ fontSize: 13, background: "#f8f9fa", cursor: "not-allowed" }}
                            />
                        </Col>
                        <Col md={7}>
                            <label className="fw-medium mb-1 d-block" style={{ fontSize: 13 }}>
                                Receive Remarks (optional)
                            </label>
                            <Input
                                type="textarea"
                                rows={2}
                                placeholder="Note any differences between dispatched and received quantities…"
                                value={receiveNote}
                                onChange={(e) => setReceiveNote(e.target.value)}
                                style={{ resize: "none", fontSize: 13 }}
                            />
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" outline onClick={closeGrnModal} disabled={submitLoading}>
                        Cancel
                    </Button>
                    <Button color="success" onClick={handleGrnSubmit} disabled={submitLoading} className="text-white">
                        {submitLoading ? (
                            <><Spinner size="sm" className="me-2" />Recording…</>
                        ) : (
                            <><i className="bx bx-check-double me-1" />Confirm Receipt</>
                        )}
                    </Button>
                </ModalFooter>
            </Modal>
        </CardBody>
    );
};

export default InternalTransfer;
