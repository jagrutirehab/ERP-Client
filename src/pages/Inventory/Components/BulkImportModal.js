import React, { useState, useEffect, useRef } from "react";
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
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const dbRefs = useRef({});
  const fileRefs = useRef({});

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
        setUploadedData(jsonData);
        setHeaderRowIndex(0);
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
  );

  // 🧩 Draw lines dynamically whenever mapping changes
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = svgRef.current;
    svg.innerHTML = "";

    const parentRect = containerRef.current.getBoundingClientRect();

    Object.entries(columnMapping).forEach(([field, colIndex]) => {
      if (colIndex === "" || colIndex === undefined) return;

      const dbEl = dbRefs.current[field];
      const fileEl = fileRefs.current[colIndex];
      if (!dbEl || !fileEl) return;

      const dbRect = dbEl.getBoundingClientRect();
      const fileRect = fileEl.getBoundingClientRect();

      const startX = dbRect.right - parentRect.left;
      const startY = dbRect.top + dbRect.height / 2 - parentRect.top;
      const endX = fileRect.left - parentRect.left;
      const endY = fileRect.top + fileRect.height / 2 - parentRect.top;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", startX);
      line.setAttribute("y1", startY);
      line.setAttribute("x2", endX);
      line.setAttribute("y2", endY);
      line.setAttribute("stroke", "#0d6efd");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("marker-end", "url(#arrowhead)");
      svg.appendChild(line);
    });
  }, [columnMapping, uploadedData, headerRowIndex]);

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

        {/* 🔧 Field-Column Mapping (side-by-side layout) */}
        {fileColumns.length > 0 && (
          <div
            className="mapping-section mb-4"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            {dbFields.map((field) => {
              const availableColumns = fileColumns.filter(
                (_, idx) =>
                  columnMapping[field] === String(idx) ||
                  !Object.values(columnMapping).includes(String(idx))
              );
              return (
                <div
                  key={field}
                  className="mapping-row d-flex justify-content-between align-items-center"
                >
                  <div style={{ width: "40%", fontWeight: 500 }}>{field}</div>
                  <div style={{ width: "55%" }}>
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
                </div>
              );
            })}
          </div>
        )}

        {/* Mapping Summary (with working arrows) */}
        {Object.values(columnMapping).some((v) => v !== "") && (
          <div
            ref={containerRef}
            style={{ position: "relative", padding: "20px" }}
          >
            <h5 className="mb-3">Mapping Summary</h5>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {dbFields.map((field, idx) => (
                  <div
                    key={idx}
                    ref={(el) => (dbRefs.current[field] = el)}
                    style={{
                      minWidth: "120px",
                      textAlign: "center",
                      padding: "8px",
                      backgroundColor: "#0d6efd",
                      color: "#fff",
                      borderRadius: "4px",
                      fontWeight: 500,
                    }}
                  >
                    {field}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {fileColumns.map((col, idx) => (
                  <div
                    key={idx}
                    ref={(el) => (fileRefs.current[idx] = el)}
                    style={{
                      minWidth: "120px",
                      textAlign: "center",
                      padding: "8px",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      borderRadius: "4px",
                      fontWeight: 500,
                    }}
                  >
                    {col}
                  </div>
                ))}
              </div>
            </div>

            <svg
              ref={svgRef}
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
            </svg>
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
