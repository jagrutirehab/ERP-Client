import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";

const AddinventoryMedicine = ({
  user,
  defaultValues = {},
  onSubmit,
  uploading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: defaultValues.code || "",
      medicineName: defaultValues.medicineName || "",
      unitType: defaultValues.unitType || "",
      Strength: defaultValues.Strength || "",
      stock: defaultValues.stock || "",
      costprice: defaultValues.costprice || "",
      value: defaultValues.value || "",
      mrp: defaultValues.mrp || "",
      purchasePrice: defaultValues.purchasePrice || "",
      SalesPrice: defaultValues.SalesPrice || "",
      company: defaultValues.company || "",
      manufacturer: defaultValues.manufacturer || "",
      RackNum: defaultValues.RackNum || "",
      Expiry: defaultValues.Expiry || "",
      Batch: defaultValues.Batch || "",
      Status: defaultValues.Status || "NORMAL",
    },
  });

  const submitHandler = (data) => {
    if (!selectedCenters.length) {
      alert("At least one valid center is required");
      return;
    }

    // Convert selectedCenters (IDs) into objects with stock = 0
    const centersPayload = selectedCenters.map((id) => ({
      centerId: id,
      stock: data.stock,
    }));
    onSubmit && onSubmit({ ...data, centers: centersPayload });
    // onSubmit && onSubmit({ ...data, centers: selectedCenters });
  };

  // --- Dropdown and selected centers state ---
  const containerRef = useRef(null);
  const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
  const [selectedCenters, setSelectedCenters] = useState(
    defaultValues.centers ? defaultValues.centers.map((c) => c.centerId) : []
  );

  const availableCenters = user?.userCenters.filter(
    (c) => !selectedCenters.includes(String(c._id))
  );

  const handleAddCenter = (id) => {
    setSelectedCenters((prev) => [...prev, id]);
  };

  const handleRemoveCenter = (id) => {
    setSelectedCenters((prev) => prev.filter((x) => x !== id));
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
        {...register(name, validation)}
        style={styles.input}
      />
      {errors[name] && <p style={styles.errorText}>{errors[name].message}</p>}
    </div>
  );

  return (
    <div>
      <h2 style={styles.title}>
        {defaultValues?.medicineName
          ? "Edit Medicine Details"
          : "Add New Medicine"}
      </h2>

      <form onSubmit={handleSubmit(submitHandler)} style={styles.form}>
        <InputField
          label="Medicine Name"
          name="medicineName"
          validation={{ required: "Medicine name is required" }}
          isFullWidth
        />
        {/* --- Center Multi-Select --- */}
        <div ref={containerRef} style={{ width: "100%" }}>
          <label
            htmlFor="centersMultiCustom"
            style={{ ...styles.label, display: "block" }}
          >
            Select Centers
          </label>

          <div
            id="centersMultiCustom"
            style={{
              width: "100%", // ✅ full width
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 10px",
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              backgroundColor: uploading ? "#f8f9fa" : "white",
              cursor: uploading ? "not-allowed" : "pointer",
              boxSizing: "border-box", // important for 100% width
            }}
            onClick={() => !uploading && setCenterDropdownOpen((s) => !s)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !uploading) {
                e.preventDefault();
                setCenterDropdownOpen((s) => !s);
              }
            }}
          >
            {selectedCenters.length === 0 && (
              <div style={{ color: "#6c757d" }}>No centers selected</div>
            )}

            {selectedCenters.map((id) => {
              const c = user?.userCenters.find(
                (x) => String(x?._id) === String(id)
              );
              return (
                <div
                  key={id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    backgroundColor: "#e9f2ff",
                    border: "1px solid #d0e6ff",
                    borderRadius: 999,
                    fontSize: 13,
                  }}
                >
                  <span>{c?.title ?? id}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCenter(id);
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 0,
                      margin: 0,
                      lineHeight: 1,
                      fontWeight: 700,
                    }}
                    aria-label={`Remove ${c?.title ?? id}`}
                    disabled={uploading}
                  >
                    ×
                  </button>
                </div>
              );
            })}

            <div style={{ marginLeft: "auto", paddingLeft: 8 }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transform: centerDropdownOpen ? "rotate(180deg)" : "none",
                }}
              >
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="#495057"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {centerDropdownOpen && !uploading && (
            <div
              style={{
                width: "100%", // ✅ dropdown full width
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                marginTop: 8,
                maxHeight: 220,
                overflow: "auto",
                background: "white",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                zIndex: 9999,
                position: "relative",
                boxSizing: "border-box",
              }}
            >
              {availableCenters.length === 0 ? (
                <div style={{ padding: 12, color: "#6c757d" }}>
                  No more centers
                </div>
              ) : (
                availableCenters.map((c) => (
                  <div
                    key={c?._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddCenter(c?._id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCenter(c?._id);
                      }
                    }}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f1f3f5",
                      cursor: "pointer",
                    }}
                  >
                    {c?.title}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* --- Form Fields --- */}
        <InputField
          label="Code"
          name="code"
          validation={{ required: "Code is required" }}
        />
        <InputField
          label="Unit Type"
          name="unitType"
          validation={{ required: "Unit Type is required" }}
        />
        <InputField
          label="Current Stock"
          name="stock"
          type="number"
          validation={{ required: "Stock is required" }}
        />
        <InputField label="Strength" name="Strength" />
        <InputField
          label="Cost Price"
          name="costprice"
          type="number"
          validation={{
            required: "Cost Price is required",
            min: { value: 0, message: "Must be non-negative" },
          }}
        />
        <InputField
          label="Value"
          name="value"
          type="number"
          validation={{
            required: "Value is required",
            min: { value: 0, message: "Must be non-negative" },
          }}
        />
        <InputField
          label="M.R.P"
          name="mrp"
          type="number"
          validation={{
            required: "MRP is required",
            min: { value: 0, message: "Must be non-negative" },
          }}
        />
        <InputField
          label="Purchase Price"
          name="purchasePrice"
          type="number"
          validation={{
            required: "Purchase Price is required",
            min: { value: 0, message: "Must be non-negative" },
          }}
        />
        <InputField
          label="Sales Price"
          name="SalesPrice"
          type="number"
          validation={{
            required: "Sales Price is required",
            min: { value: 0, message: "Must be non-negative" },
          }}
        />
        <InputField label="Expiry Date" name="Expiry" type="date" />
        <InputField label="Batch Number" name="Batch" />
        <div style={styles.formGroup}>
          <label htmlFor="Status" style={styles.label}>
            Status
          </label>
          <select
            id="Status"
            {...register("Status", { required: "Status is required" })}
            style={styles.select}
          >
            <option value="NORMAL">Normal</option>
            <option value="MODRATE">Modrate</option>
            <option value="LOW">Low</option>
            <option value="OUTOFSTOCK">Out of Stock</option>
          </select>
          {errors.Status && (
            <p style={styles.errorText}>{errors.Status.message}</p>
          )}
        </div>
        <InputField
          label="Company"
          name="company"
          validation={{ required: "Company is required" }}
        />
        <InputField label="Manufacturer" name="manufacturer" />
        <InputField label="Rack Number" name="RackNum" />

        {/* Submit Button */}
        <button
          type="submit"
          style={styles.submitButton}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#3182ce")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#4299e1")
          }
        >
          {defaultValues?.medicineName ? "Update Medicine" : "Add Medicine"}
        </button>
      </form>
    </div>
  );
};

export default AddinventoryMedicine;
