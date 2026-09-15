import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import AsyncSelect from "react-select/async";
import { ListGroup, ListGroupItem, Spinner } from "reactstrap";
import { Check, Package, Search } from "lucide-react";
import {
  getSuggestedPharmacyBatches,
  searchPharmacyBatches,
} from "../../../../store/features/nurse/nurseSlice";

// Expiry arrives as a plain string ("2026-12-05"); show it the way it reads on
// the physical strip, but never lose the original if it isn't a parseable date.
const formatExpiry = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Same "name + strength + unit" key string used everywhere else in the nurse
// pages (e.g. the medicine box entries) — not just the bare drug name, which
// on its own can't tell two strengths of the same drug apart.
const medicineKeyString = (batch) =>
  [batch.medicineName, batch.Strength, batch.unitType].filter(Boolean).join(" ");

// Includes the medicine identity when the batch carries one — always true
// for search results (which can span several drugs/strengths at once, so
// this is the only thing telling them apart), and harmless extra
// confirmation for a suggested-list pick too.
export const formatBatchLabel = (batch) => {
  const expiry = formatExpiry(batch.Expiry);
  return [
    medicineKeyString(batch) || null,
    batch.Batch ? `Batch ${batch.Batch}` : "Batch",
    batch.company,
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
  menu: (base) => ({ ...base, zIndex: 5, fontSize: "0.85rem" }),
  placeholder: (base) => ({ ...base, fontSize: "0.85rem" }),
};

const PharmacyBatchPicker = ({
  patientId,
  medicine,
  selectedPharmacyId,
  onSelect,
  onCancel,
}) => {
  const dispatch = useDispatch();
  const medicineId = medicine?.medicineId;
  const debounceTimer = useRef(null);

  const batches = useSelector(
    (state) => state.Nurse.medicines.pharmacyBatchOptions[medicineId]
  );
  const loading = useSelector((state) => state.Nurse.pharmacyBatchLoading);

  useEffect(() => {
    // Skip the refetch if this medicine's batches are already cached from a
    // previous open in this session — stock at a center doesn't change fast
    // enough within one nurse's marking pass to justify hitting the server
    // again every time the picker is reopened for the same drug.
    if (patientId && medicineId && !batches) {
      dispatch(getSuggestedPharmacyBatches({ patientId, medicineId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, patientId, medicineId]);

  // Cancel any pending search if the picker closes/unmounts mid-type, so a
  // stale query can't still fire after the user has moved on.
  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const loadOptions = (input) => {
    clearTimeout(debounceTimer.current);

    if (!input || input.trim().length < MIN_SEARCH_LENGTH) {
      return Promise.resolve([]);
    }

    return new Promise((resolve) => {
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await dispatch(
            searchPharmacyBatches({ q: input, patientId })
          ).unwrap();
          resolve(
            (results || []).map((b) => ({
              value: b._id,
              label: `${formatBatchLabel(b)} (${b.stock ?? 0} left)`.trim(),
              raw: b,
            }))
          );
        } catch {
          resolve([]);
        }
      }, SEARCH_DEBOUNCE_MS);
    });
  };

  const list = batches || [];
  const isLoading = loading && !batches;

  return (
    <div
      className="mt-2 rounded border bg-white"
      onClick={(e) => e.stopPropagation()}
      style={{ borderColor: "#dbe3ea" }}
    >
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
        {isLoading ? (
          <div className="d-flex align-items-center gap-2 py-2 ps-1">
            <Spinner size="sm" color="secondary" />
            <span className="text-muted" style={{ fontSize: "0.82rem" }}>
              Checking stock…
            </span>
          </div>
        ) : list.length > 0 ? (
          <ListGroup flush>
            {list.map((batch) => {
              const active = String(selectedPharmacyId) === String(batch._id);
              const stock = batch.stock ?? 0;
              const low = stock <= LOW_STOCK_AT;
              const expiry = formatExpiry(batch.Expiry);

              return (
                <ListGroupItem
                  key={batch._id}
                  action
                  tag="button"
                  type="button"
                  active={active}
                  onClick={() => onSelect(batch._id, batch)}
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
                        {batch.Batch || "Batch"}
                      </span>
                      <span
                        className={active ? "d-block" : "d-block text-muted"}
                        style={{ fontSize: "0.72rem" }}
                      >
                        {batch.company || "Unknown"}
                        {expiry ? ` · exp ${expiry}` : ""}
                      </span>
                    </span>
                  </span>

                  <span
                    className={`badge rounded-pill flex-shrink-0 ${
                      active
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
          <div
            className="rounded px-2 py-2 mb-1"
            style={{ background: "#fff8e6" }}
          >
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
            loadOptions={loadOptions}
            onChange={(opt) => opt && onSelect(opt.value, opt.raw)}
            placeholder="Type a medicine name…"
            menuPlacement="auto"
            formatOptionLabel={(opt) => {
              const matchedVia = opt.raw?.matchedVia;
              if (!matchedVia) return opt.label;
              return (
                <span>
                  {opt.label}
                  <span
                    className="d-block fw-semibold"
                    style={{ color: "#d4a017", fontSize: "0.72rem" }}
                  >
                    matched via {matchedVia}
                  </span>
                </span>
              );
            }}
            noOptionsMessage={({ inputValue }) =>
              inputValue.trim().length >= MIN_SEARCH_LENGTH
                ? "No match in stock"
                : "Type to search"
            }
            styles={selectStyles}
          />
        </div>
      </div>
    </div>
  );
};

export default PharmacyBatchPicker;
