import { format } from "date-fns";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    Badge,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner,
} from "reactstrap";
import {
    fetchApprovalMedicines,
    returnMedicine,
} from "../../../../store/features/pharmacy/pharmacySlice";
import ReturnMedicineRow from "./ReturnMedicineRow";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import { usePermissions } from "../../../../Components/Hooks/useRoles";

const ReturnMedicinesModal = ({ isOpen, onClose, approvalId, centerId, onDone }) => {
    const dispatch = useDispatch();
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission } = usePermissions(token);
    const canAct = hasPermission("PHARMACY", "MEDICINE_RETURN", "WRITE");
    const { data: approval, loading } = useSelector(
        (state) => state.Pharmacy.approvalMedicines
    );
    const [selected, setSelected] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showReturned, setShowReturned] = useState(false);

    const reload = () => {
        dispatch(fetchApprovalMedicines({ approvalId, view: "history" }));
    };

    useEffect(() => {
        if (isOpen && approvalId) {
            setSelected({});
            setShowReturned(false);
            reload();
        }
    }, [isOpen, approvalId, dispatch]);

    const medicines = (approval?.medicines || []).filter((m) => m.alreadyDispensed);
    const returnedMeds = medicines.filter((m) => m.returned);
    const visibleMeds = showReturned ? medicines : medicines.filter((m) => !m.returned);

    const sourcesForLine = (med) =>
        med.sources && med.sources.length
            ? med.sources
            : med.pharmacyStockRef && med.batch
                ? [
                    {
                        pharmacyStockRef: med.pharmacyStockRef,
                        medicineId: med.batch.medicineId,
                        medicineName: med.batch.medicineName,
                        batch: med.batch,
                        dispensedCount: med.dispensedCount,
                    },
                ]
                : [];

    const lineCredits = (med, sel) =>
        sourcesForLine(med)
            .map((src, index) => ({ src, index, qty: Number(sel?.perSource?.[index]) || 0 }))
            .filter((c) => c.qty > 0);

    const lineTotal = (med, sel) => lineCredits(med, sel).reduce((sum, c) => sum + c.qty, 0);

    const lineHasInvalid = (med, sel) =>
        sourcesForLine(med).some((src, index) => {
            const raw = sel?.perSource?.[index];
            if (raw === undefined || raw === "") return false;
            const qty = Number(raw);
            return !Number.isInteger(qty) || qty < 0 || qty > (Number(src.dispensedCount) || 0);
        });

    const toggleSelect = (med) => {
        setSelected((prev) => {
            const next = { ...prev };
            if (next[med.prescriptionMedicineId]) {
                delete next[med.prescriptionMedicineId];
            } else {
                next[med.prescriptionMedicineId] = { perSource: {}, remarks: "" };
            }
            return next;
        });
    };

    const updatePerSourceQty = (prescriptionMedicineId, sourceIndex, value) => {
        setSelected((prev) => {
            if (!prev[prescriptionMedicineId]) return prev;
            return {
                ...prev,
                [prescriptionMedicineId]: {
                    ...prev[prescriptionMedicineId],
                    perSource: { ...prev[prescriptionMedicineId].perSource, [sourceIndex]: value },
                },
            };
        });
    };

    const updateRemarks = (prescriptionMedicineId, value) => {
        setSelected((prev) => {
            if (!prev[prescriptionMedicineId]) return prev;
            return { ...prev, [prescriptionMedicineId]: { ...prev[prescriptionMedicineId], remarks: value } };
        });
    };

    const canSubmit =
        Object.keys(selected).length > 0 &&
        Object.entries(selected).every(([id, sel]) => {
            const med = medicines.find((m) => m.prescriptionMedicineId === id);
            if (!med || lineHasInvalid(med, sel)) return false;
            return lineTotal(med, sel) > 0;
        });

    const handleReturn = async () => {
        if (!canAct || !canSubmit) return;
        setSubmitting(true);
        try {
            const items = Object.entries(selected)
                .map(([prescriptionMedicineId, sel]) => {
                    const med = medicines.find((m) => m.prescriptionMedicineId === prescriptionMedicineId);
                    const credits = lineCredits(med, sel).map((c) => ({
                        pharmacyStockRef: c.src.pharmacyStockRef,
                        sourceIndex: c.index,
                        qty: c.qty,
                    }));
                    return { prescriptionMedicineId, credits, remarks: sel.remarks || "" };
                })
                .filter((item) => item.credits.length > 0);

            const response = await dispatch(returnMedicine({ approvalId, items })).unwrap();
            const failed = (response?.results || []).filter((r) => !r.success);

            if (failed.length === 0) {
                toast.success(`${items.length} medicine${items.length === 1 ? "" : "s"} returned to inventory`);
            } else if (failed.length < items.length) {
                toast.warning(`${items.length - failed.length} returned, ${failed.length} failed`);
            } else {
                toast.error(failed[0]?.message || "Failed to return medicines");
            }

            setSelected({});
            reload();
            onDone && onDone();
            if (failed.length === 0) onClose();
        } catch (err) {
            toast.error(err?.message || "Failed to return medicines");
        } finally {
            setSubmitting(false);
        }
    };

    const selectedCount = Object.keys(selected).length;
    const selectedTotalQty = Object.entries(selected).reduce((sum, [id, sel]) => {
        const med = medicines.find((m) => m.prescriptionMedicineId === id);
        return sum + (med ? lineTotal(med, sel) : 0);
    }, 0);

    return (
        <Modal isOpen={isOpen} toggle={onClose} size="xl">
            <ModalHeader toggle={onClose}>Return Medicines</ModalHeader>
            <ModalBody>
                {loading && (
                    <div className="text-center py-4">
                        <Spinner />
                    </div>
                )}

                {!loading && approval && (
                    <div className="mb-3">
                        <div className="fw-semibold">
                            Prescribed{" "}
                            {approval.prescriptionDate
                                ? format(new Date(approval.prescriptionDate), "dd MMM yyyy")
                                : "-"}
                            {approval.doctorName ? ` by ${approval.doctorName}` : ""}
                        </div>
                        {approval.approvalStatus && renderStatusBadge(approval.approvalStatus)}
                        {!canAct && (
                            <Badge color="light" className="text-muted border ms-2">
                                View only
                            </Badge>
                        )}
                    </div>
                )}

                {!loading && medicines.length === 0 && (
                    <div className="text-muted text-center py-4">
                        No dispensed medicines found on this record.
                    </div>
                )}

                {!loading && returnedMeds.length > 0 && (
                    <div className="mb-2">
                        <Button
                            color="link"
                            size="sm"
                            className="p-0"
                            onClick={() => setShowReturned((v) => !v)}
                        >
                            {showReturned ? "Hide" : "Show"} {returnedMeds.length} already returned
                        </Button>
                    </div>
                )}

                {!loading && medicines.length > 0 && visibleMeds.length === 0 && (
                    <div className="text-muted text-center py-3">
                        Everything here has already been returned.
                    </div>
                )}

                {!loading && visibleMeds.length > 0 && (
                    <Row>
                        {visibleMeds.map((med) => {
                            const canReturn = med.returnableCount > 0;
                            const isChecked = !!selected[med.prescriptionMedicineId];
                            const sel = selected[med.prescriptionMedicineId];
                            const sources = sourcesForLine(med);
                            const lineQty = isChecked ? lineTotal(med, sel) : 0;
                            const canToggle = canAct && canReturn;

                            return (
                                <ReturnMedicineRow
                                    key={med.prescriptionMedicineId}
                                    med={med}
                                    sources={sources}
                                    sel={sel}
                                    isChecked={isChecked}
                                    canReturn={canReturn}
                                    canAct={canAct}
                                    submitting={submitting}
                                    lineQty={lineQty}
                                    onRowToggle={() => canToggle && toggleSelect(med)}
                                    onSourceQtyChange={(sourceIndex, value) =>
                                        updatePerSourceQty(med.prescriptionMedicineId, sourceIndex, value)
                                    }
                                    onRemarksChange={(value) => updateRemarks(med.prescriptionMedicineId, value)}
                                />
                            );
                        })}
                    </Row>
                )}
            </ModalBody>
            {canAct && (
                <ModalFooter className="d-flex justify-content-between align-items-center">
                    <div className="small text-muted">
                        {selectedCount > 0
                            ? `${selectedCount} medicine${selectedCount === 1 ? "" : "s"} selected · returning ${selectedTotalQty} unit${selectedTotalQty === 1 ? "" : "s"} total`
                            : "No medicines selected yet"}
                    </div>
                    <div className="d-flex gap-2">
                        <Button color="secondary" onClick={onClose} disabled={submitting}>
                            Close
                        </Button>
                        <Button
                            color="primary"
                            className="text-white"
                            disabled={!canSubmit || submitting}
                            onClick={handleReturn}
                        >
                            {submitting ? <Spinner size="sm" /> : "Return Selected"}
                        </Button>
                    </div>
                </ModalFooter>
            )}
        </Modal>
    );
};

ReturnMedicinesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    approvalId: PropTypes.string,
    centerId: PropTypes.string,
    onDone: PropTypes.func,
};

export default ReturnMedicinesModal;
