import React from "react";
import { useForm } from "react-hook-form";

const AddinventoryMedicine = ({ defaultValues = {}, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: defaultValues.name || "",
      generic: defaultValues.generic || "",
      category: defaultValues.category || "",
      form: defaultValues.form || "",
      strength: defaultValues.strength || "",
      stock: defaultValues.stock || "",
      reorder: defaultValues.reorder || "",
      expiry: defaultValues.expiry || "",
      batch: defaultValues.batch || "",
      supplier: defaultValues.supplier || "",
      status: defaultValues.status || "AVAILABLE",
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
    inputFocus: {
      borderColor: "#4299e1",
      outline: "none",
      boxShadow: "0 0 0 1px #4299e1",
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
    submitButtonHover: {
      backgroundColor: "#3182ce",
    },
    select: {
      padding: "12px 15px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "15px",
      transition: "border-color 0.2s",
      WebkitAppearance: "none",
      MozAppearance: "none",
      appearance: "none",
      backgroundColor: "white",
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
        {defaultValues?.name ? "Edit Medicine Details" : "Add New Medicine"}
      </h2>

      <form onSubmit={handleSubmit(submitHandler)} style={styles.form}>
        <InputField
          label="Medicine Name"
          name="name"
          validation={{ required: "Name is required" }}
          isFullWidth={true}
        />
        <InputField
          label="Generic Name"
          name="generic"
          validation={{ required: "Generic name is required" }}
        />
        <InputField
          label="Category"
          name="category"
          validation={{ required: "Category is required" }}
        />
        <InputField
          label="Form (e.g., Tablet, Syrup)"
          name="form"
          validation={{ required: "Form is required" }}
        />
        <InputField
          label="Strength"
          name="strength"
          validation={{ required: "Strength is required" }}
        />
        <InputField
          label="Current Stock"
          name="stock"
          type="number"
          validation={{
            required: "Stock is required",
            min: { value: 0, message: "Stock must be non-negative" },
            valueAsNumber: true,
          }}
        />
        <InputField
          label="Reorder Level"
          name="reorder"
          type="number"
          validation={{
            required: "Reorder level is required",
            min: { value: 0, message: "Reorder must be non-negative" },
            valueAsNumber: true,
          }}
        />
        <InputField
          label="Expiry Date"
          name="expiry"
          type="date"
          validation={{ required: "Expiry date is required" }}
        />
        <InputField
          label="Batch Number"
          name="batch"
          validation={{ required: "Batch number is required" }}
        />
        <InputField
          label="Supplier"
          name="supplier"
          validation={{ required: "Supplier is required" }}
          isFullWidth={true}
        />

        <div style={styles.formGroup}>
          <label htmlFor="status" style={styles.label}>
            Status
          </label>
          <select
            id="status"
            {...register("status", { required: "Status is required" })}
            style={styles.select}
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="LOW">LOW</option>
            <option value="OUT OF STOCK">OUT OF STOCK</option>
          </select>
          {errors.status && (
            <p style={styles.errorText}>{errors.status.message}</p>
          )}
        </div>
        <div style={{ gridColumn: "2 / 3" }}></div>
        <button
          type="submit"
          style={styles.submitButton}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              styles.submitButtonHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor =
              styles.submitButton.backgroundColor)
          }
        >
          {defaultValues?.name ? "Update Medicine" : "Add Medicine"}
        </button>
      </form>
    </div>
  );
};

export default AddinventoryMedicine;
