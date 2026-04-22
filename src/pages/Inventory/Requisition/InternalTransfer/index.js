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
import { pdf } from "@react-pdf/renderer";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { generateGRNNumber } from "../../../../helpers/backend_helper";
import {
    fetchInternalTransferRequisitions,
    fetchInternalTransferById,
    reviewInternalTransfer,
    requestingReviewInternalTransfer,
    dispatchInternalTransfer,
    grnInternalTransfer,
} from "../../../../store/features/pharmacy/pharmacySlice";
import DataTableComponent from "../../../../Components/Common/DataTable";
import PreviewFile from "../../../../Components/Common/PreviewFile";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { getInternalTransferColumns } from "../../Columns/Pharmacy/InternalTransferColumns";
import { capitalizeWords } from "../../../../utils/toCapitalize";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import CheckPermission from "../../../../Components/HOC/CheckPermission";
import InternalTransferPDF from "../../../../Components/Print/InternalTransfer";
import { pluralizeUnit } from "../../../../utils/pluralizeUnit";

const STATUS_OPTIONS = [
    { value: "PENDING_REQUESTING", label: "Requesting Pending" },
    { value: "PENDING_FULFILLING", label: "Fulfilling Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "DISPATCHED", label: "Dispatched" },
    { value: "PARTIALLY_RECEIVED,FULFILLED", label: "Received" },
    { value: "REJECTED,REQUESTING_REJECTED,FULFILLING_REJECTED", label: "Rejected" },
];

const STATUS_COLORS = {
    PENDING_REQUESTING: "warning",
    PENDING_FULFILLING: "warning",
    APPROVED: "info",
    DISPATCHED: "primary",
    PARTIALLY_RECEIVED: "warning",
    FULFILLED: "success",
    REJECTED: "danger",
    REQUESTING_REJECTED: "danger",
    FULFILLING_REJECTED: "danger",
};


const InternalTransfer = ({ isSareyaanPage = false }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission, roles } = usePermissions(token);
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

    const [reviewModal, setReviewModal] = useState({ open: false, mode: null, row: null });
    const [approveItems, setApproveItems] = useState([]);
    const [reviewRemarks, setReviewRemarks] = useState("");

    const [dispatchModal, setDispatchModal] = useState({ open: false, row: null });
    const [dispatchItems, setDispatchItems] = useState([]);
    const [dispatchNote, setDispatchNote] = useState("");

    const [courierName, setCourierName] = useState("");
    const [courierId, setCourierId] = useState("");

    const [grnModal, setGrnModal] = useState({ open: false, row: null });
    const [grnItems, setGrnItems] = useState([]);
    const [grnNumber, setGrnNumber] = useState("");
    const [receiveNote, setReceiveNote] = useState("");

    const [debouncedSearch, setDebouncedSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("PENDING_REQUESTING");
    const [selectedCenter, setSelectedCenter] = useState("ALL");

    const [detailModal, setDetailModal] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [requestingReviewModal, setRequestingReviewModal] = useState({ open: false, row: null, mode: null });
    const [requestingReviewRemarks, setRequestingReviewRemarks] = useState("");

    const [pdfModal, setPdfModal] = useState({ open: false, row: null });
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(false);
    const pdfBlobUrlRef = useRef(null);

    const [expandedRows, setExpandedRows] = useState({});
    const toggleExpand = (reqId) => setExpandedRows(p => ({ ...p, [reqId]: !p[reqId] }));

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const searchTimerRef = useRef(null);

    const permissionName = isSareyaanPage ? "REQUISITION_SAREYAAN_ORDERS" : "REQUISITION_INTERNAL_TRANSFER";
    const hasWritePermission = hasPermission(
        "PHARMACY",
        permissionName,
        "WRITE"
    ) || hasPermission(
        "PHARMACY",
        permissionName,
        "DELETE"
    );

    const SPECIAL_ORDER_CENTER_IDS = ["6673daaeccb7e3e7f6eab071"];
    const filteredCenterAccess = (user?.centerAccess || []).filter((id) => {
        if (isSareyaanPage) return true;
        return !SPECIAL_ORDER_CENTER_IDS.includes(id);
    });

    const allUserCenterIds = filteredCenterAccess.join(",");

    const centerOptions = [
        ...(filteredCenterAccess.length > 1
            ? [{ value: "ALL", label: "All Centers" }]
            : []),
        ...(filteredCenterAccess.map((id) => {
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
                type: isSareyaanPage ? "ORDER_FROM_SAAREYAN" : "INTERNAL_TRANSFER",
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
                type: isSareyaanPage ? "ORDER_FROM_SAAREYAN" : "INTERNAL_TRANSFER",
            })
        )
            .unwrap()
            .catch((error) => {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to fetch requisitions.");
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, debouncedSearch, statusFilter, selectedCenter, allUserCenterIds, isSareyaanPage]);

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

    const openPdfModal = (row) => {
        setPdfModal({ open: true, row });
        setPdfBlobUrl(null);
        setPdfLoading(true);
        setPdfError(false);

        dispatch(fetchInternalTransferById(row._id))
            .unwrap()
            .then((res) => {
                const fullReq = res?.data || res;
                const centerData = fullReq.requestingCenter
                    ? {
                        name: fullReq.requestingCenter.title || "JAGRUTI REHABILITATION CENTRE",
                        address: fullReq.requestingCenter.address || "",
                        numbers: fullReq.requestingCenter.phoneNumbers || "",
                    }
                    : null;

                generatePdf(fullReq, centerData);
            })
            .catch((error) => {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to load details for PDF.");
                }
                setPdfError(true);
                setPdfLoading(false);
                setPdfModal({ open: false, row: null });
            });
    };

    const generatePdf = async (requisition, center, attempt = 1) => {
        try {
            const blob = await pdf(
                <InternalTransferPDF requisition={requisition} center={center} />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            pdfBlobUrlRef.current = url;
            setPdfBlobUrl(url);
            setPdfLoading(false);
        } catch (err) {
            if (attempt < 3) {
                setTimeout(() => generatePdf(requisition, center, attempt + 1), 500);
            } else {
                setPdfError(true);
                setPdfLoading(false);
                toast.error("Failed to generate PDF. Please try again.");
            }
        }
    };

    const closePdfModal = () => {
        if (pdfBlobUrlRef.current) {
            URL.revokeObjectURL(pdfBlobUrlRef.current);
            pdfBlobUrlRef.current = null;
        }
        setPdfModal({ open: false, row: null });
        setPdfBlobUrl(null);
        setPdfLoading(false);
        setPdfError(false);
    };



    const handleEdit = (row) => {
        const basePath = isSareyaanPage ? "/pharmacy/requisition/sareyaan-orders" : "/pharmacy/requisition/internal-transfer";
        navigate(`${basePath}/edit/${row._id}`);
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
                        unit: pharm.medicineId?.purchaseUnit || pharm.unitType || pharm.unit || item.unit || "",
                        genericName: med.genericName || "",
                        brandName: med.brandName || med.name || "",
                        approvedQty: item.approvedQty,
                        dispatchedQty: item.approvedQty,
                        batch: item.batch || "—",
                    };
                })
        );
        setDispatchNote("");
        setCourierName("");
        setCourierId("");
        setDispatchModal({ open: true, row });
    };

    const closeDispatchModal = () => {
        if (submitLoading) return;
        setDispatchModal({ open: false, row: null });
        setDispatchItems([]);
        setDispatchNote("");
        setCourierName("");
        setCourierId("");
    };

    const handleDispatchSubmit = async () => {
        const totalDispatched = dispatchItems.reduce((sum, i) => sum + Number(i.dispatchedQty || 0), 0);
        if (totalDispatched === 0) {
            toast.warning("Cannot dispatch: At least one item must have a dispatched quantity greater than 0.");
            return;
        }
        try {
            await dispatch(dispatchInternalTransfer({
                id: dispatchModal.row._id,
                dispatchNote,
                courierName,
                courierId,
                items: dispatchItems.map((i) => ({
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
                        unit: pharm.medicineId?.purchaseUnit || pharm.unitType || pharm.unit || item.unit || "",
                        genericName: med.genericName || "",
                        brandName: med.brandName || med.name || "",
                        approvedQty: item.approvedQty,
                        receivedQty: item.approvedQty,
                        batch: item.batch || "—",
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
                    unit: pharm.medicineId?.purchaseUnit || pharm.unitType || pharm.unit || item.unit || "",
                    genericName: med.genericName || "",
                    brandName: med.brandName || med.name || "",
                    requestedQty: item.requestedQty,
                    approvedQty: item.requestedQty,
                    availableBatches: Array.isArray(pharm.Batch) ? pharm.Batch : (pharm.Batch ? [pharm.Batch] : []),
                    batch: "",
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

    const openRequestingReview = (row, mode) => {
        setRequestingReviewRemarks("");
        setRequestingReviewModal({ open: true, row, mode }); // mode: "approve" | "reject"
    };

    const closeRequestingReviewModal = () => {
        if (submitLoading) return;
        setRequestingReviewModal({ open: false, row: null, mode: null });
        setRequestingReviewRemarks("");
    };

    const handleRequestingReviewSubmit = async () => {
        const { row, mode } = requestingReviewModal;
        try {
            await dispatch(requestingReviewInternalTransfer({
                id: row._id,
                action: mode === "approve" ? "APPROVED" : "REJECTED",
                remarks: requestingReviewRemarks,
            })).unwrap();
            toast.success(mode === "approve"
                ? "Request approved — sent to fulfilling center!"
                : "Request rejected by requesting center.");
            closeRequestingReviewModal();
            reloadTable();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Action failed.");
            }
        }
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
                batch: i.batch || "",
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
        handleRequestingApprove: (row) => openRequestingReview(row, "approve"),
        handleRequestingReject: (row) => openRequestingReview(row, "reject"),
        handleDispatch: openDispatch,
        handleReceive: openGrn,
        handlePdf: openPdfModal,
        statusFilter,
        hasWritePermission,
        userCenterAccess: user?.centerAccess || []
    });

    const hasFulfillingAccess = (req) => {
        const fulCenterId = req?.fulfillingCenter?._id || req?.fulfillingCenter;
        return (user?.centerAccess || []).includes(fulCenterId?.toString());
    };

    return (
        <CardBody
            className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
                <div>
                    <h5 className="mb-1 fw-semibold">
                        {isSareyaanPage ? "Sareyaan Pharma Orders" : "Internal Transfer Requisitions"}
                    </h5>
                    <p className="text-muted mb-0 fs-13">
                        {isSareyaanPage
                            ? "Manage stock orders and approvals from Sareyaan Pharma"
                            : "Manage stock transfer requests between centers"}
                    </p>
                </div>
                {hasWritePermission && (
                    <div className="d-flex gap-2 flex-wrap justify-content-end">
                        {!isSareyaanPage ? (
                            <Button
                                color="primary"
                                className="text-white d-flex align-items-center gap-1 justify-content-center"
                                onClick={() =>
                                    navigate("/pharmacy/requisition/internal-transfer/add?type=internal")
                                }
                            >
                                <i className="bx bx-transfer fs-5" />
                                <span>Add Internal Transfer Request</span>
                            </Button>
                        ) : (
                            <Button
                                color="success"
                                className="text-white d-flex align-items-center gap-1 justify-content-center"
                                onClick={() =>
                                    navigate("/pharmacy/requisition/sareyaan-orders/add?type=sareyaan")
                                }
                            >
                                <i className="bx bx-plus fs-5" />
                                <span>Add Sareyaan Order</span>
                            </Button>
                        )}
                    </div>
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
                                <Col sm={6} md={2}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="text-muted fs-12 mb-1">Requesting Center</p>
                                        <p className="fw-semibold mb-0">{selectedReq.requestingCenter?.title || "—"}</p>
                                    </div>
                                </Col>
                                <Col sm={6} md={2}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="text-muted fs-12 mb-1">Requested By</p>
                                        <p className="fw-semibold mb-0">{selectedReq.filledBy?.name || "—"}</p>
                                    </div>
                                </Col>
                                <Col sm={6} md={2}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="text-muted fs-12 mb-1">Fulfilling Center</p>
                                        <p className="fw-semibold mb-0">{selectedReq.fulfillingCenter?.title || "—"}</p>
                                    </div>
                                </Col>
                            </Row>


                            {/* ── Requesting Center Review Info ──────────────────────── */}
                            {selectedReq.requestingCenterReview && (
                                <>
                                    <p className="text-muted fw-semibold fs-12 mb-2 text-uppercase" style={{ letterSpacing: "0.05em" }}>
                                        <i className="bx bx-buildings me-1 text-warning" />Requesting Center Review
                                    </p>
                                    <Row className="mb-3 g-3">
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Action</p>
                                                <p className={`fw-semibold mb-0 ${selectedReq.requestingCenterReview.action === "APPROVED" ? "text-success" : "text-danger"}`}>
                                                    {selectedReq.requestingCenterReview.action}
                                                </p>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Reviewed By</p>
                                                <p className="fw-semibold mb-0">{selectedReq.requestingCenterReview.actionBy?.name || "—"}</p>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Reviewed At</p>
                                                <p className="fw-semibold mb-0">
                                                    {selectedReq.requestingCenterReview.actionAt
                                                        ? moment(selectedReq.requestingCenterReview.actionAt).format("DD MMM YYYY, hh:mm A")
                                                        : "—"}
                                                </p>
                                            </div>
                                        </Col>
                                        {selectedReq.requestingCenterReview.remarks && (
                                            <Col sm={12} md={3}>
                                                <div className="p-3 bg-light rounded">
                                                    <p className="text-muted fs-12 mb-1">Remarks</p>
                                                    <p className="fw-semibold mb-0">{capitalizeWords(selectedReq.requestingCenterReview.remarks)}</p>
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </>
                            )}

                            {/* ── Fulfilling Center Review Info ────────────────────── */}
                            {selectedReq.fulfillingCenterReview && (
                                <>
                                    <p className="text-muted fw-semibold fs-12 mb-2 text-uppercase" style={{ letterSpacing: "0.05em" }}>
                                        <i className="bx bx-check-shield me-1 text-success" />Fulfilling Center Review
                                    </p>
                                    <Row className="mb-3 g-3">
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Reviewed By</p>
                                                <p className="fw-semibold mb-0">{selectedReq.fulfillingCenterReview.actionBy?.name || "—"}</p>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <div className="p-3 bg-light rounded">
                                                <p className="text-muted fs-12 mb-1">Reviewed At</p>
                                                <p className="fw-semibold mb-0">
                                                    {selectedReq.fulfillingCenterReview.actionAt ? moment(selectedReq.fulfillingCenterReview.actionAt).format("DD MMM YYYY, hh:mm A") : "—"}
                                                </p>
                                            </div>
                                        </Col>
                                        {selectedReq.fulfillingCenterReview.remarks && (
                                            <Col sm={12} md={6}>
                                                <div className="p-3 bg-light rounded">
                                                    <p className="text-muted fs-12 mb-1">Remarks</p>
                                                    <p className="fw-semibold mb-0">{capitalizeWords(selectedReq.fulfillingCenterReview.remarks)}</p>
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
                                        {selectedReq.dispatch.courierName && (
                                            <Col sm={6} md={3}>
                                                <div className="p-3 bg-light rounded">
                                                    <p className="text-muted fs-12 mb-1">Courier Name</p>
                                                    <p className="fw-semibold mb-0">{selectedReq.dispatch.courierName}</p>
                                                </div>
                                            </Col>
                                        )}
                                        {selectedReq.dispatch.courierId && (
                                            <Col sm={6} md={3}>
                                                <div className="p-3 bg-light rounded">
                                                    <p className="text-muted fs-12 mb-1">Courier ID</p>
                                                    <p className="fw-bold text-primary mb-0" style={{ textTransform: "uppercase" }}>{selectedReq.dispatch.courierId}</p>
                                                </div>
                                            </Col>
                                        )}
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
                                                {selectedReq.fulfillingCenterReview && <th className="text-center" style={{ fontSize: 12 }}>Approved</th>}
                                                {selectedReq.dispatch?.dispatchedAt && <th className="text-center" style={{ fontSize: 12 }}>Dispatched / Batch</th>}
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
                                                const rawUnit = pharm.medicineId?.purchaseUnit || pharm.unitType || pharm.unit || item.unit || "";

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
                                                        <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{item.requestedQty} {pluralizeUnit(rawUnit)}</td>
                                                        {selectedReq.fulfillingCenterReview && <td className="text-center fw-semibold" style={{ fontSize: 13, verticalAlign: "middle" }}>{item.approvedQty !== undefined && item.approvedQty !== null ? `${item.approvedQty} ${pluralizeUnit(rawUnit)}` : "—"}</td>}
                                                        {selectedReq.dispatch?.dispatchedAt && (
                                                            <td className="text-center fw-semibold" style={{ fontSize: 13, verticalAlign: "middle" }}>
                                                                {item.dispatchedQty !== undefined && item.dispatchedQty !== null ? `${item.dispatchedQty} ${pluralizeUnit(rawUnit)}` : "—"}
                                                                {item.batch && <div className="text-muted fw-normal mt-1" style={{ fontSize: 11 }}>Batch: {item.batch}</div>}
                                                            </td>
                                                        )}
                                                        {selectedReq.receive?.receivedAt && <td className="text-center fw-semibold" style={{ fontSize: 13 }}>{item.receivedQty !== undefined && item.receivedQty !== null ? `${item.receivedQty} ${pluralizeUnit(rawUnit)}` : "—"}</td>}
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
                    {["PENDING_REQUESTING", "PENDING_FULFILLING"].includes(selectedReq?.status) ? (() => {
                        const reqCenterId = selectedReq?.requestingCenter?._id || selectedReq?.requestingCenter;
                        const fulCenterId = selectedReq?.fulfillingCenter?._id || selectedReq?.fulfillingCenter;
                        const userCenterIds = user?.centerAccess || [];
                        const isRequesting = userCenterIds.includes(reqCenterId?.toString());
                        const isFulfilling = userCenterIds.includes(fulCenterId?.toString());

                        // ── PENDING_FULFILLING: Fulfilling center acts (Approve / Reject) ──
                        if (selectedReq.status === "PENDING_FULFILLING" && isFulfilling) {
                            return (
                                <CheckPermission accessRolePermission={roles?.permissions}
                                    permission={"edit"}
                                    subAccess={isSareyaanPage ? "REQUISITION_SAREYAAN_ORDERS" : "REQUISITION_INTERNAL_TRANSFER"}>
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
                                </CheckPermission>
                            );
                        }

                        // ── PENDING_REQUESTING: Requesting center can Approve / Reject / Edit ──
                        if (selectedReq.status === "PENDING_REQUESTING" && isRequesting) {
                            return (
                                <CheckPermission accessRolePermission={roles?.permissions}
                                    permission={"edit"}
                                    subAccess={isSareyaanPage ? "REQUISITION_SAREYAAN_ORDERS" : "REQUISITION_INTERNAL_TRANSFER"}>
                                    <div className="d-flex w-100 justify-content-between align-items-center">
                                        <Button color="secondary" outline onClick={closeDetail}>Close</Button>
                                        <div className="d-flex gap-2">
                                            <Button color="primary" outline onClick={() => { closeDetail(); handleEdit(selectedReq); }}>
                                                <i className="bx bx-pencil me-1" />
                                                Edit
                                            </Button>
                                            <Button color="danger" outline onClick={() => { closeDetail(); openRequestingReview(selectedReq, "reject"); }}>
                                                <i className="bx bx-x me-1" />
                                                Reject
                                            </Button>
                                            <Button color="success" className="text-white"
                                                onClick={() => { closeDetail(); openRequestingReview(selectedReq, "approve"); }}>
                                                <i className="bx bx-check me-1" />
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                </CheckPermission>
                            );
                        }

                        // Fallback for PENDING_FULFILLING requesting center view (read-only)
                        if (selectedReq.status === "PENDING_FULFILLING" && isRequesting) {
                            return (
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                    <Button color="secondary" outline onClick={closeDetail}>Close</Button>
                                    <span className="text-muted" style={{ fontSize: 12 }}>
                                        <i className="bx bx-time me-1" />Awaiting fulfilling center review
                                    </span>
                                </div>
                            );
                        }

                        // No center access — just close
                        return <Button color="secondary" outline onClick={closeDetail}>Close</Button>;
                    })() : (
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
                                            <th className="text-center" style={{ fontSize: 12, width: 140 }}>Batch</th>
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
                                                            {item.customId && <span className="text-primary me-1">[{item.customId}]</span>}
                                                            {[item.type, item.medicineName, item.strength, item.unit].filter(Boolean).join(" ")}
                                                        </p>
                                                        <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
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
                                                    <td className="text-center fw-semibold" style={{ fontSize: 13, verticalAlign: "middle" }}>
                                                        {item.requestedQty} {pluralizeUnit(item.unit)}
                                                    </td>
                                                    <td style={{ verticalAlign: "middle" }}>
                                                        {item.availableBatches && item.availableBatches.length > 0 ? (
                                                            <Input
                                                                type="select"
                                                                bsSize="sm"
                                                                value={item.batch}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setApproveItems((prev) =>
                                                                        prev.map((i) =>
                                                                            i.itemId === item.itemId ? { ...i, batch: val } : i
                                                                        )
                                                                    );
                                                                }}
                                                                style={{ fontSize: 12 }}
                                                            >
                                                                <option value="">-- Select --</option>
                                                                {item.availableBatches.map((b) => (
                                                                    <option key={b} value={b}>{b}</option>
                                                                ))}
                                                            </Input>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontSize: 11 }}>No batches</span>
                                                        )}
                                                    </td>
                                                    <td style={{ width: 150, verticalAlign: "middle" }}>
                                                        <div className="input-group input-group-sm">
                                                            <Input
                                                                type="number"
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
                                                            <span className="input-group-text fw-medium" style={{ fontSize: 12, background: "#f8f9fa" }}>
                                                                {pluralizeUnit(item.unit) || "Unit"}
                                                            </span>
                                                        </div>
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

            {/* ── Requesting Center Review Modal ────────────────────────────── */}
            <Modal isOpen={requestingReviewModal.open} toggle={closeRequestingReviewModal} size="md">
                <ModalHeader toggle={closeRequestingReviewModal}>
                    {requestingReviewModal.mode === "approve" ? (
                        <><i className="bx bx-check-circle me-2 text-success" />Approve Request (Requesting Center)</>
                    ) : (
                        <><i className="bx bx-x-circle me-2 text-danger" />Reject Request (Requesting Center)</>
                    )}
                    {requestingReviewModal.row?.requisitionNumber && (
                        <span className="ms-2 text-muted" style={{ fontSize: 13, fontWeight: 400 }}>
                            — {requestingReviewModal.row.requisitionNumber}
                        </span>
                    )}
                </ModalHeader>
                <ModalBody>
                    <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                        {requestingReviewModal.mode === "approve"
                            ? "Approving will forward this requisition to the fulfilling center for their review."
                            : "Rejecting will close this requisition. This action cannot be undone."}
                    </p>
                    <div>
                        <label className="fw-medium mb-1 d-block" style={{ fontSize: 13 }}>
                            {requestingReviewModal.mode === "approve" ? "Remarks (optional)" : "Rejection Reason (optional)"}
                        </label>
                        <Input
                            type="textarea"
                            rows={3}
                            placeholder={
                                requestingReviewModal.mode === "approve"
                                    ? "Add any notes before forwarding…"
                                    : "Reason for rejecting this request…"
                            }
                            value={requestingReviewRemarks}
                            onChange={(e) => setRequestingReviewRemarks(e.target.value)}
                            style={{ resize: "none", fontSize: 13 }}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" outline onClick={closeRequestingReviewModal} disabled={submitLoading}>
                        Cancel
                    </Button>
                    <Button
                        color={requestingReviewModal.mode === "approve" ? "success" : "danger"}
                        onClick={handleRequestingReviewSubmit}
                        disabled={submitLoading}
                        className="text-white"
                    >
                        {submitLoading ? (
                            <><Spinner size="sm" className="me-2" />{requestingReviewModal.mode === "approve" ? "Approving…" : "Rejecting…"}</>
                        ) : requestingReviewModal.mode === "approve" ? (
                            <><i className="bx bx-check me-1" />Approve & Forward</>
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
                        Set the dispatched quantity for each item. Items with&nbsp;<strong>0</strong> will be skipped.
                    </p>
                    <div className="table-responsive mb-3">
                        <table className="table table-sm table-bordered mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ fontSize: 12 }}>#</th>
                                    <th style={{ fontSize: 12 }}>Medicine</th>
                                    <th className="text-center" style={{ fontSize: 12 }}>Batch</th>
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
                                            <td className="text-center" style={{ fontSize: 12, verticalAlign: "middle" }}>
                                                {item.batch}
                                            </td>
                                            <td className="text-center fw-semibold" style={{ fontSize: 13, verticalAlign: "middle" }}>
                                                {item.approvedQty} {pluralizeUnit(item.unit, item.approvedQty)}
                                            </td>
                                            <td style={{ width: 150, verticalAlign: "middle" }}>
                                                <div className="input-group input-group-sm">
                                                    <Input
                                                        type="number"
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
                                                    <span className="input-group-text fw-medium" style={{ fontSize: 12, background: "#f8f9fa" }}>
                                                        {pluralizeUnit(item.unit, item.dispatchedQty) || "Unit"}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <label className="fw-medium mb-1 d-block" style={{ fontSize: 13 }}>
                                Courier Name (optional)
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter courier name"
                                bsSize="sm"
                                value={courierName}
                                onChange={(e) => setCourierName(e.target.value)}
                            />
                        </Col>
                        <Col md={6}>
                            <label className="fw-medium mb-1 d-block" style={{ fontSize: 13 }}>
                                Tracking ID (optional)
                            </label>
                            <Input
                                type="text"
                                placeholder="Tracking / ID"
                                bsSize="sm"
                                value={courierId}
                                onChange={(e) => setCourierId(e.target.value)}
                                style={{ textTransform: "uppercase" }}
                            />
                        </Col>
                    </Row>

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
                                    <th className="text-center" style={{ fontSize: 12 }}>Batch</th>
                                    <th className="text-center" style={{ fontSize: 12 }}>Approved Qty</th>
                                    <th className="text-center" style={{ fontSize: 12 }}>Received Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grnItems.map((item, idx) => {
                                    const received = Number(item.receivedQty);
                                    const isShort = received < item.approvedQty && received > 0;
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
                                            <td className="text-center" style={{ fontSize: 12, verticalAlign: "middle" }}>
                                                {item.batch}
                                            </td>
                                            <td className="text-center fw-semibold" style={{ fontSize: 13, verticalAlign: "middle" }}>
                                                {item.approvedQty} {pluralizeUnit(item.unit, item.approvedQty)}
                                            </td>
                                            <td style={{ width: 150 }}>
                                                <div className="input-group input-group-sm">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={item.approvedQty}
                                                        value={item.receivedQty}
                                                        onChange={(e) => {
                                                            let val = parseInt(e.target.value, 10);
                                                            if (isNaN(val) || val < 0) val = 0;
                                                            if (val > item.approvedQty) val = item.approvedQty;
                                                            setGrnItems((prev) =>
                                                                prev.map((i) =>
                                                                    i.itemId === item.itemId ? { ...i, receivedQty: val } : i
                                                                )
                                                            );
                                                        }}
                                                        style={{ textAlign: "center", fontWeight: 700 }}
                                                    />
                                                    <span className="input-group-text fw-medium" style={{ fontSize: 12, background: "#f8f9fa" }}>
                                                        {pluralizeUnit(item.unit, item.receivedQty) || "Unit"}
                                                    </span>
                                                </div>
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

            <PreviewFile
                title={`Internal Transfer - ${pdfModal.row?.requisitionNumber || "Document"}`}
                file={pdfBlobUrl ? { url: pdfBlobUrl, type: "application/pdf" } : null}
                isOpen={pdfModal.open}
                toggle={closePdfModal}
                allowDownload={true}
            />
        </CardBody>
    );
};

export default InternalTransfer;
