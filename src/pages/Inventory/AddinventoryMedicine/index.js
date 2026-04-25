import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dropdown, DropdownToggle, Spinner } from "reactstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const normalizeLabel = (val) =>
  val ? val.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const AddinventoryMedicine = ({
  user,
  defaultValues = {},
  onSubmit,
  uploading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    defaultValues: {
      code: defaultValues.code || "",
      medicineId: defaultValues.medicineId || "",
      medicineName: defaultValues.medicineName || "",
      brandName: defaultValues.medicineId?.brandName || defaultValues.brandName || "",
      genericName: defaultValues.medicineId?.genericName || defaultValues.genericName || "",
      form: defaultValues.medicineId?.form || defaultValues.form || "",
      baseUnit: defaultValues.medicineId?.baseUnit || defaultValues.baseUnit || "",
      purchaseUnit: defaultValues.medicineId?.purchaseUnit || defaultValues.purchaseUnit || "",
      category: defaultValues.medicineId?.category || defaultValues.category || "",
      storageType: defaultValues.medicineId?.storageType || defaultValues.storageType || "",
      scheduleType: defaultValues.medicineId?.scheduleType || defaultValues.scheduleType || "",
      unitType: defaultValues.unitType || "",
      Strength: defaultValues.Strength || "",
      stock: defaultValues.stock || "",
      // costprice: defaultValues.costprice || "",
      // value: defaultValues.value || "",
      mrp: defaultValues.mrp || "",
      purchasePrice: defaultValues.purchasePrice || "",
      SalesPrice: defaultValues.SalesPrice || "",
      company: defaultValues.company || "",
      manufacturer: defaultValues.manufacturer || "",
      RackNum: defaultValues.RackNum || "",
      Expiry: defaultValues.Expiry || "",
      Batch: Array.isArray(defaultValues.Batch) ? defaultValues.Batch : (defaultValues.Batch ? [defaultValues.Batch] : []),
      Status: defaultValues.Status || "NORMAL",
    },
  });

  const isEditMode = !!defaultValues.medicineName;

  const submitHandler = (data) => {
    if (!selectedCenters.length) {
      alert("At least one valid center is required");
      return;
    }

    const centersPayload = selectedCenters.map((id) => {
      let stock = Number(centerStocks[id]) || 0;
      const unitType = centerStockUnits[id] || "BASE";

      if (unitType === "PURCHASE" && medicineConversion?.baseQuantity && medicineConversion?.purchaseQuantity) {
        stock = stock * (medicineConversion.baseQuantity / medicineConversion.purchaseQuantity);
      }

      return {
        centerId: id,
        stock: stock,
      };
    });
    onSubmit && onSubmit({ ...data, centers: centersPayload });
    // onSubmit && onSubmit({ ...data, centers: selectedCenters });
  };

  // --- Dropdown and selected centers state ---
  // --- Dropdown and selected centers state ---
  const [medicineDropdownOpen, setMedicineDropdownOpen] = useState(false);
  const [medicineQuery, setMedicineQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [medicineValidLoader, setMedicineValidLoader] = useState(false);
  const [medicineSelected, setMedicineSelected] = useState(false);
  const [medicineValid, setMedicineValid] = useState(true);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [selectedCenters, setSelectedCenters] = useState(
    defaultValues.centers
      ? defaultValues.centers
        .map((c) => {
          return typeof c.centerId === "object"
            ? String(c.centerId._id)
            : String(c.centerId);
        })
        .filter((id) => user?.centerAccess?.includes(id))
      : []
  );
  const [centerStocks, setCenterStocks] = useState(() => {
    const map = {};
    if (defaultValues.centers) {
      defaultValues.centers.forEach((c) => {
        const id =
          typeof c.centerId === "object"
            ? String(c.centerId._id)
            : String(c.centerId);

        map[id] = c.stock ?? "";
      });
    }
    return map;
  });

  const [medicineConversion, setMedicineConversion] = useState(
    defaultValues.medicineId?.conversion || defaultValues.conversion || null
  );
  const [centerStockUnits, setCenterStockUnits] = useState({});






  useEffect(() => {
    const verifyMedicineExists = async () => {
      if (!defaultValues?.medicineName) return;

      try {
        setMedicineValidLoader(true);
        const res = await axios.get("/medicine/", {
          params: { search: defaultValues.medicineName },
        });
        const payload = res?.payload || [];

        const found = payload.find(
          (m) =>
            m.name?.toLowerCase().trim() ===
            defaultValues.medicineName?.toLowerCase().trim()
        );

        if (!found) {
          setMedicineValid(false);
        } else {
          setMedicineQuery(defaultValues.medicineName);
          setMedicineSelected(true);
          setMedicineConversion(found.conversion || null);
          setValue("medicineName", defaultValues.medicineName);
          setValue("brandName", defaultValues.medicineId?.brandName || defaultValues.brandName || "");
          setValue("genericName", defaultValues.medicineId?.genericName || defaultValues.genericName || "");
          setValue("form", defaultValues.medicineId?.form || defaultValues.form || "");
          setValue("baseUnit", defaultValues.medicineId?.baseUnit || defaultValues.baseUnit || "");
          setValue("purchaseUnit", defaultValues.medicineId?.purchaseUnit || defaultValues.purchaseUnit || "");
          setValue("category", defaultValues.medicineId?.category || defaultValues.category || "");
          setValue("storageType", defaultValues.medicineId?.storageType || defaultValues.storageType || "");
          setValue("scheduleType", defaultValues.medicineId?.scheduleType || defaultValues.scheduleType || "");
          setValue("unitType", defaultValues.unitType || "");
          setValue("Strength", defaultValues.Strength || "");
          setValue("purchasePrice", defaultValues.purchasePrice || "");
        }
      } catch (err) {
        console.error(err);
        setMedicineValid(false);
      } finally {
        setMedicineValidLoader(false);
      }
    };

    verifyMedicineExists();
  }, [defaultValues]);



  const handleMedicineSearch = async (query) => {
    setMedicineQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoadingMedicines(true);
    try {
      const res = await axios.get("/medicine/", {
        params: {
          search: query,
        },
      });
      const payload = res?.payload || [];
      setSearchResults(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMedicines(false);
      setMedicineDropdownOpen(true);
    }
  };


  useEffect(() => {
    if (isEditMode && !hasUserTyped) return;

    const delayDebounce = setTimeout(() => {
      if (medicineQuery.trim()) {
        handleMedicineSearch(medicineQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [medicineQuery, hasUserTyped]);

  const handleSelectMedicine = (medicine) => {
    setValue("medicineId", medicine._id);
    setValue("medicineName", medicine.name);
    setMedicineConversion(medicine.conversion || null);
    setValue("brandName", medicine.brandName || "");
    setValue("genericName", medicine.genericName || "");
    setValue("form", medicine.form || "");
    setValue("baseUnit", medicine.baseUnit || "");
    setValue("purchaseUnit", medicine.purchaseUnit || "");
    setValue("category", medicine.category || "");
    setValue("storageType", medicine.storageType || "");
    setValue("scheduleType", medicine.scheduleType || "");
    setValue("unitType", medicine.unit || "");
    setValue("Strength", medicine.strength || "");
    setValue("purchasePrice", medicine.unitPrice || "");

    setMedicineQuery(medicine.name);
    setMedicineDropdownOpen(false);
    setMedicineSelected(true);
  };




  const allowedCenters = (user?.userCenters || []).filter((c) =>
    user?.centerAccess?.includes(String(c._id))
  );

  const handleCenterChange = (selectedOptions) => {
    const newSelectedIds = (selectedOptions || []).map((opt) => opt.value);

    // Find removed centers and delete their stocks & units
    const removedIds = selectedCenters.filter((id) => !newSelectedIds.includes(id));
    if (removedIds.length > 0) {
      setCenterStocks((prev) => {
        const copy = { ...prev };
        removedIds.forEach((id) => delete copy[id]);
        return copy;
      });
      setCenterStockUnits((prev) => {
        const copy = { ...prev };
        removedIds.forEach((id) => delete copy[id]);
        return copy;
      });
    }

    // Find added centers and initialize them
    const addedIds = newSelectedIds.filter((id) => !selectedCenters.includes(id));
    if (addedIds.length > 0) {
      setCenterStocks((prev) => {
        const copy = { ...prev };
        addedIds.forEach((id) => {
          if (copy[id] === undefined) copy[id] = "";
        });
        return copy;
      });
      setCenterStockUnits((prev) => {
        const copy = { ...prev };
        addedIds.forEach((id) => {
          if (copy[id] === undefined) copy[id] = "BASE";
        });
        return copy;
      });
    }

    setSelectedCenters(newSelectedIds);
  };


  const styles = {
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#1a202c",
      marginBottom: "30px",
      borderBottom: "2px solid #edf2f7",
      paddingBottom: "10px",
      textAlign: "center",
    },
    form: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      marginBottom: "8px",
      fontWeight: "600",
      fontSize: "14px",
      color: "#4a5568",
    },
    input: {
      padding: "12px 15px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "15px",
      transition: "border-color 0.2s",
    },
    errorText: {
      color: "#e53e3e",
      fontSize: "12px",
      marginTop: "4px",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    submitButton: {
      gridColumn: "1 / -1",
      backgroundColor: "#4299e1",
      color: "#ffffff",
      padding: "15px 25px",
      borderRadius: "8px",
      fontWeight: "700",
      fontSize: "16px",
      border: "none",
      cursor: "pointer",
      marginTop: "20px",
      transition: "background-color 0.2s, transform 0.1s",
    },
    select: {
      padding: "12px 15px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "15px",
      transition: "border-color 0.2s",
      backgroundColor: "white",
      appearance: "none",
    },
  };

  const InputField = ({
    label,
    name,
    type = "text",
    validation,
    isFullWidth = false,
    step,
    disabled = false
  }) => (
    <div
      style={{ ...styles.formGroup, ...(isFullWidth ? styles.fullWidth : {}) }}
    >
      <label htmlFor={name} style={styles.label}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        step={step || (type === "number" ? "any" : undefined)}
        {...register(name, validation)}
        style={styles.input}
        disabled={disabled}
      />
      {errors[name] && <p style={styles.errorText}>{errors[name].message}</p>}
    </div>
  );

  if (medicineValidLoader) {
    return (
      <div className="text-center py-4">
        <Spinner color="primary" />
      </div>
    )
  }

  return (
    <div>
      {
        medicineValid && (<h2 style={styles.title}>
          {defaultValues?.medicineName
            ? "Edit Medicine Details"
            : "Add New Medicine"}
        </h2>)
      }

      {!medicineValid ? (
        <div className="text-center py-5">
          <i className="ri-error-warning-line fs-1 text-danger"></i>
          <h5 className="mt-3 text-danger">Medicine no longer exists in master list</h5>
          <p className="text-muted">Please add it to the master medicine list first before editing.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(submitHandler)}>

          {/* Section: Medicine Search */}
          <div className="mb-4">
            <p className="fw-semibold text-muted fs-12 text-uppercase mb-2" style={{ letterSpacing: "0.08em" }}>Medicine</p>
            <div style={{ position: "relative" }}>
              <label className="fs-12 text-muted mb-1">Medicine Name</label>
              <input
                id="medicineName"
                type="text"
                placeholder="Search medicine..."
                value={medicineQuery}
                onChange={(e) => {
                  setMedicineQuery(e.target.value);
                  if (isEditMode) setHasUserTyped(true);
                }}
                className="form-control form-control-sm"
                autoComplete="off"
              />
              {medicineDropdownOpen && (!isEditMode || hasUserTyped) && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, width: "100%",
                  backgroundColor: "white", border: "1px solid #e2e8f0",
                  borderRadius: 8, maxHeight: 220, overflowY: "auto",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.1)", zIndex: 9999, marginTop: 4,
                }}>
                  {loadingMedicines ? (
                    <div className="p-3 text-muted fs-13">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-muted fs-13">No medicines found</div>
                  ) : (
                    searchResults.map((med) => (
                      <div
                        key={med._id}
                        onClick={() => handleSelectMedicine(med)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="px-3 py-2 border-bottom"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                      >
                        <span className="fw-semibold">{med.name}</span>{" "}
                        {(med.strength || med.unit) && (
                          <span className="text-muted fs-12">({[med.strength, med.unit].filter(Boolean).join(" ")})</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
              {errors.medicineName && <p style={styles.errorText}>{errors.medicineName.message}</p>}
            </div>
          </div>

          {/* Section: Medicine Info (read-only) */}
          {medicineSelected && (
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <p className="fw-semibold text-muted fs-12 text-uppercase mb-3" style={{ letterSpacing: "0.08em" }}>Medicine Details</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px 20px" }}>
                {[
                  // { label: "Brand Name", name: "brandName" },
                  { label: "Generic Name", name: "genericName" },
                  { label: "Form", name: "form" },
                  { label: "Base Unit", name: "baseUnit" },
                  { label: "Purchase Unit", name: "purchaseUnit" },
                  { label: "Strength", name: "Strength" },
                  { label: "Category", name: "category" },
                  { label: "Storage Type", name: "storageType" },
                  { label: "Schedule Type", name: "scheduleType" },
                ].map(({ label, name }) => (
                  <div key={name}>
                    <label className="fs-12 text-muted mb-1">{label}</label>
                    <input {...register(name)} disabled className="form-control form-control-sm bg-white d-none" />
                    <input readOnly className="form-control form-control-sm bg-white" value={normalizeLabel(watch(name))} />
                  </div>
                ))}
                {medicineConversion?.baseQuantity && medicineConversion?.purchaseQuantity && (
                  <div>
                    <label className="fs-12 text-muted mb-1">Conversion</label>
                    <input 
                      readOnly 
                      className="form-control form-control-sm bg-white" 
                      value={`${medicineConversion.purchaseQuantity} ${normalizeLabel(watch("purchaseUnit"))} = ${medicineConversion.baseQuantity} ${normalizeLabel(watch("baseUnit"))}`} 
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Centers */}
          <div className="mb-4">
            <p className="fw-semibold text-muted fs-12 text-uppercase mb-2" style={{ letterSpacing: "0.08em" }}>Centers & Stock</p>
            <div>
              <label className="fs-12 text-muted mb-1">Select Centers</label>
              <Select
                isMulti
                name="centers"
                placeholder="Choose centers..."
                options={(allowedCenters || []).map((c) => ({ value: String(c._id), label: c.title }))}
                value={selectedCenters.map((id) => {
                  const c = allowedCenters.find((x) => String(x._id) === id) || defaultValues.centers?.find((x) => String(typeof x.centerId === "object" ? x.centerId._id : x.centerId) === id)?.centerId;
                  return { value: id, label: c?.title || id };
                })}
                onChange={handleCenterChange}
                classNamePrefix="react-select"
                isDisabled={uploading || !medicineSelected}
              />
            </div>

            {/* Center wise stock */}
            {selectedCenters.length > 0 && (
              <div className="mt-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {selectedCenters.map((id) => {
                  const centerInfo =
                    allowedCenters.find((x) => String(x._id) === id) ||
                    defaultValues.centers?.find((c) => {
                      const cid = typeof c.centerId === "object" ? c.centerId._id : c.centerId;
                      return String(cid) === id;
                    })?.centerId;
                  const rawStockStr = centerStocks[id] ?? "";
                  let stockNum = Number(rawStockStr) || 0;
                  const unitType = centerStockUnits[id] || "BASE";
                  let convertedStock = stockNum;
                  if (unitType === "PURCHASE" && medicineConversion?.baseQuantity && medicineConversion?.purchaseQuantity) {
                    convertedStock = stockNum * (medicineConversion.baseQuantity / medicineConversion.purchaseQuantity);
                  }

                  return (
                    <div key={id}>
                      <label className="fs-12 text-muted mb-1">{centerInfo?.title || "Center"}</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="number" min="0" step="any"
                          value={rawStockStr}
                          onChange={(e) => setCenterStocks((prev) => ({ ...prev, [id]: e.target.value }))}
                          className="form-control w-50"
                          placeholder="Stock"
                        />
                        <select
                          className="form-select w-50"
                          value={unitType}
                          onChange={(e) => setCenterStockUnits((prev) => ({ ...prev, [id]: e.target.value }))}
                        >
                          <option value="BASE">{normalizeLabel(watch("baseUnit")) || "Base Unit"}</option>
                          <option value="PURCHASE">{normalizeLabel(watch("purchaseUnit")) || "Purchase Unit"}</option>
                        </select>
                      </div>
                      {rawStockStr !== "" && (
                        <div className="fs-12 text-dark mt-1 fw-medium" style={{ fontSize: "11px" }}>
                          Total Stock: {convertedStock} {normalizeLabel(watch("baseUnit")) || "Unit"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Inventory Details */}
          <div className="mb-4">
            <p className="fw-semibold text-muted fs-12 text-uppercase mb-3" style={{ letterSpacing: "0.08em" }}>Inventory Details</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              <InputField label="Code" name="code" validation={{ required: "Code is required" }} />
              <InputField label="Unit Type" name="unitType" disabled={true} />
              {/* <InputField label="Cost Price" name="costprice" type="number" step="any" validation={{ required: "Cost Price is required", min: { value: 0, message: "Must be non-negative" } }} />
              <InputField label="Value" name="value" type="number" step="any" validation={{ required: "Value is required", min: { value: 0, message: "Must be non-negative" } }} /> */}
              <InputField label="M.R.P" name="mrp" type="number" step="any" validation={{ required: "MRP is required", min: { value: 0, message: "Must be non-negative" } }} />
              <InputField label="Purchase Price" name="purchasePrice" type="number" step="any" validation={{ min: { value: 0, message: "Must be non-negative" } }} />
              <InputField label="Sales Price" name="SalesPrice" type="number" step="any" validation={{ required: "Sales Price is required", min: { value: 0, message: "Must be non-negative" } }} />
              <InputField label="Expiry Date" name="Expiry" type="date" />
              <div style={styles.formGroup}>
                <label style={styles.label}>Batch Numbers</label>
                <CreatableSelect
                  isMulti
                  isClearable
                  placeholder="Type batch and press enter..."
                  components={{ DropdownIndicator: null }}
                  formatCreateLabel={(inputValue) => inputValue.toUpperCase()}
                  value={(watch("Batch") || []).map((b) => ({ label: b, value: b }))}
                  onChange={(newVal) => setValue("Batch", newVal ? newVal.map((v) => v.value.toUpperCase()) : [])}
                  classNamePrefix="react-select"
                />
              </div>
              <InputField label="Company" name="company" validation={{ required: "Company is required" }} />
              <InputField label="Manufacturer" name="manufacturer" />
              <InputField label="Rack Number" name="RackNum" />
              <div style={styles.formGroup}>
                <label htmlFor="Status" style={styles.label}>Status</label>
                <select id="Status" {...register("Status", { required: "Status is required" })} style={styles.select}>
                  <option value="NORMAL">Normal</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="LOW">Low</option>
                  <option value="OUTOFSTOCK">Out of Stock</option>
                </select>
                {errors.Status && <p style={styles.errorText}>{errors.Status.message}</p>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              disabled={uploading}
              className="btn btn-primary px-4"
            >
              {uploading ? "Saving..." : defaultValues?.medicineName ? "Update Medicine" : "Add Medicine"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddinventoryMedicine;
