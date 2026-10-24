import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { getAlternativeMedicines } from "../../../helpers/backend_helper";

const SEARCH_DEBOUNCE_MS = 350;
const MIN_SEARCH_LENGTH = 2;

// "TYPE NAME STRENGTH UNIT" — same order as the prescription print-out, used
// for both the search results and the in-stock suggestions.
const medicineLabel = (med) =>
  [med?.type, med?.name, [med?.strength, med?.unit].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(" ");

const selectStyles = {
  control: (base) => ({ ...base, minHeight: 30, fontSize: "0.8rem" }),
  valueContainer: (base) => ({ ...base, padding: "0 8px" }),
  dropdownIndicator: (base) => ({ ...base, padding: 4 }),
  menu: (base) => ({ ...base, fontSize: "0.82rem" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const PrescriptionPharmacyStock = ({ medicine, centerId, available, onReplace }) => {
  const medicineId = medicine.medicine?._id;
  const checking = !!medicineId && available === undefined;

  const [alternatives, setAlternatives] = useState(null); // null = not loaded
  const debounceTimer = useRef(null);

  useEffect(() => {
    setAlternatives(null);
    if (available !== false || !medicineId || !centerId) return;
    let cancelled = false;
    getAlternativeMedicines(medicineId, centerId)
      .then((res) => {
        if (!cancelled) setAlternatives(res?.data || []);
      })
      .catch(() => {
        if (!cancelled) setAlternatives([]);
      });
    return () => {
      cancelled = true;
    };
  }, [available, medicineId, centerId]);

  const pickAlternative = (med) => {
    onReplace({
      _id: med._id,
      name: med.name,
      type: med.type,
      strength: med.strength,
      unit: med.unit,
    });
  };

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const loadMedicineOptions = (input) => {
    clearTimeout(debounceTimer.current);
    if (!input || input.trim().length < MIN_SEARCH_LENGTH) {
      return Promise.resolve([]);
    }
    return new Promise((resolve) => {
      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await axios.get("/medicine/", {
            params: { search: input.trim(), page: 1, limit: 15, includeGeneric: "true", centerId },
          });
          const needle = input.trim().toLowerCase();
          resolve(
            (res?.payload || []).map((med) => ({
              value: med._id,
              label: medicineLabel(med),
              genericName: med.genericName,
              genericMatch:
                (med.genericName || "").toLowerCase().includes(needle) &&
                !(med.name || "").toLowerCase().includes(needle) &&
                !(med.id || "").toLowerCase().includes(needle),
              med,
            }))
          );
        } catch {
          resolve([]);
        }
      }, SEARCH_DEBOUNCE_MS);
    });
  };

  return (
    <div className="ps-2 w-100 medicine-stock-panel" style={{ borderLeft: "3px solid #0d6efd" }}>
      <div className="d-flex align-items-center flex-wrap gap-2">
        {!medicineId && (
          <span
            className="badge bg-warning-subtle text-warning-emphasis text-wrap text-start d-inline-flex align-items-center gap-1"
            style={{ fontSize: "0.72rem", fontWeight: 500 }}
          >
            <XCircle size={12} />
            New medicine, not in inventory
          </span>
        )}

        {medicineId && checking && (
          <span className="text-muted" style={{ fontSize: "0.78rem" }}>
            Checking stock…
          </span>
        )}

        {medicineId && !checking && available === true && (
          <span
            className="badge bg-success-subtle text-success-emphasis text-wrap text-start d-inline-flex align-items-center gap-1"
            style={{ fontSize: "0.72rem", fontWeight: 500 }}
          >
            <CheckCircle2 size={12} />
            Present in inventory
          </span>
        )}

        {medicineId && !checking && available === false && (
          <span
            className="badge bg-danger-subtle text-danger-emphasis text-wrap text-start d-inline-flex align-items-center gap-1"
            style={{ fontSize: "0.72rem", fontWeight: 500 }}
          >
            <XCircle size={12} />
            Not present in inventory
          </span>
        )}

        {/* Same swap search for a brand-new (custom) medicine as for one that
            is out of stock — only the badge above differs. */}
        {(!medicineId || (!checking && available === false)) && (
          <>
            <div className="medicine-stock-search">
            <AsyncSelect
              key={centerId}
              cacheOptions
              defaultOptions={false}
              value={null}
              loadOptions={loadMedicineOptions}
              onChange={(opt) => opt && onReplace(opt.med)}
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
              placeholder="Search another medicine by name or generic name…"
              menuPlacement="auto"
              menuPortalTarget={document.body}
              noOptionsMessage={({ inputValue }) =>
                inputValue.trim().length >= MIN_SEARCH_LENGTH
                  ? "No medicine in stock at this center"
                  : "Type to search"
              }
              styles={{
                ...selectStyles,
                // 16px keeps phones and tablets from zooming the page when the
                // box is focused.
                input: (base) => ({
                  ...base,
                  margin: 0,
                  fontSize: window.innerWidth < 1100 ? 16 : "0.8rem",
                }),
              }}
            />
            </div>
          </>
        )}
      </div>

      {medicineId && !checking && available === false && alternatives && alternatives.length > 0 && (
        <div
          className="mt-2 rounded p-2"
          style={{ backgroundColor: "#f3faf5", border: "1px solid #d3e9da" }}
        >
          <div
            className="d-flex align-items-center gap-1 mb-2 fw-semibold text-success-emphasis"
            style={{ fontSize: "0.72rem" }}
          >
            <Lightbulb size={12} />
            Present in inventory with same generic name
          </div>
          <div className="d-flex flex-wrap gap-2">
            {alternatives.map((med) => (
              <button
                key={med._id}
                type="button"
                className="btn btn-light text-start"
                style={{
                  fontSize: "0.75rem",
                  padding: "4px 10px",
                  border: "1px solid #cfe3d5",
                  maxWidth: "100%",
                }}
                onClick={() => pickAlternative(med)}
              >
                {medicineLabel(med)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

PrescriptionPharmacyStock.propTypes = {
  medicine: PropTypes.object.isRequired,
  centerId: PropTypes.string.isRequired,
  available: PropTypes.bool,
  onReplace: PropTypes.func.isRequired,
};

export default PrescriptionPharmacyStock;
