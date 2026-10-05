import { useRef, useState } from "react";
import ReactSelect from "react-select";
import AsyncSelect from "react-select/async";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { getSearchPatients } from "../../../helpers/backend_helper";
import MedicinePicker, { formatExpiry, medicineKeyString } from "./MedicinePicker";

const selectStyles = {
  control: (base) => ({ ...base, minHeight: 38 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const PATIENT_SEARCH_DEBOUNCE_MS = 350;
const PATIENT_MIN_SEARCH_LENGTH = 2;

const Givemedicine = ({
  user,
  setModalOpengive,
  fetchMedicines,
  onResetPagination,
}) => {
  const centerList = useSelector((state) => state.Center.data);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const patientDebounceRef = useRef(null);
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const centerOptions =
    centerList
      ?.filter((center) => user?.centerAccess?.includes(center?._id))
      ?.map((center) => ({
        value: center?._id ?? "",
        label: center?.title ?? "Unknown Center",
      })) || [];

  // Select medicine
  const handleSelectMedicine = (med) => {
    if (selectedMedicines.some((m) => m._id === med._id)) return;
    const centerStock =
      med.centers?.find((c) => c.centerId?._id === selectedCenter)?.stock ?? 0;
    setSelectedMedicines((prev) => [
      ...prev,
      { ...med, quantity: 1, availableStock: centerStock },
    ]);
  };

  const handleQuantityChange = (id, qty) => {
    setSelectedMedicines((prev) =>
      prev.map((m) => {
        if (m._id === id) {
          const safeQty = Math.min(Number(qty) || 0, m.availableStock || 0);
          if (Number(qty) > m.availableStock) {
            toast.warn(
              `Only ${m.availableStock} units available for ${m.medicineName}`
            );
          }
          return { ...m, quantity: safeQty };
        }
        return m;
      })
    );
  };

  const handleRemoveMedicine = (id) =>
    setSelectedMedicines((prev) => prev.filter((m) => m._id !== id));

  // Patient search
  const loadPatientOptions = (input) => {
    clearTimeout(patientDebounceRef.current);
    if (!input || input.trim().length < PATIENT_MIN_SEARCH_LENGTH) {
      return Promise.resolve([]);
    }
    return new Promise((resolve) => {
      patientDebounceRef.current = setTimeout(async () => {
        try {
          const res = await getSearchPatients({
            name: input,
            centerId: selectedCenter,
            admittedOnly: true,
          });
          const list = res?.payload || [];
          resolve(
            list.map((p) => ({
              value: p._id,
              label: `${p.name} : ${p?.id?.prefix || ""} ${p?.id?.value || ""}`,
              patient: p,
            }))
          );
        } catch {
          resolve([]);
        }
      }, PATIENT_SEARCH_DEBOUNCE_MS);
    });
  };

  // Form submit validation
  const handleSubmit = async () => {
    if (!selectedCenter) {
      toast.error("Center is mandatory *");
      return;
    }
    if (selectedMedicines.length === 0) {
      toast.error("Please select at least one medicine *");
      return;
    }
    if (!selectedPatient) {
      toast.error("Patient is mandatory *");
      return;
    }

    const payload = {
      userId: user.user._id,
      CenterId: selectedCenter,
      MedicineId: selectedMedicines.map((m) => ({
        Medicine: m._id,
        quantity: m.quantity,
      })),
      patientId: selectedPatient._id,
    };

    try {
      setLoading(true);
      const response = await axios.post("/pharmacy/give-medicine", payload, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        toast.success("Medicine given successfully!");
        // Reset form
        setSelectedMedicines([]);
        setSelectedCenter("");
        setSelectedPatient(null);
        // Close modal and refetch data
        setModalOpengive(false);
        onResetPagination();
        fetchMedicines?.();
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 space-y-3">
      {/* Center (mandatory) */}
      <div>
        <label>
          Center: <span style={{ color: "red" }}>*</span>
        </label>
        <ReactSelect
          placeholder="Select Center"
          value={centerOptions.find((o) => o.value === selectedCenter) || null}
          onChange={(opt) => {
            setSelectedCenter(opt?.value || "");
            setSelectedMedicines([]);
          }}
          options={centerOptions}
          styles={selectStyles}
          menuPortalTarget={document.body}
          isClearable
        />
      </div>

      {/* Medicine (mandatory) */}
      <div>
        <label>
          Medicine: <span style={{ color: "red" }}>*</span>
        </label>
        <MedicinePicker
          centerId={selectedCenter}
          excludeIds={selectedMedicines.map((m) => m._id)}
          onSelect={handleSelectMedicine}
          isDisabled={!selectedCenter}
        />

        {/* Selected Medicines */}
        {selectedMedicines.length > 0 && (
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {selectedMedicines.map((med) => (
              <div
                key={med._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "10px",
                  background: "#f9f9f9",
                  width: "100%",
                }}
              >
                <span>{medicineKeyString(med)}</span>
                <input
                  type="number"
                  min="1"
                  max={med.availableStock}
                  value={med.quantity}
                  onChange={(e) =>
                    handleQuantityChange(med._id, e.target.value)
                  }
                  style={{ width: "70px" }}
                />
                <span style={{ fontSize: "12px", color: "#888" }}>
                  / {med.availableStock} max
                </span>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {[
                    med.id || "N/A",
                    `Batch: ${med.Batch || "N/A"}`,
                    `Company: ${med.company || "N/A"}`,
                  ].join(" · ")}
                </span>
                <span> Exp: {formatExpiry(med.Expiry)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(med._id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "red",
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient (mandatory) */}
      <div>
        <label>
          Patient: <span style={{ color: "red" }}>*</span>
        </label>
        {!selectedPatient ? (
          <AsyncSelect
            isDisabled={!selectedCenter}
            placeholder={selectedCenter ? "Search Patient..." : "Select a center first"}
            noOptionsMessage={({ inputValue }) =>
              inputValue ? "No patients found" : "Type to search"
            }
            loadOptions={loadPatientOptions}
            value={null}
            onChange={(opt) => opt && setSelectedPatient(opt.patient)}
            styles={selectStyles}
            menuPortalTarget={document.body}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "8px 12px",
              background: "#f9f9f9",
            }}
          >
            <span style={{ wordBreak: "break-word" }}>
              {`${selectedPatient.name} : ${selectedPatient?.id?.prefix || ""
                } ${selectedPatient?.id?.value || ""}`}
            </span>
            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              style={{
                border: "none",
                background: "transparent",
                color: "red",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <button onClick={handleSubmit} className="btn btn-primary mt-3" disabled={loading}>
        Submit
      </button>
    </div>
  );
};

Givemedicine.propTypes = {
  user: PropTypes.object,
  setModalOpengive: PropTypes.func,
  fetchMedicines: PropTypes.func,
  onResetPagination: PropTypes.func,
};

export default Givemedicine;
