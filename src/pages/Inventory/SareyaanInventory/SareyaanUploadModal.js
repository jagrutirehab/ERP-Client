import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  FormGroup,
  Progress,
} from "reactstrap";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  initSareyaanImport,
  processSareyaanImportChunk,
  uploadFile,
} from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

const CHUNK_SIZE = 300;

const norm = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");

const HEADER_MAP = [
  { field: "code", keys: ["code", "itemcode", "productcode"] },
  { field: "productName", keys: ["productname", "product", "itemname", "description"] },
  { field: "unit", keys: ["unit"] },
  { field: "currentStock", keys: ["currentstock", "stock", "qty", "quantity"] },
  { field: "costPrice", keys: ["costprice", "cost"] },
  { field: "value", keys: ["value", "stockvalue"] },
  { field: "mrp", keys: ["mrp"] },
  { field: "purchasePrice", keys: ["purchaseprice", "purchase"] },
  { field: "salesPrice", keys: ["salesprice", "sellingprice", "saleprice", "selling"] },
  { field: "company", keys: ["company"] },
  { field: "manufacturer", keys: ["manufacturer", "mfg", "mfr"] },
  { field: "rackNo", keys: ["rackno", "rack"] },
];

const REQUIRED_FIELDS = ["code", "productName", "currentStock"];

const mapHeadersToFields = (headers) => {
  const mapping = {};
  const usedFields = new Set();
  for (const header of headers) {
    const n = norm(header);
    if (!n) continue;
    for (const { field, keys } of HEADER_MAP) {
      if (usedFields.has(field)) continue;
      if (keys.some((k) => n.includes(k))) {
        mapping[header] = field;
        usedFields.add(field);
        break;
      }
    }
  }
  return mapping;
};

const SareyaanUploadModal = ({ isOpen, toggle, onUploaded }) => {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStage, setUploadStage] = useState(""); // "uploading-file" | "importing"
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [displayedDone, setDisplayedDone] = useState(0);
  const [result, setResult] = useState(null);
  const handleAuthError = useAuthError();

  const targetRef = useRef(0);
  const totalRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      setExcelData([]);
      setColumns([]);
      setHeaders([]);
      setSelectedFile(null);
      setUploadStage("");
      setUploading(false);
      setUploadStage("");
      setProgress({ done: 0, total: 0 });
      setDisplayedDone(0);
      setResult(null);
      targetRef.current = 0;
      totalRef.current = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!uploading) return undefined;
    let raf;
    let last = performance.now();
    const ratePerMs = 0.4;
    const tick = (now) => {
      const dt = now - last;
      last = now;
      setDisplayedDone((prev) => {
        const target = targetRef.current;
        if (prev >= target) return prev;
        return Math.min(target, prev + dt * ratePerMs);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [uploading]);

  useEffect(() => {
    if (!uploading) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue =
        "An import is still uploading. Leaving now will stop it. Are you sure?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [uploading]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear any previous preview/state before processing the new file so the
    // UI never shows stale data if the new file fails validation.
    setExcelData([]);
    setColumns([]);
    setHeaders([]);
    setSelectedFile(null);
    setResult(null);

    const reader = new FileReader();
    reader.onerror = () => {
      toast.error("Could not read the selected file. Is it a valid Excel file?");
      e.target.value = "";
    };
    reader.onload = (evt) => {
      let rows;
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      } catch (parseErr) {
        toast.error(
          "Failed to parse the Excel file. Make sure it is a valid .xlsx / .xls workbook."
        );
        e.target.value = "";
        return;
      }

      if (!rows || rows.length < 4) {
        toast.error(
          "The sheet doesn't have enough rows — expected headers on rows 3-4 and data from row 5 onward."
        );
        setExcelData([]);
        setColumns([]);
        setHeaders([]);
        e.target.value = "";
        return;
      }

      const headerRow3 = rows[2] || [];
      const headerRow4 = rows[3] || [];
      const combinedHeaders = [];
      const maxLen = Math.max(headerRow3.length, headerRow4.length);

      for (let i = 0; i < maxLen; i++) {
        const h3 = (headerRow3[i] || "").toString().trim();
        const h4 = (headerRow4[i] || "").toString().trim();
        let header = h4;
        if (h3 && h4) header = `${h3} - ${h4}`;
        else if (h3) header = h3;
        combinedHeaders.push(header || `Column ${i + 1}`);
      }

      const generatedColumns = combinedHeaders.map((key) => ({
        name: key,
        selector: (row) => row[key],
        wrap: true,
        minWidth: "120px",
      }));

      const data = [];
      for (let i = 4; i < rows.length; i++) {
        const rowArray = rows[i];
        if (!rowArray || rowArray.length === 0) continue;
        const isEmpty = rowArray.every(
          (cell) => cell === undefined || cell === null || cell === ""
        );
        if (isEmpty) continue;
        const rowObj = { __rowNumber: i + 1 };
        combinedHeaders.forEach((header, index) => {
          rowObj[header] = rowArray[index];
        });
        data.push(rowObj);
      }

      const mapping = mapHeadersToFields(combinedHeaders);
      const detectedFields = new Set(Object.values(mapping));
      const missing = REQUIRED_FIELDS.filter((f) => !detectedFields.has(f));
      if (missing.length) {
        toast.error(
          `Missing required column(s): ${missing.join(", ")}. Please check the sheet headers.`
        );
        setColumns([]);
        setExcelData([]);
        setHeaders([]);
        e.target.value = "";
        return;
      }

      setColumns(generatedColumns);
      setExcelData(data);
      setHeaders(combinedHeaders);
      setSelectedFile(file);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (!excelData.length) return;

    const mapping = mapHeadersToFields(headers);
    const missing = REQUIRED_FIELDS.filter(
      (f) => !Object.values(mapping).includes(f)
    );
    if (missing.length) {
      toast.error(
        `Could not detect required column(s): ${missing.join(", ")}. ` +
        `Check the sheet headers.`
      );
      return;
    }

    const apiRows = excelData.map((row) => {
      const out = { rowNumber: row.__rowNumber };
      for (const [header, field] of Object.entries(mapping)) {
        out[field] = row[header];
      }
      return out;
    });

    setUploading(true);
    setUploadStage("uploading-file");
    setResult(null);
    setProgress({ done: 0, total: apiRows.length });
    setDisplayedDone(0);
    targetRef.current = 0;
    totalRef.current = apiRows.length;

    try {
      // 1) Upload the original Excel to S3 under a readable name.
      const ext = (selectedFile?.name?.split(".").pop() || "xlsx").toLowerCase();
      const stamp = format(new Date(), "dd-MMM-yyyy");
      const renamedName = `sareyaan_stock_${stamp}.${ext}`;
      const renamedFile = selectedFile
        ? new File([selectedFile], renamedName, {
          type:
            selectedFile.type ||
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        : null;

      let fileUrl = "";
      if (renamedFile) {
        const fd = new FormData();
        fd.append("file", renamedFile);
        fd.append("uploadPath", "SAREYAAN_IMPORT");
        const uploadRes = await uploadFile(fd);
        fileUrl = uploadRes?.url || uploadRes?.data?.url || "";
      }
      if (!fileUrl) {
        throw new Error("Failed to upload Excel file to storage");
      }

      // 2) Initialize the import record with the S3 URL.
      setUploadStage("importing");
      const initRes = await initSareyaanImport({
        fileUrl,
        totalRows: apiRows.length,
      });
      const importId = initRes?.data?.importId;
      if (!importId) throw new Error("Failed to initialize import");

      let totalSuccess = 0;
      let totalFailed = 0;

      for (let i = 0; i < apiRows.length; i += CHUNK_SIZE) {
        const chunk = apiRows.slice(i, i + CHUNK_SIZE);
        const isLast = i + CHUNK_SIZE >= apiRows.length;

        targetRef.current = Math.min(
          i + Math.floor(chunk.length * 0.92),
          apiRows.length
        );

        const res = await processSareyaanImportChunk(importId, {
          rows: chunk,
          isLast,
        });
        const data = res?.data || {};
        totalSuccess += Number(data.chunkSuccess) || 0;
        totalFailed += Number(data.chunkFailed) || 0;

        const completed = Math.min(i + chunk.length, apiRows.length);
        setProgress({ done: completed, total: apiRows.length });
        // Snap target forward to the confirmed completion point.
        targetRef.current = completed;
      }

      setResult({ importId, success: totalSuccess, failed: totalFailed });
      toast.success(
        `Import complete — ${totalSuccess} succeeded, ${totalFailed} failed`
      );
      setUploading(false);
      setUploadStage("");
      if (typeof onUploaded === "function") onUploaded(importId);
      return;
    } catch (err) {
      if (!handleAuthError(err)) {
        const msg =
          err?.response?.data?.message || err?.message || "Upload failed";
        toast.error(msg);
      }
      setUploading(false);
      setUploadStage("");
    }
  };

  const total = progress.total || totalRef.current || 0;
  const visualDone = uploading ? displayedDone : progress.done;
  const pct = total > 0 ? Math.min(100, Math.round((visualDone / total) * 100)) : 0;
  const visualDoneRounded = Math.min(total, Math.round(visualDone));

  return (
    <Modal isOpen={isOpen} toggle={uploading ? undefined : toggle} size="xl" backdrop="static">
      <ModalHeader toggle={uploading ? undefined : toggle}>
        New Sareyaan Inventory Import
      </ModalHeader>
      <ModalBody>
        <FormGroup className="mb-4">
          <Label for="sareyaan-excel">Select Sareyaan Inventory Excel File</Label>
          <Input
            type="file"
            id="sareyaan-excel"
            name="sareyaan-excel"
            accept=".xlsx, .xls"
            onClick={(e) => {
              // Reset value so selecting the same file again still fires onChange.
              e.target.value = "";
            }}
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </FormGroup>

        {uploading && uploadStage === "uploading-file" && (
          <div className="mb-3 text-muted">
            Uploading file to storage, please wait…
          </div>
        )}

        {uploading && uploadStage === "importing" && (
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span>
                Importing {visualDoneRounded} / {total} rows
              </span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} animated striped color="primary" />
          </div>
        )}

        {result && !uploading && (
          <div className="mb-3 alert alert-info">
            Import #{result.importId}: {result.success} succeeded,{" "}
            {result.failed} failed.
          </div>
        )}

        {excelData.length > 0 && (
          <div className="mt-4">
            <h6 className="display-6 fs-5 mb-3">
              Preview (Top 10 of {excelData.length} rows)
            </h6>
            <DataTable
              columns={columns}
              data={excelData.slice(0, 10)}
              highlightOnHover
              fixedHeader
              fixedHeaderScrollHeight="300px"
              customStyles={{
                headCells: {
                  style: {
                    fontWeight: "bold",
                    backgroundColor: "#f3f3f9",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                  },
                },
                cells: {
                  style: {
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                  },
                },
              }}
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter className="d-flex justify-content-between align-items-center">
        <small className="text-muted me-3" style={{ flex: 1 }}>
          <i>Note: Please do not close, refresh, or navigate away from this
            page while the upload is in progress.</i>
        </small>
        <Button color="secondary" onClick={toggle} disabled={uploading} className="text-white">
          {result ? "Close" : "Cancel"}
        </Button>
        <Button
          color="primary"
          className="text-white"
          onClick={handleSubmit}
          disabled={excelData.length === 0 || uploading}
        >
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

SareyaanUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onUploaded: PropTypes.func,
};

export default SareyaanUploadModal;
