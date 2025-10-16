import React, { useEffect, useRef, useState } from "react";
import { Select } from "../Components/Select";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { Input } from "reactstrap";
import { searchPatient } from "../../../store/actions";
import { connect } from "react-redux";
import PropTypes from "prop-types";

const Givemedicine = ({ patients, user, setModalOpengive, fetchMedicines, onResetPagination }) => {
  const dispatch = useDispatch();
  const centerAccess = useSelector((state) => state.User.centerAccess);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const abortRef = useRef(null);
  const [value, setValue] = useState("");

  const onChangeData = (value) => setValue(value);

  // Fetch medicines
  async function fetchLocalMedicines({
    page = 1,
    limit = 10,
    q = "",
    center,
  } = {}) {
    if (abortRef.current) abortRef.current?.abort?.();

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const params = { page, limit, search: q || undefined };
      if (center) params.center = center;
      else if (user?.centerAccess) params.centers = user.centerAccess;

      const response = await axios.get("/pharmacy/", {
        params,
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      });

      setMedicines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const cancelled =
        err?.name === "CanceledError" ||
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED";
      if (!cancelled) toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  }

  // Debounce medicine search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearch.length >= 1) {
      fetchLocalMedicines({ q: debouncedSearch, center: selectedCenter });
    } else setMedicines([]);
  }, [debouncedSearch, selectedCenter]);

  // Select medicine
  const handleSelectMedicine = (med) => {
    if (selectedMedicines.some((m) => m._id === med._id)) return;
    const centerStock =
      med.centers?.find((c) => c.centerId?._id === selectedCenter)?.stock ?? 0;
    setSelectedMedicines((prev) => [
      ...prev,
      { ...med, quantity: 1, availableStock: centerStock },
    ]);
    setSearchQuery("");
    setMedicines([]);
  };

  const handleQuantityChange = (id, qty) => {
    setSelectedMedicines((prev) =>
      prev.map((m) => {
        if (m._id === id) {
          const safeQty = Math.min(Number(qty) || 0, m.availableStock || 0);
          if (Number(qty) > m.availableStock) {
            toast.warn(
              `⚠️ Only ${m.availableStock} units available for ${m.medicineName}`
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
  useEffect(() => {
    if (!value.trim()) return;
    const t = setTimeout(async () => {
      try {
        setLoadingPatients(true);
        await dispatch(searchPatient({ name: value, centerAccess }));
      } catch (err) {
        console.error("Patient search failed:", err);
      } finally {
        setLoadingPatients(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [value, dispatch, centerAccess]);

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

    const payload = {
      userId: user.user._id,
      CenterId: selectedCenter,
      MedicineId: selectedMedicines.map((m) => ({
        Medicine: m._id,
        quantity: m.quantity,
      })),
      patientId: selectedPatient ? selectedPatient._id : null,
    };

    try {
      setLoading(true);
      const response = await axios.post("/pharmacy/give-medicine", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        toast.success("Medicine given successfully!");
        // Reset form
        setSelectedMedicines([]);
        setSelectedCenter("");
        setSelectedPatient(null);
        setValue("");
        setSearchQuery("");
        setMedicines([]);
        // Close modal and refetch data
        setModalOpengive(false);
        onResetPagination();
        fetchMedicines({
          page: 1, // Optionally reset to first page
          limit: 5, // Match InventoryManagement's default pageSize
          q: "",
          fillter: "",
          center: selectedCenter || undefined,
          centers: user?.centerAccess,
        });
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Server Error");
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
        <Select
          placeholder="Select Center"
          value={selectedCenter}
          onChange={(e) => {
            setSelectedCenter(e.target.value);
            setSelectedMedicines([]);
          }}
          options={
            user?.userCenters?.map((center) => ({
              value: center?._id ?? center?.id ?? "",
              label: center?.title ?? center?.name ?? "Unknown",
            })) || []
          }
        />
      </div>

      {/* Medicine (mandatory) */}
      <div>
        <label>
          Medicine: <span style={{ color: "red" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search medicines..."
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && medicines.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "42px",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "6px",
                maxHeight: "200px",
                overflowY: "auto",
                listStyle: "none",
                zIndex: 999,
                margin: 0,
                padding: 0,
              }}
            >
              {medicines.map((med) => (
                <li
                  key={med._id}
                  onClick={() => handleSelectMedicine(med)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {med.medicineName} ({med.Strength}{med.unitType}, stock:{" "}
                  {med.centers?.find((c) => c.centerId?._id === selectedCenter)
                    ?.stock ?? 0}
                  )
                </li>
              ))}
            </ul>
          )}
        </div>

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
                  alignItems: "center",
                  gap: "10px",
                  background: "#f9f9f9",
                }}
              >
                <span>{med.medicineName}</span>
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
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(med._id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "red",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient (optional) */}
      <div>
        <label>Patient:</label>
        {!selectedPatient ? (
          <div style={{ position: "relative" }}>
            <Input
              type="text"
              placeholder="Search Patient..."
              value={value}
              onChange={(e) => onChangeData(e.target.value)}
            />
            {value && patients?.length > 0 && (
              <ul
                style={{
                  position: "absolute",
                  top: "42px",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  listStyle: "none",
                  zIndex: 999,
                  margin: 0,
                  padding: 0,
                }}
              >
                {patients.map((p) => (
                  <li
                    key={p._id}
                    onClick={() => {
                      setSelectedPatient(p);
                      setValue("");
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "8px 12px",
              background: "#f9f9f9",
            }}
          >
            <span>
              {`${selectedPatient.name} : ${
                selectedPatient?.id?.prefix || ""
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
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <button onClick={handleSubmit} className="btn btn-primary mt-3">
        Submit
      </button>
    </div>
  );
};

Givemedicine.propTypes = {
  patients: PropTypes.array,
  user: PropTypes.object,
  setModalOpengive: PropTypes.func,
  fetchMedicines: PropTypes.func,
};

const mapStateToProps = (state) => ({
  patients: state.Patient.searchedPatients,
});

export default connect(mapStateToProps)(Givemedicine);
