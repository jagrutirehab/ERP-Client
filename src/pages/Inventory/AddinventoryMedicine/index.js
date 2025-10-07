import React from "react";
import { useForm } from "react-hook-form";

const AddinventoryMedicine = ({ defaultValues = {}, onSubmit }) => {
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
    onSubmit && onSubmit(data);
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
            <option value="LOW">Low</option>
          </select>
          {errors.Status && (
            <p style={styles.errorText}>{errors.Status.message}</p>
          )}
        </div>
        <InputField
          label="Company"
          name="company"
          validation={{ required: "Company is required" }}
          isFullWidth
        />
        <InputField label="Manufacturer" name="manufacturer" isFullWidth />
        <InputField label="Rack Number" name="RackNum" isFullWidth />
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
