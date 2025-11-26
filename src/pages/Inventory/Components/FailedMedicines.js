import { useEffect, useState } from "react";
import {
    getFailedMedicinesBatches,
    downloadFailedMedicines,
    deleteFailedMedicinesByBatch,
} from "../../../helpers/backend_helper";
import { useSelector } from "react-redux";
import { Button, Spinner } from "reactstrap";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const FailedMedicines = ({ isOpen, hasPermission }) => {
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [downloading, setDownloading] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        action: null,
        batchId: null,
        centers: [],
        message: "",
    });

    const { centerAccess } = useSelector((state) => state.User);

    useEffect(() => {
        if (!isOpen) return;

        const fetchBatches = async () => {
            setLoading(true);
            try {
                const res = await getFailedMedicinesBatches({
                    centers: centerAccess,
                    page,
                    limit: 5,
                });

                setBatches(res?.data || []);
                setPagination(res?.pagination || {});
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch failed batches.");
            } finally {
                setLoading(false);
            }
        };

        fetchBatches();
    }, [isOpen, page, centerAccess]);

    const handleDownload = async (batchId, centers) => {
        try {
            setDownloading(batchId);
            const res = await downloadFailedMedicines({
                batchId,
                centers: centers.map((c) => c._id),
            });

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `failed_medicines_${batchId}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Download completed. Data deleted permanently.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download file.");
        } finally {
            setDownloading(null);
        }
    };

    const handleDeleteBatch = (batchId, centers) => {
        setConfirmModal({
            open: true,
            action: "delete-one",
            batchId,
            centers,
            message: "Are you sure you want to permanently delete this batch?",
        });
    };

    const handleDeleteAll = () => {
        setConfirmModal({
            open: true,
            action: "delete-all",
            message: "Delete all failed medicine batches? This action cannot be undone.",
        });
    };

    const handleConfirmAction = async () => {
        const { action, batchId } = confirmModal;
        setConfirmModal((prev) => ({ ...prev, open: false }));

        if (action === "delete-one") {
            try {
                setDeleting(batchId);
                await deleteFailedMedicinesByBatch({ batchId });
                toast.success("Batch deleted successfully.");
                setBatches((prev) => prev.filter((b) => b.batchId !== batchId));
            } catch {
                toast.error("Failed to delete batch.");
            } finally {
                setDeleting(null);
            }
        } else if (action === "delete-all") {
            try {
                setLoading(true);
                await deleteFailedMedicinesByBatch({
                    status: "ALL",
                    centers: centerAccess,
                });
                toast.success("All failed batches deleted successfully.");
                setBatches([]);
            } catch {
                toast.error("Failed to delete all failed batches.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancelAction = () => {
        setConfirmModal({
            open: false,
            action: null,
            batchId: null,
            centers: [],
            message: "",
        });
    };



    return (
        <div className="p-3">
            {loading ? (
                <div className="text-center py-5">
                    <Spinner /> Loading failed batches...
                </div>
            ) : batches.length === 0 ? (
                <div className="text-center text-muted py-5">
                    No failed medicine batches found.
                </div>
            ) : (
                <>
                    {hasPermission("PHARMACY", "PHARMACYMANAGEMENT", "DELETE") ? <div className="d-flex justify-content-end mb-3">
                        <Button
                            color="danger"
                            size="sm"
                            className="fw-semibold text-white"
                            onClick={handleDeleteAll}
                        >
                            Delete All Failed Batches
                        </Button>
                    </div> : ""}

                    {batches.map((batch) => {
                        const formattedDate = dayjs(batch.createdAt).format(
                            "DD MMM YYYY, hh:mm A"
                        );
                        const centersText =
                            batch.centers?.map((c) => c.title).join(", ") || "N/A";

                        return (
                            <div
                                key={batch.batchId}
                                className="border rounded-3 p-3 mb-3 bg-light shadow-sm"
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="fw-semibold mb-1 text-primary">
                                            Batch ID: {batch.batchId}
                                        </h6>
                                        <p className="mb-1 text-muted small">
                                            Centers: {centersText}
                                        </p>
                                        <p className="mb-1 text-muted small">
                                            Failed Records:{" "}
                                            <span className="fw-semibold text-danger">
                                                {batch.count || 0}
                                            </span>
                                        </p>
                                        <p className="mb-0 text-muted small">
                                            Uploaded on {formattedDate}
                                        </p>
                                    </div>

                                    <div className="text-end">
                                        <div className="d-flex flex-column align-items-end gap-2">
                                            <Button
                                                color="primary"
                                                size="sm"
                                                className="text-white"
                                                onClick={() =>
                                                    handleDownload(batch.batchId, batch.centers)
                                                }
                                            >
                                                {downloading === batch.batchId ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    "Download"
                                                )}
                                            </Button>

                                            {hasPermission("PHARMACY", "PHARMACYMANAGEMENT", "DELETE") ? <Button
                                                color="danger"
                                                size="sm"
                                                className="text-white"
                                                onClick={() =>
                                                    handleDeleteBatch(batch.batchId, batch.centers)
                                                }
                                            >
                                                {deleting === batch.batchId ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    "Delete"
                                                )}
                                            </Button> : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </>
            )}

            {batches.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <Button
                        color="secondary"
                        size="sm"
                        disabled={!pagination.hasPrev}
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    >
                        Prev
                    </Button>

                    <span className="small text-muted">
                        Page {pagination?.page} of {pagination?.totalPages}
                    </span>

                    <Button
                        color="secondary"
                        size="sm"
                        disabled={!pagination.hasNext}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {confirmModal.open && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(2px)",
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title text-danger">Confirm Action</h5>
                            </div>
                            <div className="modal-body">
                                <p className="mb-0 text-muted">{confirmModal.message}</p>
                            </div>
                            <div className="modal-footer">
                                <Button color="secondary" onClick={handleCancelAction}>
                                    Cancel
                                </Button>
                                <Button color="danger" onClick={handleConfirmAction}>
                                    Yes, Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FailedMedicines;
