import React, { useEffect, useState, useCallback } from "react";
import { CardBody, Spinner } from "reactstrap";
import Select from "react-select";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteTrainerRecord, getTrainerRecords } from "../../../helpers/backend_helper";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import EditTrainerModal from "../Components/EditTrainerModal";
import DeleteTrainerModal from "../Components/DeleteTrainerModal";
import { usePermissions } from '../../../Components/Hooks/useRoles'

const LIMIT = 5;

const formatDateOnly = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const TrainingCard = ({ record, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const token = JSON.parse(localStorage.getItem("user"))?.token
    const { hasPermission } = usePermissions(token)
    const hasWritePermission = hasPermission("TRAININGS", "TRAINING_RECORDS", "WRITE")
    const hasDeletePermission = hasPermission("TRAININGS", "TRAINING_RECORDS", "DELETE")
    const canEdit = hasWritePermission
    const totalAttendees = record?.attendanceData?.reduce(
        (sum, d) => sum + (d?.presents?.length || 0), 0
    ) || 0;

    const centerNames = record?.center?.map((c) => c?.title).filter(Boolean).join(", ") || "—";

    return (
        <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12, overflow: 'hidden' }}>
            <div className="card-body p-0">
                <div className="p-3" style={{ borderLeft: '4px solid #4f46e5' }}>
                    <div className="d-flex align-items-start justify-content-between mb-1">
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: 15 }}>{record?.trainingName || "—"}</h6>
                            <small className="text-muted">Trainer: <strong>{record?.trainerName}</strong></small>
                        </div>
                        <span className="badge bg-soft-primary text-primary ms-2 flex-shrink-0" style={{ fontSize: 11 }}>
                            <i className="ri-time-line me-1" />{record?.totalHours} hrs
                        </span>
                    </div>

                    {record?.trainingDescription && (
                        <p className="text-muted mb-2 mt-1" style={{ fontSize: 12, lineHeight: 1.5 }}>
                            {record.trainingDescription}
                        </p>
                    )}

                    <div className="d-flex flex-wrap gap-3 mt-2" style={{ fontSize: 12, color: "#6b7280" }}>
                        <span><i className="ri-building-line me-1" />{centerNames}</span>
                        <span><i className="ri-calendar-line me-1" />{formatDateOnly(record?.from)}</span>
                        <span><i className="ri-arrow-right-line me-1" />{formatDateOnly(record?.to)}</span>
                        <span><i className="ri-group-line me-1" />{totalAttendees} attendees</span>
                        <span><i className="ri-user-line me-1" />by {record?.author?.name || "—"}</span>
                    </div>
                </div>

                <div className="px-3 py-2 d-flex align-items-center justify-content-between" style={{ background: '#f9fafb', borderTop: '1px solid #f1f5f9' }}>
                    <button
                        className="btn btn-soft-primary btn-sm d-flex align-items-center gap-1"
                        onClick={() => navigate(`/trainings/records/${record._id}`)}
                    >
                        <i className="ri-group-line" /> View Attendees
                    </button>
                    <div className="d-flex gap-2">
                        {canEdit && (
                            <button
                                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                                onClick={() => onEdit(record)}
                            >
                                <i className="ri-edit-line" /> Edit
                            </button>
                        )}
                        {hasDeletePermission && (
                            <button
                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                onClick={() => onDelete(record)}
                            >
                                <i className="ri-delete-bin-line" /> Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const TrainingRecords = () => {
    const user = useSelector((state) => state.User);
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [selectedCenter, setSelectedCenter] = useState("ALL");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [appliedFrom, setAppliedFrom] = useState("");
    const [appliedTo, setAppliedTo] = useState("");
    const [editRecord, setEditRecord] = useState(null)
    const [deleteRecord, setDeleteRecord] = useState(null)
    const [deletedLoading, setDeleteLoading] = useState(false);




    const centerOptions = [
        ...(user?.centerAccess?.length > 1 ? [{ value: "ALL", label: "All Centers" }] : []),
        ...(user?.centerAccess?.map((id) => {
            const center = user?.userCenters?.find((c) => c._id === id);
            return { value: id, label: center?.title || "Unknown Center" };
        }) || []),
    ];

    const fetchRecords = useCallback(async () => {
        if (!user?.centerAccess) return;
        setLoading(true);
        try {
            let centers = [];
            if (selectedCenter === "ALL") centers = user?.centerAccess || [];
            else if (selectedCenter) centers = [selectedCenter];

            const response = await getTrainerRecords({
                centers: centers.join(","),
                page,
                limit: LIMIT,
                ...(appliedFrom && { from: appliedFrom }),
                ...(appliedTo && { to: appliedTo }),
            });

            setRecords(response?.data || []);
            setPagination(response?.pagination || {});
        } catch {
            toast.error("Failed to load training records");
        } finally {
            setLoading(false);
        }
    }, [selectedCenter, page, appliedFrom, appliedTo, user?.centerAccess]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleApply = () => {
        setAppliedFrom(from);
        setAppliedTo(to);
        setPage(1);
    };

    const handleClear = () => {
        setFrom("");
        setTo("");
        setAppliedFrom("");
        setAppliedTo("");
        setPage(1);
    };

    const handleDelete = async () => {
        setDeleteLoading(true)
        try {
            console.log("deleteRecord._id", deleteRecord._id);
            await deleteTrainerRecord(deleteRecord._id)
            toast.success("Record deleted successfully")
            setDeleteRecord(null)
            fetchRecords()
        } catch (error) {
            console.log("Error", error)
            toast.error(error?.message || "Error deleting record")
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
            <div className="mb-4">
                <h4 className="fw-bold text-primary mb-0">Training Records</h4>
                <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                    Click "View Attendees" to see attendance details
                </p>
            </div>

            <div className="d-flex align-items-end gap-2 flex-wrap mb-4">
                <div style={{ minWidth: 180 }}>
                    <Select
                        options={centerOptions}
                        value={centerOptions.find((c) => c.value === selectedCenter) || null}
                        onChange={(s) => { setSelectedCenter(s?.value || "ALL"); setPage(1); }}
                        placeholder="Select Center"
                        isClearable={true}
                    />
                </div>
                <input
                    type="date"
                    className="form-control"
                    style={{ width: 160 }}
                    value={from}
                    max={to || undefined}
                    onChange={(e) => setFrom(e.target.value)}
                />
                <input
                    type="date"
                    className="form-control"
                    style={{ width: 160 }}
                    value={to}
                    min={from || undefined}
                    onChange={(e) => setTo(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={handleApply}>Apply</button>
                {(appliedFrom || appliedTo) && (
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleClear}>Clear</button>
                )}
                <span className="ms-auto text-muted fw-semibold" style={{ fontSize: 13 }}>
                    Total: {pagination?.totalRecords || 0}
                </span>
            </div>

            {loading ? (
                <div className="text-center py-5"><Spinner color="primary" /></div>
            ) : !records.length ? (
                <div className="text-center py-5 text-muted">
                    <i className="ri-inbox-line fs-1 d-block mb-2 opacity-25" />
                    No training records found
                </div>
            ) : (
                <>
                    {records.map((record) => (
                        <TrainingCard key={record._id} record={record} onEdit={setEditRecord} onDelete={setDeleteRecord} />
                    ))}

                    <div className="d-flex align-items-center justify-content-between mt-3">
                        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                            Page {pagination?.currentPage} of {pagination?.totalPages}
                        </p>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                <i className="ri-arrow-left-s-line" /> Prev
                            </button>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={page >= (pagination?.totalPages || 1)}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next <i className="ri-arrow-right-s-line" />
                            </button>
                        </div>
                    </div>
                </>
            )}
            <EditTrainerModal
                isOpen={!!editRecord}
                record={editRecord}
                onClose={() => setEditRecord(null)}
                onRefresh={fetchRecords}
            />
            <DeleteTrainerModal
                isOpen={!!deleteRecord}
                record={deleteRecord}
                onConfirm={handleDelete}
                onClose={() => setDeleteRecord(null)}
                loading={deletedLoading}
            />
        </CardBody>

    );
};

export default TrainingRecords;