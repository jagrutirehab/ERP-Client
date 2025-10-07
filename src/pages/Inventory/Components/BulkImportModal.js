import React, { useState, useEffect, useRef } from "react";
import { Modal, ModalHeader, ModalBody, Progress } from "reactstrap";
import { Button } from "../Components/Button";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";
import Typeloader from "./Loader";

const dbFields = [
  "code",
  "medicineName",
  "unitType",
  "Strength",
  "stock",
  "costprice",
  "value",
  "mrp",
  "purchasePrice",
  "SalesPrice",
  "company",
  "manufacturer",
  "RackNum",
  "Expiry",
  "Batch",
  "Status",
];

const isNumericField = (field) =>
  [
    "stock",
    "costprice",
    "value",
    "mrp",
    "purchasePrice",
    "SalesPrice",
  ].includes(field);

const BulkImportModal = ({ isOpen, toggle, onImport }) => {
  const [uploadedData, setUploadedData] = useState([]);
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const emptyMapping = () =>
    dbFields.reduce((acc, f) => {
      acc[f] = "";
      return acc;
    }, {});

  const [columnMapping, setColumnMapping] = useState(emptyMapping());

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [failedChunks, setFailedChunks] = useState([]);
  const [uploadDone, setUploadDone] = useState(false);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const dbRefs = useRef({});
  const fileRefs = useRef({});
  const endpoint = "/pharmacy/bulk-insert";
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      setUploadedData(json);
      setHeaderRowIndex(0);
      setColumnMapping(emptyMapping());
      setUploadDone(false);
      setUploadProgress(0);
      setUploadedCount(0);
      setFailedChunks([]);
    };
    reader.readAsArrayBuffer(file);
  };
  const buildMappedObjects = () => {
    const rows = uploadedData.slice(headerRowIndex + 1);
    const mapped = rows.map((row) => {
      const obj = {};
      Object.entries(columnMapping).forEach(([field, colIndexStr]) => {
        if (colIndexStr !== "" && colIndexStr !== undefined) {
          const idx = Number(colIndexStr);
          const rawVal = row?.[idx];
          if (
            rawVal === undefined ||
            rawVal === null ||
            String(rawVal).trim() === ""
          ) {
            return;
          }
          if (isNumericField(field)) {
            const n = Number(String(rawVal).replace(/[^0-9.-]/g, ""));
            obj[field] = Number.isFinite(n) ? n : 0;
          } else {
            obj[field] = String(rawVal).trim();
          }
        }
      });
      return obj;
    });
    return mapped;
  };

  const sendChunkWithRetry = async (chunkData, chunkIndex, maxAttempts = 3) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        await axios.post(endpoint, chunkData, {
          headers: { "Content-Type": "application/json" },
          timeout: 0,
          onUploadProgress: (progressEvent) => {
            if (!totalChunks) return;
            if (progressEvent.total) {
              const chunkPercent = progressEvent.loaded / progressEvent.total; // 0..1
              const overall = Math.round(
                ((chunkIndex + chunkPercent) / totalChunks) * 100
              );
              setUploadProgress((prev) => Math.max(prev, overall));
            }
          },
        });
        return { success: true };
      } catch (err) {
        toast.warn(`Chunk ${chunkIndex} attempt ${attempt} failed`, err);
        if (attempt >= maxAttempts) {
          return { success: false, error: err };
        }
        // eslint-disable-next-line no-loop-func
        await new Promise((r) => setTimeout(r, 600 * attempt));
      }
    }
  };

  const handleImport = async ({ chunkSize = 10 } = {}) => {
    const mappedData = buildMappedObjects();
    const totalItemsLocal = mappedData.length;
    if (!totalItemsLocal) {
      alert("No data to import (either no rows or mapped cells are empty).");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadedCount(0);
    setTotalCount(totalItemsLocal);
    setFailedChunks([]);
    setUploadDone(false);

    const chunks = [];
    for (let i = 0; i < totalItemsLocal; i += chunkSize) {
      chunks.push(mappedData.slice(i, i + chunkSize));
    }

    const chunksTotal = chunks.length;
    setTotalChunks(chunksTotal);

    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);

    try {
      for (let i = 0; i < chunksTotal; i++) {
        setCurrentChunkIndex(i);
        const chunk = chunks[i];

        const result = await sendChunkWithRetry(chunk, i, 3);

        if (!result.success) {
          setFailedChunks((prev) => [
            ...prev,
            {
              index: i,
              data: chunk,
              error: result.error?.message || "unknown",
            },
          ]);
        } else {
          setUploadedCount((prev) => {
            const newCount = prev + chunk.length;
            setUploadProgress(Math.round((newCount / totalItemsLocal) * 100));
            return newCount;
          });
        }

        // Force a tiny delay to let React render progress bar
        await new Promise((r) => setTimeout(r, 50));
      }

      setUploadProgress(100);
      setUploadDone(failedChunks.length === 0);
    } catch (err) {
      toast.error("Upload failed unexpectedly");
    } finally {
      setUploading(false);
      window.removeEventListener("beforeunload", beforeUnload);
    }
  };

  // Retry only failed chunks
  const retryFailed = async () => {
    if (!failedChunks.length) return;
    setUploading(true);

    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);

    try {
      const remaining = [];
      for (let i = 0; i < failedChunks.length; i++) {
        const item = failedChunks[i];
        const result = await sendChunkWithRetry(item.data, item.index, 3);
        if (!result.success) {
          remaining.push({
            ...item,
            error: result.error?.message || "unknown",
          });
        } else {
          setUploadedCount((prev) => prev + item.data.length);
        }
      }
      setFailedChunks(remaining);
      if (remaining.length === 0) {
        setUploadDone(true);
        setUploadProgress(100);
      }
    } finally {
      setUploading(false);
      window.removeEventListener("beforeunload", beforeUnload);
    }
  };

  // Draw mapping lines
  const drawLines = () => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    svg.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#0d6efd" />
        </marker>
      </defs>
    `;

    const parentRect = container.getBoundingClientRect();

    Object.entries(columnMapping).forEach(([field, colIndexStr]) => {
      if (colIndexStr === "" || colIndexStr === undefined) return;
      const colIndex = Number(colIndexStr);

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
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => drawLines());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnMapping, uploadedData, headerRowIndex]);

  useEffect(() => {
    const handler = () => drawLines();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived arrays
  const fileColumns = uploadedData[headerRowIndex] || [];
  const dataPreview = uploadedData.slice(
    headerRowIndex + 1,
    headerRowIndex + 11
  ); // top 10 data rows

  const onMapChange = (field, value) => {
    setColumnMapping((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={() => !uploading && toggle()}
      size="xl"
      backdrop="static"
    >
      <ModalHeader toggle={() => !uploading && toggle()}>
        Bulk Import Medicines
      </ModalHeader>
      <ModalBody>
        {/* File selector */}
        <div className="mb-3">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="form-control"
            disabled={uploading}
          />
        </div>

        {/* Header row selector */}
        {uploadedData.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Select Header Row</label>
            <select
              className="form-select"
              value={headerRowIndex}
              onChange={(e) => {
                setHeaderRowIndex(Number(e.target.value));
                setColumnMapping(emptyMapping());
              }}
              disabled={uploading}
            >
              {uploadedData.map((row, idx) => (
                <option key={idx} value={idx}>
                  Row {idx + 1}: {row.join(" | ")}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mapping inputs */}
        {fileColumns.length > 0 && (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            {dbFields.map((field) => {
              // used indices as strings
              const usedIndices = Object.values(columnMapping).filter(
                (v) => v !== "" && v !== undefined
              );
              // allow this field's currently selected index even if in usedIndices
              return (
                <div
                  key={field}
                  className="d-flex align-items-center mb-2"
                  style={{ gap: 12 }}
                >
                  <div style={{ width: "40%", fontWeight: 600 }}>{field}</div>
                  <div style={{ width: "60%" }}>
                    <select
                      className="form-select"
                      value={columnMapping[field] ?? ""}
                      onChange={(e) => onMapChange(field, e.target.value)}
                      disabled={uploading}
                    >
                      <option value="">-- Not Mapped --</option>
                      {fileColumns.map((col, idx) => {
                        const idxStr = String(idx);
                        const isUsed = usedIndices.includes(idxStr);
                        const allowed =
                          !isUsed || columnMapping[field] === idxStr;
                        if (!allowed) return null;
                        const label =
                          String(col).trim() === ""
                            ? `Column ${idx + 1} (empty)`
                            : String(col);
                        return (
                          <option key={idx} value={idxStr}>
                            {label}
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

        {/* Mapping summary */}
        {Object.values(columnMapping).some(
          (v) => v !== "" && v !== undefined
        ) && (
          <div
            ref={containerRef}
            style={{ position: "relative", padding: 12, marginBottom: 12 }}
          >
            <h5 style={{ marginBottom: 12 }}>Mapping Summary</h5>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dbFields.map((field) => (
                  <div
                    key={field}
                    ref={(el) => (dbRefs.current[field] = el)}
                    style={{
                      padding: "8px 12px",
                      minWidth: 140,
                      textAlign: "center",
                      backgroundColor: "#0d6efd",
                      color: "#fff",
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    {field}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fileColumns.map((col, idx) => (
                  <div
                    key={idx}
                    ref={(el) => (fileRefs.current[idx] = el)}
                    style={{
                      padding: "8px 12px",
                      minWidth: 140,
                      textAlign: "center",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    {String(col).trim() === ""
                      ? `Column ${idx + 1} (empty)`
                      : String(col)}
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
            />
          </div>
        )}

        {/* Data preview */}
        {dataPreview.length > 0 && (
          <div className="mt-3">
            <h5>Data Preview (Top {dataPreview.length} rows)</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    {fileColumns.map((col, idx) => (
                      <th key={idx}>
                        {String(col).trim() === "" ? `Column ${idx + 1}` : col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataPreview.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {fileColumns.map((_, cIdx) => (
                        <td key={cIdx}>{row[cIdx]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Progress & actions */}
        {uploading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.4)", // semi-transparent dark overlay
              backdropFilter: "blur(5px)", // blurry effect
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                padding: "2rem",
                borderRadius: "12px",
                maxWidth: "500px",
                width: "90%",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <div className="alert alert-warning text-center fw-bold">
                ⚠️ Upload in progress — please DO NOT refresh or close this
                page.
              </div>
              <div className="mb-2 text-center small text-muted">
                {uploadedCount} / {totalCount} items uploaded • Chunk{" "}
                {currentChunkIndex + 1} / {totalChunks}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <Typeloader />
                <Progress value={uploadProgress} animated style={{width:"100%"}}>
                  {uploadProgress}%
                </Progress>
              </div>
            </div>
          </div>
        )}

        {!uploading && uploadDone && (
          <div className="alert alert-success text-center fw-bold">
            ✅ Upload complete (uploaded {uploadedCount} items)
          </div>
        )}

        {!uploading && failedChunks.length > 0 && (
          <div className="alert alert-danger">
            <div>
              <strong>{failedChunks.length}</strong> chunk(s) failed.
            </div>
            <div className="mt-2 d-flex gap-2">
              <Button onClick={retryFailed}>Retry Failed</Button>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-end mt-3" style={{ gap: 8 }}>
          <Button
            variant="outline"
            onClick={() => {
              if (!uploading) {
                setUploadedData([]);
                setColumnMapping(emptyMapping());
                setHeaderRowIndex(0);
                setUploadDone(false);
                toggle();
              }
            }}
            disabled={uploading}
          >
            Close
          </Button>

          <Button
            onClick={() => handleImport({ chunkSize: 10 })}
            disabled={
              uploading ||
              !Object.values(columnMapping).some(
                (v) => v !== "" && v !== undefined
              )
            }
          >
            {uploading ? "Uploading..." : "Import Data"}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default BulkImportModal;
