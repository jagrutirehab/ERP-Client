import React, { useState } from "react";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { errText, saveBlob, useBusy } from "./assetUi";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_ERRORS_SHOWN = 200;

// Download a template, choose an .xlsx file, upload it. If the server refuses the file, nothing
// was saved and every bad row is listed (row, column, message).
const ExcelUploadPanel = ({ title, hint, templateFile, downloadTemplate, upload, onUploaded, canUpload = true }) => {
  const handleAuthError = useAuthError();
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [problem, setProblem] = useState(null); // { message, errors }
  const [downloading, runDownload] = useBusy();
  const [uploading, runUpload] = useBusy();

  const handleDownload = () =>
    runDownload(async () => {
      try {
        const res = await downloadTemplate();
        saveBlob(res, templateFile);
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error, "The template could not be downloaded."));
      }
    });

  const handleUpload = () =>
    runUpload(async () => {
      setProblem(null);
      if (!file) return toast.error("Please choose an Excel (.xlsx) file to upload");
      if (!/\.xlsx$/i.test(file.name)) return toast.error("Only .xlsx files are accepted");
      if (file.size > MAX_BYTES) return toast.error("The file is too big. The limit is 5 MB");
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await upload(form);
        toast.success(res?.message || "File uploaded");
        setFile(null);
        setFileKey((k) => k + 1);
        if (onUploaded) onUploaded(res);
      } catch (error) {
        if (handleAuthError(error)) return;
        const message = errText(error, "The file could not be uploaded.");
        setProblem({ message, errors: Array.isArray(error?.errors) ? error.errors : [] });
        toast.error(message);
      }
    });

  return (
    <div className="uom-table-card p-4">
      <h6 className="fw-semibold mb-1">{title}</h6>
      {hint && <p className="text-muted small mb-3">{hint}</p>}

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <Button color="light" onClick={handleDownload} disabled={downloading}>
          <i className="bx bx-download me-1"></i> {downloading ? "Downloading..." : "Download template"}
        </Button>
        {canUpload && (
          <>
            <Input
              key={fileKey}
              type="file"
              accept=".xlsx"
              style={{ maxWidth: 320 }}
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setProblem(null);
              }}
            />
            <Button color="primary" onClick={handleUpload} disabled={uploading || !file}>
              {uploading ? "Uploading..." : "Upload file"}
            </Button>
          </>
        )}
      </div>

      {problem && (
        <div style={{ border: "1px solid #fecdca", background: "#fef3f2", borderRadius: 10 }} className="p-3">
          <div className="fw-semibold text-danger mb-2">{problem.message}</div>
          {problem.errors.length > 0 && (
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
              <table className="table table-sm mb-0" style={{ background: "#fff" }}>
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Row</th>
                    <th style={{ width: 180 }}>Column</th>
                    <th>Problem</th>
                  </tr>
                </thead>
                <tbody>
                  {problem.errors.slice(0, MAX_ERRORS_SHOWN).map((e, i) => (
                    <tr key={`${e.row}-${e.column}-${i}`}>
                      <td>{e.row || "—"}</td>
                      <td>{e.column || "—"}</td>
                      <td>{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {problem.errors.length > MAX_ERRORS_SHOWN && (
                <div className="text-muted small mt-2">…and {problem.errors.length - MAX_ERRORS_SHOWN} more</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelUploadPanel;
