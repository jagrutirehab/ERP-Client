import { format } from "date-fns";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
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
    submitPilotApproval,
} from "../../../../store/features/pharmacy/pharmacySlice";
import PharmacyStockPicker from "./PharmacyStockPicker";
import { renderStatusBadge } from "../../../../Components/Common/renderStatusBadge";
import { usePermissions } from "../../../../Components/Hooks/useRoles";

const ApproveMedicinesModal = ({ isOpen, onClose, approvalId, centerId, readOnly, onDone }) => {
    const dispatch = useDispatch();
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;
    const { hasPermission } = usePermissions(token);
    const canAct = !readOnly && hasPermission("PHARMACY", "MEDICINEAPPROVAL", "WRITE");
    const { data: approval, loading } = useSelector(
        (state) => state.Pharmacy.approvalMedicines
    );
    const [selected, setSelected] = useState({});
    const [localLinks, setLocalLinks] = useState({});
    const [openPickers, setOpenPickers] = useState(new Set());
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);
    const autoSelectRef = useRef("idle"); // idle | waiting | loading | done

    useEffect(() => {
        if (isOpen && approvalId) {
            setSelected({});
            setLocalLinks({});
            setOpenPickers(new Set());
            setRemarks("");
            setShowCompleted(false);
            autoSelectRef.current = "waiting";
            dispatch(
                fetchApprovalMedicines({
                    approvalId,
                    view: readOnly ? "history" : "live",
                })
            );
        }
    }, [isOpen, approvalId, readOnly, dispatch]);

    // The link actually in force for a row: one picked here wins over
    // whatever the prescriber had already linked.
    const getLink = (med) => {
        const local = localLinks[med.prescriptionMedicineId];
        if (local) return { ...local, isLocal: true };
        return {
            pharmacyStockRef: med.pharmacyStockRef,
            phrId: med.batch?.id,
            medicineName: med.batch?.medicineName,
            company: med.batch?.company,
            batch: med.batch?.Batch,
            stock: med.stock,
            expired: med.expired,
            isLocal: false,
        };
    };

    const isResolved = (med) => !!getLink(med).pharmacyStockRef;

    const isEligible = (med) => {
        if (med.alreadyDispensed || med.rejected) return false;
        const link = getLink(med);
        return !!link.pharmacyStockRef && Number(link.stock) > 0 && !link.expired;
    };

    const toggleSelect = (med) => {
        setSelected((prev) => {
            const next = { ...prev };
            if (next[med.prescriptionMedicineId]) {
                delete next[med.prescriptionMedicineId];
            } else {
                next[med.prescriptionMedicineId] = {
                    prescriptionMedicineId: med.prescriptionMedicineId,
                    pharmacyStockRef: getLink(med).pharmacyStockRef,
                    dispensedCount: med.totalQuantity || 1,
                };
            }
            return next;
        });
    };

    const handleStockPicked = (med, doc) => {
        const centerStock =
            (doc.centers || []).find(
                (c) => String(c.centerId?._id || c.centerId) === String(centerId)
            )?.stock ?? 0;

        setLocalLinks((prev) => ({
            ...prev,
            [med.prescriptionMedicineId]: {
                pharmacyStockRef: doc._id,
                phrId: doc.id,
                medicineName: doc.medicineName,
                company: doc.company,
                batch: doc.Batch,
                expiry: doc.Expiry,
                stock: centerStock,
                expired: false, // picker only offers non-expired stock
            },
        }));

        // Linking during approval means they intend to dispense it, so select
        // it too — they can still uncheck or unlink.
        setSelected((prev) => ({
            ...prev,
            [med.prescriptionMedicineId]: {
                prescriptionMedicineId: med.prescriptionMedicineId,
                pharmacyStockRef: doc._id,
                dispensedCount:
                    prev[med.prescriptionMedicineId]?.dispensedCount || med.totalQuantity || 1,
            },
        }));

        setOpenPickers((prev) => {
            const next = new Set(prev);
            next.delete(med.prescriptionMedicineId);
            return next;
        });
    };

    const handleSelectAll = () => {
        const eligibleMeds = medicines.filter((m) => !m.alreadyDispensed && !m.rejected);
        const toSelect = {};
        const unresolved = [];

        eligibleMeds.forEach((med) => {
            const link = getLink(med);
            if (link.pharmacyStockRef && Number(link.stock) > 0 && !link.expired) {
                toSelect[med.prescriptionMedicineId] = {
                    prescriptionMedicineId: med.prescriptionMedicineId,
                    pharmacyStockRef: link.pharmacyStockRef,
                    dispensedCount:
                        selected[med.prescriptionMedicineId]?.dispensedCount || med.totalQuantity || 1,
                };
            } else if (!link.pharmacyStockRef) {
                // Not linked at all — open its picker, same as clicking
                // "Link pharmacy stock" on it individually.
                unresolved.push(med.prescriptionMedicineId);
            }
            // Resolved-but-ineligible rows (0 stock / expired) are left as-is.
        });

        setSelected((prev) => ({ ...prev, ...toSelect }));

        if (unresolved.length) {
            setOpenPickers((prev) => new Set([...prev, ...unresolved]));
        }
    };

    const handleUnselectAll = () => {
        setSelected({});
        setOpenPickers(new Set());
    };

    const openPicker = (med) => {
        setOpenPickers((prev) => new Set(prev).add(med.prescriptionMedicineId));
    };

    const cancelPicker = (med) => {
        setOpenPickers((prev) => {
            const next = new Set(prev);
            next.delete(med.prescriptionMedicineId);
            return next;
        });
    };

    const clearStockLink = (med) => {
        setLocalLinks((prev) => {
            const next = { ...prev };
            delete next[med.prescriptionMedicineId];
            return next;
        });
        setSelected((prev) => {
            const next = { ...prev };
            delete next[med.prescriptionMedicineId];
            return next;
        });
    };

    const updateDispensedCount = (prescriptionMedicineId, value) => {
        setSelected((prev) => {
            if (!prev[prescriptionMedicineId]) return prev;
            return {
                ...prev,
                [prescriptionMedicineId]: {
                    ...prev[prescriptionMedicineId],
                    dispensedCount: value,
                },
            };
        });
    };

    const findMedicine = (prescriptionMedicineId) =>
        (approval?.medicines || []).find((m) => m.prescriptionMedicineId === prescriptionMedicineId);

    const canSubmitApprove =
        Object.keys(selected).length > 0 &&
        Object.entries(selected).every(([id, s]) => {
            const qty = Number(s.dispensedCount);
            const med = findMedicine(id);
            const stock = med ? getLink(med).stock : undefined;
            const prescribed = Number(med?.totalQuantity);
            return (
                Number.isInteger(qty) &&
                qty > 0 &&
                (stock === undefined || qty <= Number(stock)) &&
                !(prescribed > 0 && qty > prescribed)
            );
        });

    const handleApprove = async () => {
        if (!canAct) return;
        setSubmitting(true);
        try {
            await dispatch(
                submitPilotApproval({
                    approvalId,
                    status: "APPROVED",
                    selections: Object.values(selected),
                    remarks,
                })
            ).unwrap();
            toast.success("Medicines approved");
            setSelected({});
            setLocalLinks({});
            onDone && onDone();
            onClose();
        } catch (err) {
            toast.error(err?.message || "Failed to approve medicines");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!canAct) return;
        setSubmitting(true);
        try {
            await dispatch(
                submitPilotApproval({ approvalId, status: "REJECTED", remarks })
            ).unwrap();
            toast.success("Approval rejected");
            onDone && onDone();
            onClose();
        } catch (err) {
            toast.error(err?.message || "Failed to reject");
        } finally {
            setSubmitting(false);
        }
    };

    const medicines = approval?.medicines || [];

    useEffect(() => {
        if (!isOpen || !canAct) return;
        if (loading) {
            autoSelectRef.current = "loading";
        } else if (autoSelectRef.current === "loading" && approval) {
            autoSelectRef.current = "done";
            handleSelectAll();
        }
    }, [isOpen, canAct, loading, approval]);

    // Whether every currently-selectable medicine (resolved + eligible, not
    // already given/rejected) is checked — flips the toggle button between
    // "Select All" and "Unselect All".
    const selectableMeds = medicines.filter(
        (m) => !m.alreadyDispensed && !m.rejected && isEligible(m)
    );
    const allSelectable =
        selectableMeds.length > 0 &&
        selectableMeds.every((m) => !!selected[m.prescriptionMedicineId]);

    const completedMeds = medicines.filter((m) => m.alreadyDispensed || m.rejected);
    const visibleMeds =
        readOnly || showCompleted
            ? medicines
            : medicines.filter((m) => !m.alreadyDispensed && !m.rejected);

    // History summary: how much of what was prescribed was actually given.
    // Medicines given in an earlier round are shown for context but not counted
    // as part of this record.
    const givenCount = medicines.filter((m) => m.alreadyDispensed && !m.givenEarlier).length;
    const givenEarlierCount = medicines.filter((m) => m.givenEarlier).length;
    const notGivenCount = medicines.length - givenCount - givenEarlierCount;
    const givenUnits = medicines.reduce(
        (sum, m) => sum + (m.alreadyDispensed && !m.givenEarlier ? Number(m.dispensedCount) || 0 : 0),
        0
    );

    const selectedCount = Object.keys(selected).length;
    const selectedTotalQty = Object.values(selected).reduce(
        (sum, s) => sum + (Number(s.dispensedCount) || 0),
        0
    );

    return (
        <Modal isOpen={isOpen} toggle={onClose} size="xl">
            <ModalHeader toggle={onClose}>
                {canAct ? "Approve Medicines" : "Medicines"}
            </ModalHeader>
            <ModalBody>
                {loading && (
                    <div className="text-center py-4">
                        <Spinner />
                    </div>
                )}

                {!loading && approval && (
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <div className="fw-semibold">
                                Prescribed{" "}
                                {approval.prescriptionDate
                                    ? format(new Date(approval.prescriptionDate), "dd MMM yyyy")
                                    : "-"}
                                {approval.doctorName ? ` by ${approval.doctorName}` : ""}
                            </div>
                            {approval.approvalStatus && renderStatusBadge(approval.approvalStatus)}
                            {readOnly && medicines.length > 0 && (
                                <div className="small text-muted mt-1">
                                    {givenCount} medicine{givenCount === 1 ? "" : "s"} given
                                    {givenEarlierCount > 0 && ` · ${givenEarlierCount} given earlier`}
                                    {notGivenCount > 0 && ` · ${notGivenCount} not given`}
                                    {` · ${givenUnits} unit${givenUnits === 1 ? "" : "s"} dispensed`}
                                </div>
                            )}
                        </div>
                        {canAct && (
                            <div className="d-flex gap-2">
                                {/* Select All / Unselect All — commented out for now (auto-selected on open).
                                <Button
                                    color={allSelectable ? "secondary" : "primary"}
                                    size="sm"
                                    outline
                                    disabled={submitting || medicines.length === 0}
                                    onClick={allSelectable ? handleUnselectAll : handleSelectAll}
                                >
                                    {allSelectable ? "Unselect All" : "Select All"}
                                </Button>
                                */}
                                {["PENDING", "PARTIALLY_PENDING"].includes(approval.approvalStatus) && (
                                    <Button
                                        color="danger"
                                        size="sm"
                                        className="text-white"
                                        disabled={submitting}
                                        onClick={handleReject}
                                    >
                                        Reject
                                    </Button>
                                )}
                            </div>
                        )}
                        {!readOnly && !canAct && (
                            <Badge color="light" className="text-muted border">
                                View only
                            </Badge>
                        )}
                    </div>
                )}

                {!loading && medicines.length === 0 && (
                    <div className="text-muted text-center py-4">
                        {readOnly
                            ? "No approval history found for this prescription."
                            : "No currently active medicines found for this prescription."}
                    </div>
                )}

                {!loading && !readOnly && completedMeds.length > 0 && (
                    <div className="mb-2">
                        <Button
                            color="link"
                            size="sm"
                            className="p-0"
                            onClick={() => setShowCompleted((v) => !v)}
                        >
                            {showCompleted ? "Hide" : "Show"} {completedMeds.length} already given/rejected
                        </Button>
                    </div>
                )}

                {!loading && medicines.length > 0 && visibleMeds.length === 0 && (
                    <div className="text-muted text-center py-3">
                        Everything here has already been given or rejected.
                    </div>
                )}

                {!loading && visibleMeds.length > 0 && (
                    <Row>
                        {visibleMeds.map((med) => {
                            const link = getLink(med);
                            const resolved = isResolved(med);
                            const isChecked = !!selected[med.prescriptionMedicineId];
                            const eligible = med.alreadyDispensed ? true : isEligible(med);
                            const pickingHere = openPickers.has(med.prescriptionMedicineId);

                            const dispensedCount = selected[med.prescriptionMedicineId]?.dispensedCount;
                            const exceedsStock =
                                isChecked && Number(dispensedCount) > Number(link.stock);
                            const prescribedQty = Number(med.totalQuantity) > 0 ? Number(med.totalQuantity) : undefined;
                            const exceedsPrescribed =
                                isChecked && prescribedQty !== undefined && Number(dispensedCount) > prescribedQty;
                            const maxQty = Math.min(
                                ...[prescribedQty, Number(link.stock) > 0 ? Number(link.stock) : undefined].filter(
                                    (v) => v !== undefined,
                                ),
                            );

                            const rowDisabled = med.alreadyDispensed || (resolved && !eligible);
                            const canToggle = canAct && !rowDisabled;
                            const handleRowToggle = () => {
                                if (!canToggle) return;
                                if (resolved) toggleSelect(med);
                                else openPicker(med);
                            };

                            return (
                                <Col xs={12} lg={6} key={med.prescriptionMedicineId} className="mb-3">
                                <div
                                    className="d-flex justify-content-between align-items-start p-2 border rounded h-100"
                                    style={{ backgroundColor: "#f4f7fb" }}
                                >
                                <div className="d-flex align-items-start gap-2 w-100">
                                    {canAct && (
                                        <Input
                                            type="checkbox"
                                            className="mt-1"
                                            style={
                                                med.alreadyDispensed || isChecked
                                                    ? undefined
                                                    : { backgroundColor: "#fff", borderColor: "#6c757d" }
                                            }
                                            checked={med.alreadyDispensed || isChecked}
                                            disabled={rowDisabled}
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
                                        <div
                                            className="small text-muted"
                                            style={canToggle ? { cursor: "pointer" } : undefined}
                                            onClick={handleRowToggle}
                                        >
                                            {med.dosageAndFrequency?.morning || 0}-
                                            {med.dosageAndFrequency?.evening || 0}-
                                            {med.dosageAndFrequency?.night || 0} · {med.duration} {med.unit}
                                            {!readOnly && ` · Total qty (by duration): ${med.totalQuantity}`}
                                        </div>
                                        {med.alreadyDispensed && (
                                            <div className="small">
                                                {/* In the live view every given medicine was given in a
                                                    previous round (this session hasn't submitted yet). */}
                                                {med.givenEarlier || !readOnly ? (
                                                    <Badge color="secondary">
                                                        Given earlier — {med.dispensedCount} of {med.totalQuantity}
                                                    </Badge>
                                                ) : (
                                                    <Badge color="success">
                                                        Given — {med.dispensedCount} of {med.totalQuantity}
                                                    </Badge>
                                                )}
                                                {med.batch && (
                                                    <div className="text-muted mt-1">
                                                        {med.batch.medicineName && <>{med.batch.medicineName} · </>}
                                                        {med.batch.id && <> {med.batch.id} · </>}
                                                        Batch: {med.batch.Batch || "-"}
                                                        {med.batch.company && <> · {med.batch.company}</>}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {!med.alreadyDispensed && med.rejected && (
                                            <Badge color="danger">Rejected — not dispensed</Badge>
                                        )}
                                        {readOnly && !med.alreadyDispensed && !med.rejected && (
                                            <Badge color="secondary">Not given</Badge>
                                        )}
                                        {readOnly && !med.alreadyDispensed && (
                                            <div className="small text-muted mt-1">
                                                Prescribed qty: {med.totalQuantity} · Given: 0
                                            </div>
                                        )}
                                        {!readOnly && !med.alreadyDispensed && !med.rejected && resolved && !pickingHere && (
                                            <div className="small d-flex align-items-center gap-2 flex-wrap">
                                                <span>
                                                    {link.medicineName && <>{link.medicineName} · </>}
                                                    {link.phrId && <> {link.phrId} · </>}
                                                    Batch: {link.batch || "-"}
                                                    {link.company && <> · {link.company}</>}
                                                    {" · Stock: "}{link.stock}
                                                    {link.expired && (
                                                        <span className="text-danger ms-1">EXPIRED</span>
                                                    )}
                                                </span>
                                                {canAct && (
                                                    <>
                                                        <Button
                                                            color="link"
                                                            size="sm"
                                                            className="p-0"
                                                            onClick={() => openPicker(med)}
                                                        >
                                                            change
                                                        </Button>
                                                        {link.isLocal && (
                                                            <Button
                                                                color="link"
                                                                size="sm"
                                                                className="p-0 text-danger"
                                                                onClick={() => clearStockLink(med)}
                                                            >
                                                                unlink
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {!med.alreadyDispensed && !med.rejected && !resolved && canAct && !pickingHere && (
                                            <span className="small text-muted">Tick to select from inventory</span>
                                        )}
                                        {canAct && pickingHere && (
                                            <div className="mt-2" style={{ width: "100%" }}>
                                                <PharmacyStockPicker
                                                    centerId={centerId}
                                                    medicineId={med.medicine?._id}
                                                    selectedPharmacyId={link.pharmacyStockRef}
                                                    onSelect={(doc) => handleStockPicked(med, doc)}
                                                    onCancel={() => cancelPicker(med)}
                                                />
                                            </div>
                                        )}
                                        {!med.alreadyDispensed && canAct && isChecked && (
                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                <label className="small text-muted mb-0">
                                                    Qty to dispense:
                                                </label>
                                                <Input
                                                    type="number"
                                                    bsSize="sm"
                                                    min={1}
                                                    step={1}
                                                    max={Number.isFinite(maxQty) ? maxQty : undefined}
                                                    style={{ width: "90px" }}
                                                    value={dispensedCount ?? ""}
                                                    invalid={exceedsStock || exceedsPrescribed}
                                                    onKeyDown={(e) => {
                                                        // Whole units only: no decimals, exponents or signs.
                                                        if ([".", ",", "e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        if (raw === "") {
                                                            updateDispensedCount(med.prescriptionMedicineId, "");
                                                        } else if (Number.isInteger(Number(raw))) {
                                                            updateDispensedCount(med.prescriptionMedicineId, Number(raw));
                                                        }
                                                    }}
                                                />
                                                {exceedsStock && (
                                                    <span className="small text-danger">
                                                        Exceeds available stock ({link.stock})
                                                    </span>
                                                )}
                                                {exceedsPrescribed && (
                                                    <span className="small text-danger">
                                                        Can't exceed prescribed qty ({prescribedQty})
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </div>
                                </Col>
                            );
                        })}
                    </Row>
                )}

                {canAct && (
                    <Input
                        type="textarea"
                        rows={2}
                        className="mt-3"
                        placeholder="Remarks (optional)"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                )}
            </ModalBody>
            {canAct && (
                <ModalFooter className="d-flex justify-content-between align-items-center">
                    <div className="small text-muted">
                        {selectedCount > 0
                            ? `${selectedCount} medicine${selectedCount === 1 ? "" : "s"} selected · dispensing ${selectedTotalQty} unit${selectedTotalQty === 1 ? "" : "s"} total`
                            : "No medicines selected yet"}
                    </div>
                    <div className="d-flex gap-2">
                        <Button color="secondary" onClick={onClose} disabled={submitting}>
                            Close
                        </Button>
                        <Button
                            color="success"
                            className="text-white"
                            disabled={!canSubmitApprove || submitting}
                            onClick={handleApprove}
                        >
                            {submitting ? <Spinner size="sm" /> : "Approve Selected"}
                        </Button>
                    </div>
                </ModalFooter>
            )}
        </Modal>
    );
};

ApproveMedicinesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    approvalId: PropTypes.string,
    centerId: PropTypes.string,
    readOnly: PropTypes.bool,
    onDone: PropTypes.func,
};

export default ApproveMedicinesModal;
