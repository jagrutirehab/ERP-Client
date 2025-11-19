import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { endOfDay, startOfDay } from "date-fns";
import Header from "../../../Report/Components/Header";
import * as XLSX from "xlsx";

import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Spinner,
    ListGroupItem,
    ListGroup,
    Progress,
    Badge,
} from "reactstrap";

import Select from "react-select";
import { Plus, Trash } from "lucide-react";
import { toast } from "react-toastify";
import {
    downloadAuditTemplate,
    updateAuditStatus,
    uploadAuditChunk,
} from "../../../../helpers/backend_helper";
import { deleteAudit, getAudits } from "../../../../store/features/pharmacy/pharmacySlice";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import Typeloader from "../../Components/Loader";
import CheckPermission from "../../../../Components/HOC/CheckPermission";
import { format } from "date-fns-tz";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { capitalizeWords } from "../../../../utils/toCapitalize";

const REQUIRED_HEADERS = [
    "Center",
    "Code",
    "MedicineName",
    "Strength",
    "UnitType",
    "MRP",
    "PurchasePrice",
    "SalesPrice",
    "Company",
    "Manufacturer",
    "RackNum",
    "Expiry",
    "Batch",
    "AuditCount (fill this)",
];

const safeDate = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    return isNaN(d) ? "N/A" : d.toLocaleString();
};

const PendingAudits = ({ activeTab, hasUserPermission, roles }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.User);
    const { pendingAudits, loading: pendingAuditLoader } = useSelector((state) => state.Pharmacy);
    const handleAuthError = useAuthError();

    const istToday = format(new Date(), "yyyy-MM-dd", {
        timeZone: "Asia/Kolkata",
    });

    const [auditDate, setAuditDate] = useState(istToday);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [modalOpen, setModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadSummary, setUploadSummary] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [previewRows, setPreviewRows] = useState([]);
    const [modalSelectedCenter, setModalSelectedCenter] = useState(null);
    const [reportDate, setReportDate] = useState({
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
    });
    const [uploading, setUploading] = useState(false);
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [skippedCountTotal, setSkippedCountTotal] = useState(0);
    const isMobile = useMediaQuery("(max-width: 1000px)");

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
        if (
            selectedCenter !== "ALL" &&
            !user?.centerAccess?.includes(selectedCenter)
        ) {
            setSelectedCenter("ALL");
            setPage(1);
        }
    }, [selectedCenter, user?.centerAccess]);

    const handleDateChange = (newDate) => setReportDate(newDate);


    const fetchAudits = async (newPage = page) => {
        try {
            const centers =
                selectedCenter === "ALL"
                    ? user?.centerAccess
                    : [selectedCenter];
            await dispatch(getAudits({
                centers: centers,
                page: newPage,
                limit,
                status: "PENDING",
                startDate: reportDate.start.toISOString(),
                endDate: reportDate.end.toISOString(),
            })).unwrap();
        } catch (err) {
            if (!handleAuthError) {
                toast.error("Failed to load pending audits");
            }
        }
    };

    useEffect(() => {
        if (activeTab === "PENDING" || hasUserPermission) {
            fetchAudits();
        }
    }, [page, selectedCenter, user?.centerAccess, reportDate, activeTab, dispatch]);


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

    const handleDownload = async () => {
        if (!modalSelectedCenter || !auditDate) {
            toast.warn("Select center and audit date first");
            return;
        }

        const now = new Date();
        const auditDateWithTime = new Date(
            `${auditDate}T${now.toTimeString().split(" ")[0]}`
        ).toISOString();

        try {
            const res = await downloadAuditTemplate({
                centerId: modalSelectedCenter,
                auditDate: auditDateWithTime,
            });

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `audit_${modalSelectedCenter}_${auditDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);

            toast.success("Audit template downloaded");

            fetchAudits();

            setModalOpen(false);
            setModalSelectedCenter(null);
            // setAuditDate("");
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error("Failed to download template");
            }
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadFile) {
            toast.warning("Upload a file first");
            return;
        }
        try {
            setUploading(true);
            setUploadSummary(null);

            const data = await uploadFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            if (!rows || rows.length === 0) {
                toast.error("Empty Excel file.");
                return;
            }

            const uploadedHeaders = Object.keys(rows[0]);

            const missing = REQUIRED_HEADERS.filter(h => !uploadedHeaders.includes(h));

            if (missing.length > 0) {
                toast.error(
                    "Invalid Excel format. Missing headers: " + missing.join(", ")
                );
                return;
            }

            const CHUNK_SIZE = 50;
            const total = Math.ceil(rows.length / CHUNK_SIZE);
            setTotalChunks(total);

            let processed = 0;
            let inserted = 0;
            let updated = 0;
            let notFound = 0;
            let mismatch = 0;
            let auditCountMissed = 0;

            for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
                const chunkIndex = i / CHUNK_SIZE;

                setCurrentChunkIndex(chunkIndex);

                const chunk = rows.slice(i, i + CHUNK_SIZE);

                const res = await uploadAuditChunk({
                    auditId: selectedAudit.auditId,
                    medicines: chunk,
                });

                processed += res.processed || 0;
                inserted += res.auditInserted || 0;
                updated += res.stockUpdated || 0;
                notFound += res.noMedFound || 0;
                mismatch += res.mismatchedCenter || 0;
                auditCountMissed += res.auditCountMissed || 0;

                const progress = Math.round(((chunkIndex + 1) / total) * 100);
                setUploadProgress(progress);

                setUploadSummary({
                    processed,
                    updated,
                    inserted,
                    notfound: notFound,
                    mismatch,
                    progress,
                    auditCountMissed
                });
            }

            await updateAuditStatus({ auditId: selectedAudit.auditId });

            toast.success("Upload completed ✔");
            fetchAudits(page, limit);
        } catch (err) {
            if (!handleAuthError(err)) {
                toast.error("Upload failed");
            }
        } finally {
            setUploading(false);
            setPreviewRows([]);
        }
    };

    const uploadHandler = async (file) => {
        if (!file) return;
        setUploadFile(file);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            if (rows.length === 0) {
                toast.error("Excel file is empty");
                return;
            }
            setPreviewRows(rows.slice(0, 10));
            toast.success("Preview loaded");
        } catch (err) {
            console.error(err);
            toast.error("Failed to read file");
        }
    };

    const handleDeleteAudit = async (id, e) => {
        e.stopPropagation();
        if (!id) return;
        try {
            await dispatch(deleteAudit({ _id: id, status: "PENDING" })).unwrap();
            toast.success("Audit deleted successfully");
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "Failed to delete the audit");
            }
        }
    }

    const pendingAuditsData = pendingAudits?.data || [];
    const pagination = pendingAudits?.pagination || {};

    return (
        <>
            <div
                className={`d-flex ${isMobile ? "flex-column" : "flex-row"} 
                align-items-start justify-content-between gap-3 mb-4`}
            >
                <div
                    className={`d-flex ${isMobile ? "flex-column gap-1" : "flex-row gap-3"}`}
                    style={{ flexWrap: "wrap" }}
                >
                    <div style={{ width: isMobile ? "100%" : "200px" }}>
                        <Select
                            value={selectedCenterOption}
                            onChange={(option) => {
                                setSelectedCenter(option?.value);
                                setPage(1);
                            }}
                            options={centerOptions}
                            placeholder="All Centers"
                        />
                    </div>

                    <div>
                        <Header
                            reportDate={reportDate}
                            setReportDate={handleDateChange}
                        />
                    </div>
                </div>

                <div
                    className={isMobile ? "d-flex justify-content-end w-100" : ""}
                >
                    <CheckPermission
                        accessRolePermission={roles?.permissions}
                        subAccess={"AUDIT"}
                        permission={"create"}
                    >
                        <Button
                            color="primary"
                            className="fw-semibold d-flex align-items-center gap-2 text-white"
                            onClick={() => {
                                setModalOpen(true);
                                setAuditDate(istToday);
                                setModalSelectedCenter(null);
                            }}
                        >
                            <Plus size={18} />
                            Create an Audit
                        </Button>
                    </CheckPermission>
                </div>
            </div>




            <div className="mt-4">

                {pendingAuditLoader ? (
                    <div className="text-center py-5">
                        <Spinner className="text-primary" />
                    </div>
                ) : pendingAuditsData.length === 0 ? (
                    <div className="text-center py-5">
                        <h6 className="mb-2">No audits found</h6>
                        <p className="text-muted">Create a new audit to get started.</p>
                    </div>
                ) : (
                    <>
                        <div
                            className="d-grid"
                            style={{
                                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                                gap: "16px",
                            }}
                        >
                            {pendingAuditsData.map((audit) => (
                                <div
                                    key={audit.auditId}
                                    className="p-3 border border-secondary-subtle rounded shadow-sm d-flex flex-column justify-content-between bg-light"
                                    style={{
                                        transition: "0.2s",
                                        borderRadius: "12px",
                                        position: "relative",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setSelectedAudit(audit);
                                        setUploadFile(null);
                                        setUploadSummary(null);
                                        setUploadModalOpen(true);
                                        setPreviewRows([]);
                                    }}
                                >

                                    <CheckPermission accessRolePermission={roles?.permissions} subAccess={"AUDIT"} permission={"DELETE"}>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            style={{
                                                position: "absolute",
                                                top: "8px",
                                                right: "8px",
                                                zIndex: 10,
                                                padding: "2px 6px",
                                                fontSize: "12px",
                                            }}
                                            onClick={(e) => handleDeleteAudit(audit._id, e)}
                                        >
                                            <Trash className="text-white" size={14} />
                                        </button>
                                    </CheckPermission>

                                    <div className="mb-2 d-flex justify-content-start">
                                        <Badge color="primary" style={{ fontSize: "12px" }}>
                                            ID: {audit.auditId}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h6 className="fw-bold mb-2" style={{ fontSize: "15px" }}>
                                            {audit.center || "Unknown Center"}
                                        </h6>

                                        <p className="mb-1 text-muted small">
                                            <strong>Date:</strong> {safeDate(audit.auditDate)}
                                        </p>

                                        <p className="mb-1 text-muted small">
                                            <strong>Created by:</strong> {capitalizeWords(audit.createdBy) || "Unknown"}
                                        </p>
                                    </div>

                                    <small className="text-primary mt-2 fw-semibold">
                                        Click to upload file
                                    </small>
                                </div>
                            ))}
                        </div>


                        {!pendingAuditLoader && pagination.totalPages > 1 && <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
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
                    </>
                )}
            </div >

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
                <ModalHeader>Create an Audit</ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Select Center</label>
                        <Select
                            options={centerOptions}
                            placeholder="Select Center"
                            value={centerOptions.find((opt) => opt.value === modalSelectedCenter) || null}
                            onChange={(option) => setModalSelectedCenter(option?.value || null)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Audit Date</label>
                        <Input type="date" value={auditDate} onChange={(e) => setAuditDate(e.target.value)} />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" className="text-white" onClick={handleDownload}>
                        Download Template
                    </Button>
                    <Button color="secondary" onClick={() => setModalOpen(false)}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>


            <Modal isOpen={uploadModalOpen} size="xl" toggle={() => {
                setUploadSummary(null);
                setUploadModalOpen(false);
            }}>
                <ModalHeader>Upload Audit File</ModalHeader>
                <ModalBody>
                    <p>
                        <strong>Center:</strong> {selectedAudit?.center} <br />
                        <strong>Date:</strong> {safeDate(selectedAudit?.auditDate)}
                    </p>

                    {!uploadSummary ? (
                        <>
                            <label className="form-label fw-semibold">Upload File</label>
                            <Input type="file" onChange={(e) => uploadHandler(e.target.files[0])} />
                            {previewRows.length > 0 && (
                                <div className="mt-3">
                                    <h6>Data Preview (Top {previewRows.length} rows)</h6>

                                    <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                        <table className="table table-bordered table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    {Object.keys(previewRows[0]).map((h) => (
                                                        <th key={h}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewRows.map((row, idx) => (
                                                    <tr key={idx}>
                                                        {Object.values(row).map((val, i) => (
                                                            <td key={i}>{String(val ?? "")}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {uploading && (
                                <div
                                    style={{
                                        position: "fixed",
                                        top: 0,
                                        left: 0,
                                        width: "100vw",
                                        height: "100vh",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor: "rgba(0,0,0,0.4)",
                                        backdropFilter: "blur(5px)",
                                        zIndex: 9999,
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: "#fff",
                                            padding: "2rem",
                                            borderRadius: "12px",
                                            maxWidth: "500px",
                                            width: "90%",
                                            textAlign: "center",
                                            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                                        }}
                                    >
                                        <div className="alert alert-warning text-center fw-bold">
                                            ⚠️ Upload in progress — please DO NOT refresh or close this
                                            page.
                                        </div>
                                        <div className="mb-2 text-center small text-muted">
                                            items uploading • Chunk {currentChunkIndex + 1} / {totalChunks}
                                        </div>
                                        <div className="mb-2 small text-muted">
                                            Uploaded: {skippedCountTotal}
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                gap: "1rem",
                                                marginTop: "1rem",
                                            }}
                                        >
                                            <Typeloader />
                                            <Progress
                                                value={uploadProgress}
                                                animated
                                                style={{ width: "100%" }}
                                            >
                                                {uploadProgress}%
                                            </Progress>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="p-3 bg-light border rounded">
                                <h6 className="fw-bold mb-3">Upload Progress</h6>

                                <ListGroup className="mb-3">

                                    <ListGroupItem className="d-flex justify-content-between align-items-center">
                                        <span>Processed</span>
                                        <span className="fw-semibold">{uploadSummary.processed}</span>
                                    </ListGroupItem>

                                    <ListGroupItem className="d-flex justify-content-between align-items-center">
                                        <span>Stock Updated</span>
                                        <span className="fw-semibold">{uploadSummary.updated}</span>
                                    </ListGroupItem>

                                    <ListGroupItem className="d-flex justify-content-between align-items-center">
                                        <span>Inserted</span>
                                        <span className="fw-semibold">{uploadSummary.inserted}</span>
                                    </ListGroupItem>

                                    <ListGroupItem className="d-flex justify-content-between align-items-center">
                                        <span>Not Found</span>
                                        <span className="fw-semibold">{uploadSummary.notfound}</span>
                                    </ListGroupItem>

                                    <ListGroupItem className="d-flex justify-content-between align-items-center">
                                        <span>Mismatched Center</span>
                                        <span className="fw-semibold">{uploadSummary.mismatch}</span>
                                    </ListGroupItem>

                                    <ListGroupItem className="d-flex justify-content-between align-items-center">
                                        <span>Missing Audit Count</span>
                                        <span className="fw-semibold">{uploadSummary.auditCountMissed}</span>
                                    </ListGroupItem>
                                </ListGroup>
                            </div>
                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    {!uploadSummary ? (
                        <Button color="primary" className="text-white" onClick={handleUploadSubmit}>
                            {uploading ? <Spinner size="sm" /> : "Submit"}
                        </Button>
                    ) : (
                        <Button
                            color="primary"
                            className="text-white"
                            onClick={() => {
                                setUploadSummary(null);
                                setUploadModalOpen(false);
                            }}
                        >
                            Close
                        </Button>
                    )}

                    {!uploadSummary && (
                        <Button color="secondary" onClick={() => {
                            setUploadSummary(null);
                            setUploadModalOpen(false);
                        }}>
                            Cancel
                        </Button>
                    )}
                </ModalFooter>
            </Modal >
        </>
    );
};

export default PendingAudits;
