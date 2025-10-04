import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { Button } from "../Components/Button";
import * as XLSX from "xlsx";

const dbFields = [
  "name",
  "generic",
  "category",
  "form",
  "strength",
  "stock",
  "reorder",
  "expiry",
  "batch",
  "supplier",
  "status",
];

const BulkImportModal = ({ isOpen, toggle, onImport }) => {
  const [uploadedData, setUploadedData] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [headerRowIndex, setHeaderRowIndex] = useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        setUploadedData(jsonData); // store all rows
        setHeaderRowIndex(0); // default header row = first row
        setColumnMapping({});
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    const fileColumns = uploadedData[headerRowIndex] || [];
    const dataRows = uploadedData.slice(headerRowIndex + 1);

    const mappedData = dataRows.map((row) => {
      const entry = {};
      for (const field in columnMapping) {
        const colIndex = columnMapping[field];
        if (colIndex !== "") entry[field] = row[colIndex];
      }
      return entry;
    });

    onImport(mappedData);
    toggle();
  };

  const fileColumns = uploadedData[headerRowIndex] || [];
  const dataPreview = uploadedData.slice(
    headerRowIndex + 1,
    headerRowIndex + 11
  ); // top 10 rows

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" backdrop="static">
      <ModalHeader toggle={toggle}>Bulk Import Medicines</ModalHeader>
      <ModalBody>
        {/* File Selector */}
        <div className="mb-3">
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileUpload}
            className="form-control"
          />
        </div>

        {/* Header Row Selector */}
        {uploadedData.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Select Header Row</label>
            <select
              className="form-select"
              value={headerRowIndex}
              onChange={(e) => setHeaderRowIndex(Number(e.target.value))}
            >
              {uploadedData.map((row, idx) => (
                <option key={idx} value={idx}>
                  Row {idx + 1}: {row.join(" | ")}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mapping Dropdowns */}
        {fileColumns.length > 0 && (
          <div className="row g-3">
            {dbFields.map((field) => {
              const availableColumns = fileColumns.filter(
                (_, idx) =>
                  columnMapping[field] === String(idx) ||
                  !Object.values(columnMapping).includes(String(idx))
              );

              return (
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
                    {availableColumns.map((col, i) => {
                      const colIndex = fileColumns.indexOf(col);
                      return (
                        <option key={colIndex} value={colIndex}>
                          {col}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            })}
          </div>
        )}

        {/* Mapping Summary */}
        {Object.values(columnMapping).some((v) => v !== "") && (
          <div style={{ marginTop: "20px" }}>
            <h5 style={{ marginBottom: "16px" }}>Mapping Summary</h5>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                position: "relative",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                minHeight: "300px",
              }}
            >
              {/* DB Fields */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {dbFields.map((field, idx) => (
                  <div
                    key={idx}
                    id={`db-${idx}`}
                    style={{
                      minWidth: "120px",
                      textAlign: "center",
                      padding: "8px",
                      backgroundColor: "#0d6efd",
                      color: "#fff",
                      borderRadius: "4px",
                      fontWeight: 500,
                      transition: "all 0.3s",
                    }}
                  >
                    {field}
                  </div>
                ))}
              </div>

              {/* File Columns */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {fileColumns.map((col, idx) => (
                  <div
                    key={idx}
                    id={`file-${idx}`}
                    style={{
                      minWidth: "120px",
                      textAlign: "center",
                      padding: "8px",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      borderRadius: "4px",
                      fontWeight: 500,
                      transition: "all 0.3s",
                    }}
                  >
                    {col}
                  </div>
                ))}
              </div>

              {/* SVG Lines */}
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#0d6efd" />
                  </marker>
                </defs>

                {dbFields.map((field, idx) => {
                  const colIndex = columnMapping[field];
                  if (colIndex === "" || colIndex === undefined) return null;

                  const dbEl = document.getElementById(`db-${idx}`);
                  const fileEl = document.getElementById(`file-${colIndex}`);
                  if (!dbEl || !fileEl) return null;

                  const dbRect = dbEl.getBoundingClientRect();
                  const fileRect = fileEl.getBoundingClientRect();
                  const parentRect =
                    dbEl.parentNode.parentNode.getBoundingClientRect();

                  const startX = dbRect.right - parentRect.left;
                  const startY =
                    dbRect.top + dbRect.height / 2 - parentRect.top;

                  const endX = fileRect.left - parentRect.left;
                  const endY =
                    fileRect.top + fileRect.height / 2 - parentRect.top;

                  return (
                    <line
                      key={idx}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#0d6efd"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      style={{ transition: "all 0.5s ease" }}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Data Preview */}
        {dataPreview.length > 0 && (
          <div className="mt-4">
            <h5 className="mb-2">Data Preview (Top 10 Rows)</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    {fileColumns.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataPreview.map((row, i) => (
                    <tr key={i}>
                      {fileColumns.map((_, j) => (
                        <td key={j}>{row[j]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="d-flex justify-content-end mt-4">
          <Button
            onClick={handleImport}
            disabled={!Object.values(columnMapping).some((v) => v !== "")}
          >
            Import Data
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default BulkImportModal;
