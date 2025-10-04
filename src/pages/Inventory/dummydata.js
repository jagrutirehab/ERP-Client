/* eslint-disable no-lone-blocks */
export const medicines = [
  {
    name: "Paracetamol",
    generic: "Acetaminophen",
    category: "Analgesics",
    form: "Tablet",
    strength: "500mg",
    stock: 2500,
    reorder: 500,
    expiry: "Dec 31, 2025",
    batch: "PCM-2024-001",
    supplier: "MedSupply Co",
    status: "NORMAL",
  },
  {
    name: "Amoxicillin",
    generic: "Amoxicillin",
    category: "Antibiotics",
    form: "Capsule",
    strength: "250mg",
    stock: 150,
    reorder: 200,
    expiry: "Aug 15, 2025",
    batch: "AMX-2024-002",
    supplier: "PharmaDist Inc",
    status: "LOW",
  },
  {
    name: "Insulin",
    generic: "Human Insulin",
    category: "Diabetes Medications",
    form: "Injectable",
    strength: "100IU/ml",
    stock: 75,
    reorder: 100,
    expiry: "Jun 30, 2025",
    batch: "INS-2024-003",
    supplier: "SpecialtyCare Ltd",
    status: "LOW",
  },
  {
    name: "Lisinopril",
    generic: "Lisinopril",
    category: "ACE Inhibitors",
    form: "Tablet",
    strength: "10mg",
    stock: 800,
    reorder: 300,
    expiry: "Mar 20, 2026",
    batch: "LIS-2024-004",
    supplier: "MedSupply Co",
    status: "NORMAL",
  },
];

{
  /* Mapping UI */
}
{
  /* {fileColumns.length > 0 && (
          <div className="row g-3">
            {dbFields.map((field) => (
              <div className="col-12 col-md-6" key={field}>
                <label className="form-label text-muted">{field}</label>
                <select
                  className="form-select"
                  value={columnMapping[field] || ""}
                  onChange={(e) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Not Mapped --</option>
                  {fileColumns.map((col, i) => (
                    <option key={i} value={i}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )} */
}

{
  /* {Object.values(columnMapping).some((v) => v !== "") && (
          <div className="mt-4">
            <h5 className="mb-2">Mapping Summary</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>DB Field</th>
                    <th>File Column</th>
                  </tr>
                </thead>
                <tbody>
                  {dbFields.map((field) => {
                    const colIndex = columnMapping[field];
                    if (colIndex === "" || colIndex === undefined) return null;
                    return (
                      <tr key={field}>
                        <td>{field}</td>
                        <td>{fileColumns[colIndex]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )} */
}
