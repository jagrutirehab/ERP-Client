import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Row,
    Col,
    FormGroup,
    Label,
    Input,
    Button,
    Spinner,
} from "reactstrap";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import {
    submitInternalTransferRequisition,
    editInternalTransferRequisition,
    fetchInternalTransferById,
    searchPharmacyInventory,
} from "../../../../../store/features/pharmacy/pharmacySlice";

/* ─── safe string extractor — handles populated mongoose refs ───────────────── */
const str = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    return v.name || v.title || v.label || "";
};

/* ─── shared mini-styles ────────────────────────────────────────────────────── */
const CARD_STYLE = { borderRadius: 12, border: "1px solid #eef0f7" };
const HEADER_STYLE = {
    background: "var(--bs-light,#f8f9fa)",
    borderBottom: "1px solid #eef0f7",
    borderRadius: "12px 12px 0 0",
};
const TABLE_HEAD_STYLE = { background: "var(--bs-primary)", color: "#fff" };

const stepCircle = (active) => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    background: active ? "var(--bs-primary)" : "#e9ecef",
    color: active ? "#fff" : "#adb5bd",
});

const pill = (bg, color) => ({
    background: bg,
    color,
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 700,
});

const stockPill = (n) =>
    n === null || n === undefined
        ? pill("#e9ecef", "#6c757d")
        : n > 10
            ? pill("#d4edda", "#155724")
            : n > 0
                ? pill("#fff3cd", "#856404")
                : pill("#f8d7da", "#721c24");

/* ─────────────────────────────────────────────────────────────────────────────
   Props:
     mode          "add" | "edit"
     requisitionId string  (edit mode only — the _id to load and update)
───────────────────────────────────────────────────────────────────────────── */
const InternalTransferForm = ({ mode = "add", requisitionId }) => {
    const isEdit = mode === "edit";

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const user = useSelector((state) => state.User);
    const { submitLoading } = useSelector((state) => state.Pharmacy);

    const [pageLoading, setPageLoading] = useState(isEdit);
    const [requisitionNumber, setRequisitionNumber] = useState("");
    const [requisingCenter, setRequisingCenter] = useState(null);
    const [fulfillingCenter, setFulfillingCenter] = useState(null);
    const [items, setItems] = useState([]);

    const medicineSearchRef = useRef(null);
    const searchTimerRef = useRef(null);

    /* ── Center options ─────────────────────────────────────────────────────── */
    const requisingCenterOptions = (user?.centerAccess || []).map((cid) => {
        const center = (user?.userCenters || []).find((c) => c._id === cid);
        return { value: cid, label: center?.title || "Unknown Center" };
    });
    const fulfillingCenterOptions = (user?.userCenters || []).map((c) => ({
        value: c._id,
        label: c.title || "Unknown Center",
    }));

    /* ── Load existing requisition (edit only) ──────────────────────────────── */
    useEffect(() => {
        if (!isEdit || !requisitionId) return;

        setPageLoading(true);
        dispatch(fetchInternalTransferById(requisitionId))
            .unwrap()
            .then((response) => {
                const req = response?.data || response;

                setRequisitionNumber(req.requisitionNumber || "");

                const reqCenter = req.requestingCenter;
                const fulCenter = req.fulfillingCenter;

                if (reqCenter) {
                    setRequisingCenter({ value: reqCenter._id, label: reqCenter.title || "Unknown Center" });
                }
                if (fulCenter) {
                    setFulfillingCenter({ value: fulCenter._id, label: fulCenter.title || "Unknown Center" });
                }

                setItems(
                    (req.items || []).map((item) => {
                        const pharm = item.pharmacyId || {};
                        return {
                            pharmacyId: pharm._id || item.pharmacyId,
                            customId: pharm.id || "—",
                            medicineName: str(pharm.medicineName) || str(item.medicineName),
                            type: str(pharm.medicineId?.type),
                            strength: str(pharm.Strength) || str(pharm.strength) || str(item.strength),
                            unit: str(pharm.unitType) || str(pharm.unit) || str(item.unit),
                            genericName: str(pharm.medicineId?.genericName),
                            brandName: str(pharm.medicineId?.brandName) || str(pharm.medicineId?.name),
                            availableStock: null, // not included in GET projection; re-search to see live stock
                            requestedQty: item.requestedQty || 1,
                            itemRemarks: item.itemRemarks || "",
                        };
                    })
                );
            })
            .catch((error) => {
                if (!handleAuthError(error)) {
                    toast.error(error?.message || "Failed to load requisition.");
                }
                navigate("/pharmacy/requisition/internal-transfer");
            })
            .finally(() => setPageLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requisitionId]);

    /* ── Medicine async search ──────────────────────────────────────────────── */
    const searchMedicines = async (inputValue) => {
        if (!inputValue || inputValue.length < 2) return [];
        if (!fulfillingCenter) {
            toast.warning("Please select a Fulfilling Center before searching.");
            return [];
        }
        try {
            const result = await dispatch(
                searchPharmacyInventory({ q: inputValue, centerId: fulfillingCenter.value })
            ).unwrap();
            const results = result?.data || result || [];
            return results.map((med) => ({
                value: med._id,
                label: med.medicineName,
                data: med,
            }));
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || "Failed to search medicines.");
            }
            return [];
        }
    };

    const debouncedSearch = useCallback(
        (inputValue, callback) => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
            searchTimerRef.current = setTimeout(() => {
                searchMedicines(inputValue).then(callback);
            }, 350);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [fulfillingCenter]
    );

    /* ── Cart helpers ───────────────────────────────────────────────────────── */
    const handleMedicineSelect = (option) => {
        if (!option) return;
        const med = option.data;
        if (items.some((i) => i.pharmacyId === med._id)) {
            toast.warning(`${med.medicineName} is already in the list.`);
            medicineSearchRef.current?.clearValue();
            return;
        }
        const centerEntry = (med.centers || []).find(
            (c) => (c.centerId?._id || c.centerId) === fulfillingCenter?.value
        );
        setItems((prev) => [
            ...prev,
            {
                pharmacyId: med._id,
                customId: med.id || "—",
                medicineName: str(med.medicineName),
                type: str(med.medicineId?.type),
                strength: str(med.Strength) || str(med.strength),
                unit: str(med.unitType) || str(med.unit),
                genericName: str(med.medicineId?.genericName),
                brandName: str(med.medicineId?.brandName) || str(med.medicineId?.name),
                availableStock: centerEntry?.stock ?? 0,
                requestedQty: 1,
                itemRemarks: "",
            },
        ]);
        medicineSearchRef.current?.clearValue();
    };

    const updateItem = (pharmacyId, field, value) =>
        setItems((prev) =>
            prev.map((item) =>
                item.pharmacyId === pharmacyId ? { ...item, [field]: value } : item
            )
        );

    const removeItem = (pharmacyId) =>
        setItems((prev) => prev.filter((i) => i.pharmacyId !== pharmacyId));

    const stepQty = (pharmacyId, delta, max) =>
        setItems((prev) =>
            prev.map((item) => {
                if (item.pharmacyId !== pharmacyId) return item;
                const next = Math.max(1, item.requestedQty + delta);
                return { ...item, requestedQty: max !== null ? Math.min(next, max) : next };
            })
        );

    /* ── Validation ─────────────────────────────────────────────────────────── */
    const isSameCenterSelected =
        requisingCenter && fulfillingCenter &&
        requisingCenter.value === fulfillingCenter.value;

    const centersSet = requisingCenter && fulfillingCenter && !isSameCenterSelected;

    const isSubmitDisabled =
        submitLoading || items.length === 0 ||
        !requisingCenter || !fulfillingCenter || isSameCenterSelected;

    /* ── Submit ─────────────────────────────────────────────────────────────── */
    const handleSubmit = async () => {
        if (isSubmitDisabled) return;
        const payload = {
            requisingCenter: requisingCenter.value,
            fulfillingCenter: fulfillingCenter.value,
            items: items.map((i) => ({
                pharmacyId: i.pharmacyId,
                requestedQty: Number(i.requestedQty),
                itemRemarks: i.itemRemarks || "",
            })),
        };

        try {
            if (isEdit) {
                await dispatch(editInternalTransferRequisition({ id: requisitionId, ...payload })).unwrap();
                toast.success("Requisition updated successfully!");
            } else {
                await dispatch(submitInternalTransferRequisition(payload)).unwrap();
                toast.success("Requisition submitted successfully!");
            }
            navigate("/pharmacy/requisition/internal-transfer");
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error?.message || `Failed to ${isEdit ? "update" : "submit"} requisition.`);
            }
        }
    };

    /* ── Medicine option label ──────────────────────────────────────────────── */
    const formatMedicineOption = (option) => {
        const med = option.data;
        const centerEntry = (med.centers || []).find(
            (c) => (c.centerId?._id || c.centerId) === fulfillingCenter?.value
        );
        const centerStock = centerEntry?.stock ?? 0;
        const primaryLabel = [
            med.medicineId?.type,
            med.medicineName,
            med.Strength || med.strength,
            med.unitType || med.unit,
        ].filter(Boolean).join(" ");
        const genericName = med.medicineId?.genericName || "";
        const brandName = med.medicineId?.brandName || "";
        return (
            <div className="d-flex align-items-center justify-content-between py-1 px-1 gap-3">
                <div>
                    <p className="mb-0 fw-semibold" style={{ fontSize: 13 }}>{primaryLabel}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                        <span className="fw-medium text-primary">ID: {med.id || "—"}</span>
                        {(genericName || brandName) && (
                            <>
                                <span className="mx-1">·</span>
                                {genericName && <span>{genericName}</span>}
                                {genericName && brandName && <span className="mx-1">·</span>}
                                {brandName && <span>{brandName}</span>}
                            </>
                        )}
                    </p>
                </div>
                <span style={{ ...stockPill(centerStock), whiteSpace: "nowrap", flexShrink: 0 }}>
                    {centerStock} available
                </span>
            </div>
        );
    };

    /* ─────────────────────────────────────────────────────────────────────────
       RENDER
    ───────────────────────────────────────────────────────────────────────── */
    if (pageLoading) {
        return (
            <CardBody
                className="p-3 bg-white d-flex align-items-center justify-content-center"
                style={isMobile ? { width: "100%", minHeight: 300 } : { width: "78%", minHeight: 300 }}
            >
                <div className="text-center">
                    <Spinner color="primary" />
                    <p className="text-muted mt-2 mb-0" style={{ fontSize: 13 }}>Loading requisition…</p>
                </div>
            </CardBody>
        );
    }

    return (
        <CardBody
            className="p-3 bg-white"
            style={isMobile ? { width: "100%" } : { width: "78%" }}
        >
            {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
            <button
                type="button"
                className="btn btn-link p-0 text-muted mb-1"
                style={{ fontSize: 13, textDecoration: "none" }}
                onClick={() => navigate("/pharmacy/requisition/internal-transfer")}
            >
                <i className="bx bx-chevron-left" /> Internal Transfer Requisitions
            </button>

            {/* ── Page heading + step pills ────────────────────────────────────── */}
            <div className="d-flex align-items-start justify-content-between mb-4">
                <div>
                    <h5 className="mb-1 fw-semibold">
                        {isEdit ? "Edit Transfer Requisition" : "New Transfer Requisition"}
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                        {isEdit ? (
                            <>
                                {requisitionNumber && (
                                    <span className="fw-medium text-primary me-2">{requisitionNumber}</span>
                                )}
                                Only PENDING requisitions can be edited
                            </>
                        ) : (
                            "Request stock transfer from one center to another"
                        )}
                    </p>
                </div>

                {/* Step indicator — desktop only */}
                <div className="d-none d-md-flex align-items-center gap-2">
                    {[
                        { n: 1, label: "Centers", done: !!centersSet },
                        { n: 2, label: "Medicines", done: items.length > 0 },
                        { n: 3, label: isEdit ? "Update" : "Submit", done: false },
                    ].map((s, i, arr) => (
                        <React.Fragment key={s.n}>
                            <div className="d-flex align-items-center gap-1">
                                <div style={stepCircle(s.done)}>
                                    {s.done
                                        ? <i className="bx bx-check" style={{ fontSize: 14 }} />
                                        : s.n}
                                </div>
                                <span
                                    style={{ fontSize: 12, fontWeight: 600 }}
                                    className={s.done ? "text-primary" : "text-muted"}
                                >
                                    {s.label}
                                </span>
                            </div>
                            {i < arr.length - 1 && (
                                <div style={{
                                    width: 24, height: 2, borderRadius: 2,
                                    background: s.done ? "var(--bs-primary)" : "#dee2e6",
                                }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ── Step 1: Centers ─────────────────────────────────────────────── */}
            <Card className="mb-4" style={CARD_STYLE}>
                <CardHeader className="py-3 px-4" style={HEADER_STYLE}>
                    <div className="d-flex align-items-center gap-2">
                        <div style={stepCircle(!!centersSet)}>
                            {centersSet ? <i className="bx bx-check" style={{ fontSize: 14 }} /> : 1}
                        </div>
                        <div>
                            <p className="mb-0 fw-semibold" style={{ fontSize: 14 }}>Center Details</p>
                            <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                                Select the requesting and fulfilling centers
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="px-4 py-4">
                    <Row className="g-3 align-items-start">
                        {/* Requesting center */}
                        <Col md={5}>
                            <FormGroup className="mb-0">
                                <Label className="fw-medium mb-1" style={{ fontSize: 13 }}>
                                    Requesting Center <span className="text-danger">*</span>
                                </Label>
                                <Select
                                    classNamePrefix="react-select"
                                    options={requisingCenterOptions}
                                    value={requisingCenter}
                                    onChange={setRequisingCenter}
                                    placeholder="Center that needs stock…"
                                    isClearable
                                />
                                <small className="text-muted d-block mt-1" style={{ fontSize: 11 }}>
                                    <i className="bx bx-down-arrow-circle me-1" />
                                    This center will receive the stock
                                </small>
                            </FormGroup>
                        </Col>

                        {/* Transfer arrow */}
                        <Col md={2} className="d-flex flex-column align-items-center justify-content-center pt-3">
                            <div style={{
                                width: 44, height: 44, borderRadius: "50%",
                                background: centersSet ? "var(--bs-primary)" : "#f1f3f5",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: centersSet ? "0 4px 12px rgba(var(--bs-primary-rgb),.25)" : "none",
                                transition: "all .3s ease",
                            }}>
                                <i className="bx bx-left-arrow-alt"
                                    style={{ fontSize: 22, color: centersSet ? "#fff" : "#ced4da" }} />
                            </div>
                            <span style={{ fontSize: 10, color: "#adb5bd", marginTop: 4, fontWeight: 600, letterSpacing: 1 }}>
                                TRANSFER
                            </span>
                        </Col>

                        {/* Fulfilling center */}
                        <Col md={5}>
                            <FormGroup className="mb-0">
                                <Label className="fw-medium mb-1" style={{ fontSize: 13 }}>
                                    Fulfilling Center <span className="text-danger">*</span>
                                </Label>
                                <Select
                                    classNamePrefix="react-select"
                                    options={fulfillingCenterOptions}
                                    value={fulfillingCenter}
                                    onChange={(opt) => {
                                        setFulfillingCenter(opt);
                                        if (items.length > 0) {
                                            setItems([]);
                                            toast.info("Cart cleared — fulfilling center changed.");
                                        }
                                    }}
                                    placeholder="Center that supplies stock…"
                                    isClearable
                                />
                                <small className="text-muted d-block mt-1" style={{ fontSize: 11 }}>
                                    <i className="bx bx-package me-1" />
                                    This center will dispatch the stock
                                </small>
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* Same-center warning */}
                    {isSameCenterSelected && (
                        <div className="d-flex align-items-center gap-2 mt-3 p-3"
                            style={{ background: "#fff8e6", borderRadius: 8, border: "1px solid #ffe08a" }}>
                            <i className="bx bx-error-circle text-warning fs-5" />
                            <span style={{ fontSize: 13, color: "#856404" }}>
                                Requesting and Fulfilling center cannot be the same.
                            </span>
                        </div>
                    )}

                    {/* Direction summary strip */}
                    {centersSet && (
                        <div className="d-flex align-items-center gap-3 mt-3 p-3"
                            style={{ background: "var(--bs-primary-bg-subtle,#cfe2ff)", borderRadius: 8, border: "1px solid var(--bs-primary-border-subtle,#9ec5fe)" }}>
                            <i className="bx bx-check-circle text-primary fs-5" />
                            <span style={{ fontSize: 13 }}>
                                <strong>{fulfillingCenter.label}</strong>
                                <span className="text-muted mx-2">→</span>
                                <strong>{requisingCenter.label}</strong>
                            </span>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* ── Step 2: Medicine search ──────────────────────────────────────── */}
            <Card className="mb-4" style={CARD_STYLE}>
                <CardHeader className="py-3 px-4" style={HEADER_STYLE}>
                    <div className="d-flex align-items-center gap-2">
                        <div style={stepCircle(items.length > 0)}>
                            {items.length > 0 ? <i className="bx bx-check" style={{ fontSize: 14 }} /> : 2}
                        </div>
                        <div>
                            <p className="mb-0 fw-semibold" style={{ fontSize: 14 }}>Add Medicines</p>
                            <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                                Search the fulfilling center&apos;s inventory and add items
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="px-4 py-4">
                    <div style={{
                        background: "var(--bs-light,#f8f9fa)", borderRadius: 10,
                        border: "1px dashed var(--bs-border-color,#dee2e6)", padding: "16px 20px",
                    }}>
                        <Label className="fw-semibold mb-2 d-block" style={{ fontSize: 13 }}>
                            <i className="bx bx-search-alt me-1 text-primary" />
                            Search Medicine
                        </Label>
                        <AsyncSelect
                            ref={medicineSearchRef}
                            key={fulfillingCenter?.value || "no-center"}
                            classNamePrefix="react-select"
                            cacheOptions={false}
                            defaultOptions={false}
                            loadOptions={debouncedSearch}
                            formatOptionLabel={formatMedicineOption}
                            onChange={handleMedicineSelect}
                            placeholder={
                                centersSet
                                    ? "Search by medicine name…"
                                    : "Complete Step 1 first to search inventory"
                            }
                            isDisabled={!centersSet}
                            noOptionsMessage={({ inputValue }) =>
                                inputValue.length < 2
                                    ? "Type at least 2 characters…"
                                    : "No medicines found"
                            }
                            loadingMessage={() => "Searching inventory…"}
                            styles={{
                                control: (base) => ({
                                    ...base, borderRadius: 8,
                                    borderColor: "var(--bs-border-color,#dee2e6)", boxShadow: "none",
                                    "&:hover": { borderColor: "var(--bs-primary)" },
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    background: state.isFocused ? "var(--bs-primary-bg-subtle,#cfe2ff)" : "#fff",
                                    color: "#212529",
                                }),
                            }}
                        />
                        {!centersSet && (
                            <p className="text-muted mb-0 mt-2" style={{ fontSize: 12 }}>
                                <i className="bx bx-info-circle me-1" />
                                Select both centers above to enable medicine search.
                            </p>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* ── Step 3: Transfer cart ────────────────────────────────────────── */}
            <Card className="mb-4" style={CARD_STYLE}>
                <CardHeader
                    className="py-3 px-4 d-flex align-items-center justify-content-between"
                    style={HEADER_STYLE}
                >
                    <div className="d-flex align-items-center gap-2">
                        <div style={stepCircle(items.length > 0)}>3</div>
                        <div>
                            <p className="mb-0 fw-semibold" style={{ fontSize: 14 }}>Transfer Cart</p>
                            <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                                Review quantities before {isEdit ? "updating" : "submitting"}
                            </p>
                        </div>
                    </div>
                    {items.length > 0 && (
                        <span className="badge bg-primary text-white"
                            style={{ borderRadius: 20, padding: "4px 14px", fontSize: 12 }}>
                            {items.length} item{items.length > 1 ? "s" : ""}
                        </span>
                    )}
                </CardHeader>
                <CardBody className="p-0">
                    {items.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{
                                width: 64, height: 64, borderRadius: "50%",
                                background: "#f1f3f5",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 12px",
                            }}>
                                <i className="bx bx-cart-alt" style={{ fontSize: 28, color: "#ced4da" }} />
                            </div>
                            <p className="mb-1 fw-medium" style={{ fontSize: 14, color: "#6c757d" }}>
                                Cart is empty
                            </p>
                            <p className="mb-0" style={{ fontSize: 12, color: "#adb5bd" }}>
                                Search and select medicines above to add them here
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead style={TABLE_HEAD_STYLE}>
                                    <tr>
                                        {["#", "Medicine", "Available", "Requested Qty", "Remarks", "Remove"].map((h) => (
                                            <th key={h} className="py-3 px-3 fw-semibold"
                                                style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => {
                                        const hasStock = item.availableStock !== null && item.availableStock !== undefined;
                                        const atMax = hasStock && item.requestedQty >= item.availableStock;
                                        const atMin = item.requestedQty <= 1;
                                        const qtyBtnStyle = (disabled) => ({
                                            width: 30, height: 30, padding: 0, borderRadius: 6,
                                            background: disabled ? "#f1f3f5" : "var(--bs-primary-bg-subtle,#cfe2ff)",
                                            border: "1px solid " + (disabled ? "#dee2e6" : "var(--bs-primary-border-subtle,#9ec5fe)"),
                                            color: disabled ? "#ced4da" : "var(--bs-primary)",
                                            fontWeight: 700, fontSize: 16, lineHeight: 1,
                                            cursor: disabled ? "not-allowed" : "pointer",
                                        });
                                        return (
                                            <tr key={item.pharmacyId} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                                <td className="py-3 px-3" style={{ color: "#adb5bd", fontSize: 13 }}>
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3 px-3" style={{ minWidth: 220 }}>
                                                    <p className="mb-0 fw-semibold" style={{ fontSize: 13 }}>
                                                        {[item.type, item.medicineName, item.strength, item.unit]
                                                            .filter(Boolean).join(" ")}
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
                                                <td className="py-3 px-3 text-center">
                                                    {hasStock ? (
                                                        <span style={stockPill(item.availableStock)}>
                                                            {item.availableStock}
                                                        </span>
                                                    ) : (
                                                        <span
                                                            style={pill("#e9ecef", "#6c757d")}
                                                            title="Re-search this medicine to see current stock"
                                                        >
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                        <button type="button"
                                                            disabled={atMin}
                                                            onClick={() => stepQty(item.pharmacyId, -1, item.availableStock)}
                                                            style={qtyBtnStyle(atMin)}>
                                                            −
                                                        </button>
                                                        <Input
                                                            type="number"
                                                            bsSize="sm"
                                                            min={1}
                                                            max={hasStock ? item.availableStock : undefined}
                                                            value={item.requestedQty}
                                                            onChange={(e) => {
                                                                let val = parseInt(e.target.value, 10);
                                                                if (isNaN(val) || val < 1) val = 1;
                                                                if (hasStock && val > item.availableStock) val = item.availableStock;
                                                                updateItem(item.pharmacyId, "requestedQty", val);
                                                            }}
                                                            style={{
                                                                width: 56, textAlign: "center",
                                                                borderRadius: 6,
                                                                border: "1px solid var(--bs-border-color,#dee2e6)",
                                                                fontWeight: 700, fontSize: 13,
                                                                padding: "4px 2px",
                                                            }}
                                                        />
                                                        <button type="button"
                                                            disabled={atMax}
                                                            onClick={() => stepQty(item.pharmacyId, 1, item.availableStock)}
                                                            style={qtyBtnStyle(atMax)}>
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <Input
                                                        type="text"
                                                        bsSize="sm"
                                                        placeholder="Optional…"
                                                        value={item.itemRemarks}
                                                        onChange={(e) =>
                                                            updateItem(item.pharmacyId, "itemRemarks", e.target.value)
                                                        }
                                                        style={{ borderRadius: 6, borderColor: "#dee2e6", fontSize: 13 }}
                                                    />
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.pharmacyId)}
                                                        style={{
                                                            width: 30, height: 30, padding: 0,
                                                            borderRadius: 6,
                                                            background: "#fff5f5",
                                                            border: "1px solid #ffc9c9",
                                                            color: "#e03131",
                                                            cursor: "pointer",
                                                        }}
                                                        title="Remove"
                                                    >
                                                        <i className="bx bx-trash" style={{ fontSize: 14 }} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* ── Footer bar ──────────────────────────────────────────────────── */}
            <div
                className="d-flex align-items-center justify-content-between"
                style={{
                    background: "#fff", border: "1px solid #eef0f7",
                    borderRadius: 12, padding: "14px 20px",
                    boxShadow: "0 -2px 16px rgba(0,0,0,.06)",
                }}
            >
                <div style={{ fontSize: 13, color: "#6c757d" }}>
                    {items.length > 0 ? (
                        <>
                            <strong className="text-primary">{items.length}</strong>
                            {" item"}{items.length > 1 ? "s" : ""} in cart
                            {centersSet && (
                                <span className="ms-2 text-muted">
                                    · {fulfillingCenter.label} → {requisingCenter.label}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-muted">No items added yet</span>
                    )}
                </div>

                <div className="d-flex gap-2">
                    <Button
                        color="secondary" outline size="sm"
                        onClick={() => navigate("/pharmacy/requisition/internal-transfer")}
                        disabled={submitLoading}
                    >
                        <i className="bx bx-x me-1" /> Cancel
                    </Button>
                    <Button
                        color="primary" size="sm"
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        className="text-white"
                    >
                        {submitLoading ? (
                            <><Spinner size="sm" className="me-2" />{isEdit ? "Updating…" : "Submitting…"}</>
                        ) : (
                            <><i className={`bx ${isEdit ? "bx-save" : "bx-send"} me-1`} />{isEdit ? "Update Requisition" : "Submit Requisition"}</>
                        )}
                    </Button>
                </div>
            </div>
        </CardBody>
    );
};

export default InternalTransferForm;
