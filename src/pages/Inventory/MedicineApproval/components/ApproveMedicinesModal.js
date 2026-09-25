import { format } from "date-fns";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    Badge,
    Button,
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
import MedicineApprovalRow from "./MedicineApprovalRow";
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
    const [altSources, setAltSources] = useState({}); // { [prescriptionMedicineId]: [{ key, medicineId, medicineName, pharmacyStockRef, phrId, company, batch, stock, dispensedCount }] }
    const [openAltPickers, setOpenAltPickers] = useState(new Set());
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);
    const autoSelectRef = useRef("idle"); // idle | waiting | loading | done

    useEffect(() => {
        if (isOpen && approvalId) {
            setSelected({});
            setLocalLinks({});
            setOpenPickers(new Set());
            setAltSources({});
            setOpenAltPickers(new Set());
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
            medicineId: med.batch?.medicineId || med.medicine?._id,
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
        if (Number.isFinite(med.remainingQuantity) && med.remainingQuantity <= 0) return false;
        const link = getLink(med);
        return !!link.pharmacyStockRef && Number(link.stock) > 0 && !link.expired;
    };

    // What to default the qty input to for a line: whatever is still owed for
    // a partially-given line, or the full prescribed amount otherwise — capped
    // to what the batch actually has, so ticking a short-stocked line doesn't
    // start out invalid (and hide the "add another source" prompt because of it).
    const defaultQtyFor = (med) => {
        const wanted = (Number.isFinite(med.remainingQuantity) ? med.remainingQuantity : med.totalQuantity) || 1;
        const stock = Number(getLink(med).stock);
        return stock > 0 ? Math.min(wanted, stock) : wanted;
    };

    // How much of a line's remaining quantity is still uncovered by whatever
    // has been staged for it so far this session (primary source + every
    // alternative added on top). Undefined for legacy lines with no known
    // prescribed quantity — there's no defined shortfall to cover there.
    const altQtyFor = (prescriptionMedicineId) =>
        (altSources[prescriptionMedicineId] || []).reduce((sum, a) => sum + (Number(a.dispensedCount) || 0), 0);

    // Batches already staged for this line — its own linked batch plus every
    // alternative already added — so the picker for one more source doesn't
    // offer the same batch again.
    const usedStockRefsFor = (med) => {
        const refs = [];
        const primaryRef = selected[med.prescriptionMedicineId]?.pharmacyStockRef || getLink(med).pharmacyStockRef;
        if (primaryRef) refs.push(primaryRef);
        (altSources[med.prescriptionMedicineId] || []).forEach((a) => refs.push(a.pharmacyStockRef));
        return refs;
    };

    // Whatever's typed in the primary field, capped to what its batch can
    // actually deliver — an over-typed, invalid amount (e.g. 60 typed against
    // 44 in stock) must never appear to cover more than it really can.
    const effectivePrimaryQtyFor = (med) => {
        const stock = Number(getLink(med).stock) || 0;
        const raw = Number(selected[med.prescriptionMedicineId]?.dispensedCount) || 0;
        return Math.min(raw, stock);
    };

    // Total already staged by every OTHER alt source on this line (excluding
    // one given by key) — used to cap each alt qty input against what the
    // rest of the line hasn't already claimed.
    const altQtyExcluding = (prescriptionMedicineId, excludeKey) =>
        (altSources[prescriptionMedicineId] || [])
            .filter((a) => a.key !== excludeKey)
            .reduce((sum, a) => sum + (Number(a.dispensedCount) || 0), 0);

    const sessionRemaining = (med) => {
        if (!Number.isFinite(med.remainingQuantity)) return undefined;
        return med.remainingQuantity - effectivePrimaryQtyFor(med) - altQtyFor(med.prescriptionMedicineId);
    };


    const toggleSelect = (med) => {
        const isUnselecting = !!selected[med.prescriptionMedicineId];

        setSelected((prev) => {
            const next = { ...prev };
            if (next[med.prescriptionMedicineId]) {
                delete next[med.prescriptionMedicineId];
            } else {
                next[med.prescriptionMedicineId] = {
                    prescriptionMedicineId: med.prescriptionMedicineId,
                    pharmacyStockRef: getLink(med).pharmacyStockRef,
                    dispensedCount: defaultQtyFor(med),
                };
            }
            return next;
        });

        // Unchecking the line means "don't dispense this at all" — any
        // alternative sources added on top of it have to go too, otherwise
        // the line would still get submitted from just those, even though
        // the checkbox looks unticked.
        if (isUnselecting) {
            setAltSources((prev) => {
                if (!prev[med.prescriptionMedicineId]?.length) return prev;
                const next = { ...prev };
                delete next[med.prescriptionMedicineId];
                return next;
            });
            cancelAltPicker(med.prescriptionMedicineId);
        }
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
                medicineId: doc.medicineId?._id || doc.medicineId,
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
                    prev[med.prescriptionMedicineId]?.dispensedCount || defaultQtyFor(med),
            },
        }));

        setOpenPickers((prev) => {
            const next = new Set(prev);
            next.delete(med.prescriptionMedicineId);
            return next;
        });
    };

    const handleSelectAll = () => {
        const eligibleMeds = medicines.filter(
            (m) => !m.alreadyDispensed && !m.rejected && !(Number.isFinite(m.remainingQuantity) && m.remainingQuantity <= 0)
        );
        const toSelect = {};
        const unresolved = [];

        eligibleMeds.forEach((med) => {
            const link = getLink(med);
            if (link.pharmacyStockRef && Number(link.stock) > 0 && !link.expired) {
                toSelect[med.prescriptionMedicineId] = {
                    prescriptionMedicineId: med.prescriptionMedicineId,
                    pharmacyStockRef: link.pharmacyStockRef,
                    dispensedCount:
                        selected[med.prescriptionMedicineId]?.dispensedCount || defaultQtyFor(med),
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
        // Unlinking undoes the whole line's dispensing plan, not just its
        // primary batch — any alternative sources added on top go too.
        setAltSources((prev) => {
            if (!prev[med.prescriptionMedicineId]?.length) return prev;
            const next = { ...prev };
            delete next[med.prescriptionMedicineId];
            return next;
        });
        cancelAltPicker(med.prescriptionMedicineId);
    };

    // Opens a second inventory picker for the line — same component as the
    // primary source, scoped to this medicine first, with its own free-text
    // search underneath for anything else (another batch, or a substitute)
    // when nothing scoped is available.
    const openAltPicker = (prescriptionMedicineId) => {
        setOpenAltPickers((prev) => new Set(prev).add(prescriptionMedicineId));
    };

    const cancelAltPicker = (prescriptionMedicineId) => {
        setOpenAltPickers((prev) => {
            const next = new Set(prev);
            next.delete(prescriptionMedicineId);
            return next;
        });
    };

    const handleAltStockPicked = (med, doc) => {
        const centerStock =
            (doc.centers || []).find(
                (c) => String(c.centerId?._id || c.centerId) === String(centerId)
            )?.stock ?? 0;
        const remaining = sessionRemaining(med);
        const defaultQty = Math.max(1, Math.min(Number.isFinite(remaining) ? remaining : centerStock, centerStock));

        setAltSources((prev) => ({
            ...prev,
            [med.prescriptionMedicineId]: [
                ...(prev[med.prescriptionMedicineId] || []),
                {
                    key: `${doc._id}-${Date.now()}`,
                    medicineId: doc.medicineId?._id || doc.medicineId,
                    medicineName: doc.medicineName,
                    pharmacyStockRef: doc._id,
                    phrId: doc.id,
                    company: doc.company,
                    batch: doc.Batch,
                    stock: centerStock,
                    dispensedCount: defaultQty,
                },
            ],
        }));

        cancelAltPicker(med.prescriptionMedicineId);
    };

    const removeAltSource = (prescriptionMedicineId, key) => {
        setAltSources((prev) => ({
            ...prev,
            [prescriptionMedicineId]: (prev[prescriptionMedicineId] || []).filter((a) => a.key !== key),
        }));
    };

    const updateAltDispensedCount = (prescriptionMedicineId, key, value) => {
        setAltSources((prev) => ({
            ...prev,
            [prescriptionMedicineId]: (prev[prescriptionMedicineId] || []).map((a) =>
                a.key === key ? { ...a, dispensedCount: value } : a
            ),
        }));
    };

    // Every stock source staged for a line: the primary (the prescribed
    // medicine's own batch, if selected) plus every alternative added on top.
    const buildSourcesForLine = (prescriptionMedicineId) => {
        const primary = selected[prescriptionMedicineId];
        const alts = altSources[prescriptionMedicineId] || [];
        const list = [];
        if (primary && Number(primary.dispensedCount) > 0) {
            const med = findMedicine(prescriptionMedicineId);
            // The medicine the linked batch actually belongs to — not
            // necessarily the prescribed one, since "change" can swap the
            // primary link to a completely different medicine.
            list.push({
                medicineId: med ? getLink(med).medicineId : undefined,
                pharmacyStockRef: primary.pharmacyStockRef,
                dispensedCount: Number(primary.dispensedCount),
            });
        }
        alts.forEach((a) => {
            if (Number(a.dispensedCount) > 0) {
                list.push({
                    medicineId: a.medicineId,
                    pharmacyStockRef: a.pharmacyStockRef,
                    dispensedCount: Number(a.dispensedCount),
                });
            }
        });
        return list;
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

    // Every line that has something staged this session — a primary source,
    // one or more alternatives, or both.
    const lineIdsForSubmit = [
        ...new Set([
            ...Object.keys(selected),
            ...Object.keys(altSources).filter((id) => (altSources[id] || []).length > 0),
        ]),
    ];

    const canSubmitApprove =
        lineIdsForSubmit.length > 0 &&
        lineIdsForSubmit.every((id) => {
            const sources = buildSourcesForLine(id);
            if (!sources.length || !sources.every((s) => Number.isInteger(s.dispensedCount) && s.dispensedCount > 0)) {
                return false;
            }
            const med = findMedicine(id);
            const remaining = med && Number.isFinite(med.remainingQuantity) ? med.remainingQuantity : undefined;
            const total = sources.reduce((sum, s) => sum + s.dispensedCount, 0);
            if (remaining !== undefined && total > remaining) return false;

            const primary = selected[id];
            const primaryStock = primary && med ? Number(getLink(med).stock) : undefined;
            if (primary && primaryStock !== undefined && Number(primary.dispensedCount) > primaryStock) return false;

            const alts = altSources[id] || [];
            return alts.every((a) => Number(a.dispensedCount) <= Number(a.stock));
        });

    const handleApprove = async () => {
        if (!canAct) return;
        setSubmitting(true);
        try {
            const selectionsPayload = lineIdsForSubmit
                .map((id) => ({ prescriptionMedicineId: id, sources: buildSourcesForLine(id) }))
                .filter((s) => s.sources.length > 0);
            await dispatch(
                submitPilotApproval({
                    approvalId,
                    status: "APPROVED",
                    selections: selectionsPayload,
                    remarks,
                })
            ).unwrap();
            toast.success("Medicines approved");
            setSelected({});
            setLocalLinks({});
            setAltSources({});
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

    const selectedCount = lineIdsForSubmit.length;
    const selectedTotalQty = lineIdsForSubmit.reduce(
        (sum, id) => sum + buildSourcesForLine(id).reduce((s2, src) => s2 + src.dispensedCount, 0),
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
                            // Cap against what's still owed (remainingQuantity) minus whatever
                            // alt sources have already claimed, not the full prescribed
                            // quantity — a partially-given line, or one already topped up
                            // with an alternative, only has the leftover amount to give.
                            const remainingQty = Number.isFinite(med.remainingQuantity)
                                ? med.remainingQuantity - altQtyFor(med.prescriptionMedicineId)
                                : undefined;
                            const maxQty = Math.min(
                                ...[remainingQty, Number(link.stock) > 0 ? Number(link.stock) : undefined].filter(
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

                            const altSourcesForLine = altSources[med.prescriptionMedicineId] || [];

                            return (
                                <MedicineApprovalRow
                                    key={med.prescriptionMedicineId}
                                    med={med}
                                    centerId={centerId}
                                    canAct={canAct}
                                    readOnly={readOnly}
                                    isChecked={isChecked}
                                    dispensedCount={dispensedCount}
                                    pickingHere={pickingHere}
                                    altSourcesForLine={altSourcesForLine}
                                    altPickerOpen={openAltPickers.has(med.prescriptionMedicineId)}
                                    link={link}
                                    resolved={resolved}
                                    eligible={eligible}
                                    remainingQty={remainingQty}
                                    maxQty={maxQty}
                                    sessionRemainingQty={sessionRemaining(med)}
                                    usedStockRefs={usedStockRefsFor(med)}
                                    altMaxQtyFor={(alt) => {
                                        const altRemaining = Number.isFinite(med.remainingQuantity)
                                            ? med.remainingQuantity -
                                              effectivePrimaryQtyFor(med) -
                                              altQtyExcluding(med.prescriptionMedicineId, alt.key)
                                            : undefined;
                                        return Math.min(
                                            ...[Number(alt.stock) || 0, altRemaining].filter((v) => v !== undefined),
                                        );
                                    }}
                                    onRowToggle={handleRowToggle}
                                    onOpenPicker={() => openPicker(med)}
                                    onCancelPicker={() => cancelPicker(med)}
                                    onStockPicked={(doc) => handleStockPicked(med, doc)}
                                    onClearStockLink={() => clearStockLink(med)}
                                    onDispensedCountChange={(value) => updateDispensedCount(med.prescriptionMedicineId, value)}
                                    onOpenAltPicker={() => openAltPicker(med.prescriptionMedicineId)}
                                    onCancelAltPicker={() => cancelAltPicker(med.prescriptionMedicineId)}
                                    onAltStockPicked={(doc) => handleAltStockPicked(med, doc)}
                                    onRemoveAltSource={(key) => removeAltSource(med.prescriptionMedicineId, key)}
                                    onAltDispensedCountChange={(key, value) =>
                                        updateAltDispensedCount(med.prescriptionMedicineId, key, value)
                                    }
                                />
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
