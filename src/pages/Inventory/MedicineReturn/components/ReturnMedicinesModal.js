import { format } from "date-fns";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    Badge,
    Button,
    Col,
    Input,
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

    const toggleSelect = (med) => {
        setSelected((prev) => {
            const next = { ...prev };
            if (next[med.prescriptionMedicineId]) {
                delete next[med.prescriptionMedicineId];
            } else {
                next[med.prescriptionMedicineId] = { returnQty: "", remarks: "" };
            }
            return next;
        });
    };

    const updateSelection = (prescriptionMedicineId, field, value) => {
        setSelected((prev) => {
            if (!prev[prescriptionMedicineId]) return prev;
            return {
                ...prev,
                [prescriptionMedicineId]: { ...prev[prescriptionMedicineId], [field]: value },
            };
        });
    };

    const canSubmit =
        Object.keys(selected).length > 0 &&
        Object.entries(selected).every(([id, s]) => {
            const qty = Number(s.returnQty);
            const med = medicines.find((m) => m.prescriptionMedicineId === id);
            return Number.isInteger(qty) && qty > 0 && qty <= (med?.returnableCount || 0);
        });

    const handleReturn = async () => {
        if (!canAct || !canSubmit) return;
        setSubmitting(true);
        try {
            const items = Object.entries(selected).map(([prescriptionMedicineId, s]) => ({
                prescriptionMedicineId,
                returnQty: Number(s.returnQty),
                remarks: s.remarks || "",
            }));

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
    const selectedTotalQty = Object.values(selected).reduce(
        (sum, s) => sum + (Number(s.returnQty) || 0),
        0
    );

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
                            const qty = selected[med.prescriptionMedicineId]?.returnQty ?? "";
                            const invalidQty =
                                isChecked &&
                                qty !== "" &&
                                (!Number.isInteger(Number(qty)) || Number(qty) <= 0 || Number(qty) > med.returnableCount);
                            const canToggle = canAct && canReturn;
                            const handleRowToggle = () => {
                                if (!canToggle) return;
                                toggleSelect(med);
                            };

                            return (
                                <Col xs={12} lg={6} key={med.prescriptionMedicineId} className="mb-3">
                                    <div
                                        className="d-flex align-items-start gap-2 p-2 border rounded h-100"
                                        style={{ backgroundColor: "#f4f7fb" }}
                                    >
                                        {canAct && canReturn && (
                                            <Input
                                                type="checkbox"
                                                className="mt-1"
                                                style={isChecked ? undefined : { backgroundColor: "#fff", borderColor: "#6c757d" }}
                                                checked={isChecked}
                                                onChange={handleRowToggle}
                                            />
                                        )}
                                        <div className="flex-grow-1">
                                            <div
                                                className="fw-semibold"
                                                style={canToggle ? { cursor: "pointer" } : undefined}
                                                onClick={handleRowToggle}
                                            >
                                                {med.medicine?.type} {med.medicine?.name} {med.medicine?.strength}
                                            </div>
                                            <div className="small text-muted">
                                                Dispensed: {med.dispensedCount}
                                            </div>
                                            {med.batch && (
                                                <div className="small text-muted">
                                                    {med.batch.medicineName && <>{med.batch.medicineName} · </>}
                                                    {med.batch.id && <>{med.batch.id} · </>}
                                                    Batch: {med.batch.Batch || "-"}
                                                    {med.batch.company && <> · {med.batch.company}</>}
                                                </div>
                                            )}

                                            {canAct && isChecked && (
                                                <>
                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                        <label className="small text-muted mb-0">Qty to return:</label>
                                                        <Input
                                                            type="number"
                                                            bsSize="sm"
                                                            min={1}
                                                            step={1}
                                                            max={med.returnableCount}
                                                            style={{ width: "90px" }}
                                                            value={qty}
                                                            invalid={invalidQty}
                                                            disabled={submitting}
                                                            onKeyDown={(e) => {
                                                                if ([".", ",", "e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                            }}
                                                            onChange={(e) => {
                                                                const raw = e.target.value;
                                                                if (raw === "") {
                                                                    updateSelection(med.prescriptionMedicineId, "returnQty", "");
                                                                } else if (Number.isInteger(Number(raw))) {
                                                                    updateSelection(med.prescriptionMedicineId, "returnQty", Number(raw));
                                                                }
                                                            }}
                                                        />
                                                        {invalidQty && (
                                                            <span className="small text-danger">
                                                                Max {med.returnableCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        bsSize="sm"
                                                        className="mt-2"
                                                        placeholder="Remarks (optional)"
                                                        value={selected[med.prescriptionMedicineId]?.remarks || ""}
                                                        disabled={submitting}
                                                        onChange={(e) =>
                                                            updateSelection(med.prescriptionMedicineId, "remarks", e.target.value)
                                                        }
                                                    />
                                                </>
                                            )}
                                            {med.returned && (
                                                <Badge color="secondary" className="mt-2">
                                                    Already returned
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Col>
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
