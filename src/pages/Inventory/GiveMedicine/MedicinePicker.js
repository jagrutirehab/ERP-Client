import PropTypes from "prop-types";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import AsyncSelect from "react-select/async";
import { searchPharmacyInventory } from "../../../store/features/pharmacy/pharmacySlice";

const NOT_AVAILABLE = "N/A";

export const formatExpiry = (raw) => {
  if (!raw) return NOT_AVAILABLE;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const medicineKeyString = (med) => {
  const name = med.medicineName || med.medicineId?.name || NOT_AVAILABLE;
  const strength = med.Strength || NOT_AVAILABLE;
  const unit = med.medicineId?.baseUnit || med.unitType || NOT_AVAILABLE;
  return [name, strength, unit].join(" ").toUpperCase();
};

export const isGenericNameMatch = (med, input) => {
  const needle = (input || "").trim().toLowerCase();
  if (!needle) return false;
  const genericName = med.medicineId?.genericName || "";
  if (!genericName.toLowerCase().includes(needle)) return false;

  const nameFields = [
    med.medicineName,
    med.medicineId?.name,
    med.medicineId?.brandName,
    med.company,
    med.code,
    med.id,
  ];
  return !nameFields.some((f) => (f || "").toLowerCase().includes(needle));
};

const formatBatchLabel = (med) => {
  return [
    med.id || NOT_AVAILABLE,
    medicineKeyString(med),
    `Batch: ${med.Batch || NOT_AVAILABLE}`,
    `Company: ${med.company || NOT_AVAILABLE}`,
    `Exp: ${formatExpiry(med.Expiry)}`,
  ].join(" · ");
};

const centerStockOf = (med, centerId) =>
  (med.centers || []).find((c) => String(c.centerId?._id || c.centerId) === String(centerId))?.stock ?? 0;

const SEARCH_DEBOUNCE_MS = 350;
const MIN_SEARCH_LENGTH = 1;

const selectStyles = {
  control: (base) => ({ ...base, minHeight: 38 }),
  valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
  input: (base) => ({ ...base, fontSize: 16, margin: 0 }),
  singleValue: (base) => ({ ...base, fontSize: "0.85rem" }),
  menu: (base) => ({ ...base, fontSize: "0.85rem" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  placeholder: (base) => ({ ...base, fontSize: "0.85rem" }),
};

const MedicinePicker = ({ centerId, excludeIds, onSelect, isDisabled }) => {
  const dispatch = useDispatch();
  const debounceTimer = useRef(null);
  const excludeSet = new Set((excludeIds || []).map(String));

  const loadOptions = (input) => {
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
              centerId: centerId || undefined,
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

  return (
    <AsyncSelect
      cacheOptions
      isDisabled={isDisabled}
      placeholder={isDisabled ? "Select a center first" : "Search medicines..."}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? "No medicines found" : "Type to search"
      }
      loadOptions={loadOptions}
      value={null}
      onChange={(opt) => opt && onSelect(opt.doc)}
      styles={selectStyles}
      menuPortalTarget={document.body}
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
    />
  );
};

MedicinePicker.propTypes = {
  centerId: PropTypes.string,
  excludeIds: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

export default MedicinePicker;
