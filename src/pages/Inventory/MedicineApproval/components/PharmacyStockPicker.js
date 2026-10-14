import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import AsyncSelect from "react-select/async";
import { ListGroup, ListGroupItem, Spinner } from "reactstrap";
import { Check, Package, Search } from "lucide-react";
import { searchPharmacyInventory } from "../../../../store/features/pharmacy/pharmacySlice";


const formatExpiry = (raw) => {
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const centerStockOf = (doc, centerId) =>
    (doc.centers || []).find((c) => String(c.centerId?._id || c.centerId) === String(centerId))?.stock ?? 0;

const medicineKeyString = (doc) =>
    [doc.medicineName || doc.medicineId?.name, doc.Strength, doc.unitType].filter(Boolean).join(" ");

const isGenericNameMatch = (doc, input) => {
    const needle = input.trim().toLowerCase();
    if (!needle) return false;
    const genericName = doc.medicineId?.genericName || "";
    if (!genericName.toLowerCase().includes(needle)) return false;

    const nameFields = [
        doc.medicineName,
        doc.medicineId?.name,
        doc.medicineId?.brandName,
        doc.company,
        doc.code,
        doc.id,
    ];
    return !nameFields.some((f) => (f || "").toLowerCase().includes(needle));
};

const formatBatchLabel = (doc) => {
    const expiry = formatExpiry(doc.Expiry);
    return [
        doc.id || null,
        medicineKeyString(doc) || null,
        doc.Batch ? `Batch ${doc.Batch}` : "Batch",
        doc.company,
        expiry ? `exp ${expiry}` : null,
    ]
        .filter(Boolean)
        .join(" · ");
};

const LOW_STOCK_AT = 5;
const SEARCH_DEBOUNCE_MS = 350;
const MIN_SEARCH_LENGTH = 2;

const selectStyles = {
    control: (base) => ({ ...base, minHeight: 38 }),
    valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
    input: (base) => ({ ...base, fontSize: 16, margin: 0 }),
    singleValue: (base) => ({ ...base, fontSize: "0.85rem" }),
    menu: (base) => ({ ...base, fontSize: "0.85rem" }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    placeholder: (base) => ({ ...base, fontSize: "0.85rem" }),
};

const PharmacyStockPicker = ({ centerId, medicineId, selectedPharmacyId, excludeIds, onSelect, onCancel }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(!!medicineId);
    const [scopedDocs, setScopedDocs] = useState(null); // null = not loaded yet
    const debounceTimer = useRef(null);
    const excludeSet = new Set((excludeIds || []).map(String));

    useEffect(() => {
        if (!medicineId) {
            setScopedDocs([]);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        dispatch(
            searchPharmacyInventory({
                medicineId,
                centerId,
                excludeExpired: "true",
                minStock: 1,
                deduplicate: "false",
            })
        )
            .unwrap()
            .then((res) => !cancelled && setScopedDocs(res?.data || []))
            .catch(() => !cancelled && setScopedDocs([]))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medicineId, centerId, dispatch]);

    useEffect(() => () => clearTimeout(debounceTimer.current), []);

    const loadSearchOptions = (input) => {
        clearTimeout(debounceTimer.current);
        if (!input || input.trim().length < MIN_SEARCH_LENGTH) {
            return Promise.resolve([]);
        }
        return new Promise((resolve) => {
            debounceTimer.current = setTimeout(async () => {
                try {
                    const res = await dispatch(
                        searchPharmacyInventory({
                            q: input,
                            centerId,
                            excludeExpired: "true",
                            minStock: 1,
                            deduplicate: "false",
                        })
                    ).unwrap();
                    resolve(
                        (res?.data || [])
                            .filter((doc) => !excludeSet.has(String(doc._id)))
                            .map((doc) => ({
                                value: doc._id,
                                label: `${formatBatchLabel(doc)} (${centerStockOf(doc, centerId)} left)`,
                                genericMatch: isGenericNameMatch(doc, input),
                                genericName: doc.medicineId?.genericName,
                                doc,
                            }))
                    );
                } catch {
                    resolve([]);
                }
            }, SEARCH_DEBOUNCE_MS);
        });
    };

    const list = (scopedDocs || []).filter((doc) => !excludeSet.has(String(doc._id)));

    return (
        <div className="rounded border bg-white" style={{ borderColor: "#dbe3ea" }}>
            <div
                className="d-flex justify-content-between align-items-center px-2 border-bottom"
                style={{ background: "#f6f9fc", borderColor: "#dbe3ea", minHeight: 34 }}
            >
                <span
                    className="d-flex align-items-center gap-1 fw-semibold text-secondary"
                    style={{ fontSize: "0.72rem", letterSpacing: "0.02em" }}
                >
                    <Package size={12} />
                    SELECT FROM INVENTORY
                </span>
                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-link btn-sm text-muted text-decoration-none"
                        style={{ fontSize: "0.78rem", padding: "6px 4px" }}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>

            <div className="p-2">
                {loading ? (
                    <div className="d-flex align-items-center gap-2 py-2 ps-1">
                        <Spinner size="sm" color="secondary" />
                        <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                            Checking stock…
                        </span>
                    </div>
                ) : list.length > 0 ? (
                    <ListGroup flush>
                        {list.map((doc) => {
                            const active = String(selectedPharmacyId) === String(doc._id);
                            const stock = centerStockOf(doc, centerId);
                            const low = stock <= LOW_STOCK_AT;
                            const expiry = formatExpiry(doc.Expiry);

                            return (
                                <ListGroupItem
                                    key={doc._id}
                                    action
                                    tag="button"
                                    type="button"
                                    active={active}
                                    onClick={() => onSelect(doc)}
                                    className="d-flex flex-wrap justify-content-between align-items-center gap-2 px-2 rounded mb-1 border"
                                    style={{
                                        borderColor: active ? undefined : "#e6ebf0",
                                        minHeight: 40,
                                        paddingTop: 6,
                                        paddingBottom: 6,
                                    }}
                                >
                                    <span className="d-flex align-items-center gap-2 text-start">
                                        <span
                                            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                            style={{
                                                width: 18,
                                                height: 18,
                                                border: `1.5px solid ${active ? "#fff" : "#c9d3dd"}`,
                                                background: active ? "#fff" : "transparent",
                                            }}
                                        >
                                            {active && <Check size={12} color="#0d6efd" strokeWidth={3} />}
                                        </span>
                                        <span>
                                            <span
                                                className="d-block fw-semibold"
                                                style={{ fontSize: "0.82rem", lineHeight: 1.25 }}
                                            >
                                                {doc.medicineName || medicineKeyString(doc) || "Medicine"}
                                            </span>
                                            <span
                                                className={active ? "d-block" : "d-block text-muted"}
                                                style={{ fontSize: "0.72rem" }}
                                            >
                                                {doc.id && <>{doc.id} · </>}
                                                Batch {doc.Batch || "-"}
                                                {doc.company ? ` · ${doc.company}` : ""}
                                                {expiry ? ` · exp ${expiry}` : ""}
                                            </span>
                                        </span>
                                    </span>

                                    <span
                                        className={`badge rounded-pill flex-shrink-0 ${active
                                            ? "bg-white text-primary"
                                            : low
                                                ? "bg-warning-subtle text-warning-emphasis"
                                                : "bg-light text-secondary"
                                            }`}
                                        style={{ fontSize: "0.7rem", fontWeight: 600, padding: "4px 8px" }}
                                    >
                                        {stock} left
                                    </span>
                                </ListGroupItem>
                            );
                        })}
                    </ListGroup>
                ) : (
                    <div className="rounded px-2 py-2 mb-1" style={{ background: "#fff8e6" }}>
                        <span className="text-warning-emphasis" style={{ fontSize: "0.78rem" }}>
                            Nothing in inventory for this medicine at this center. Search below.
                        </span>
                    </div>
                )}

                <div className="pt-1">
                    <div
                        className="d-flex align-items-center gap-1 text-muted mb-1"
                        style={{ fontSize: "0.72rem" }}
                    >
                        <Search size={11} />
                        {list.length > 0 ? "Not listed? Search inventory" : "Search inventory"}
                    </div>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions={false}
                        loadOptions={loadSearchOptions}
                        onChange={(opt) => opt && onSelect(opt.doc)}
                        placeholder="Type a medicine name or generic name…"
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        noOptionsMessage={({ inputValue }) =>
                            inputValue.trim().length >= MIN_SEARCH_LENGTH
                                ? "No match in stock"
                                : "Type to search"
                        }
                        formatOptionLabel={(opt) => (
                            <span className="d-flex flex-column gap-1">
                                <span>{opt.label}</span>
                                {opt.genericMatch && (
                                    <span
                                        className="badge rounded-pill bg-info-subtle text-info-emphasis align-self-start"
                                        style={{ fontSize: "0.65rem", fontWeight: 600 }}
                                    >
                                        Matched by generic name{opt.genericName ? `: ${opt.genericName}` : ""}
                                    </span>
                                )}
                            </span>
                        )}
                        styles={selectStyles}
                    />
                </div>
            </div>
        </div>
    );
};

PharmacyStockPicker.propTypes = {
    centerId: PropTypes.string.isRequired,
    medicineId: PropTypes.string,
    selectedPharmacyId: PropTypes.string,
    excludeIds: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
};

export default PharmacyStockPicker;
