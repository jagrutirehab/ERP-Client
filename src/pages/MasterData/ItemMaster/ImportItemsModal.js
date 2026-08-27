import React, { useState } from "react";
import { Modal, ModalBody, Button } from "reactstrap";
import { toast } from "react-toastify";
import { previewItemImport, confirmItemImport } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

const ImportItemsModal = ({ isOpen, onClose, onImported }) => {
  const handleAuthError = useAuthError();
  const [file, setFile] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setFile(null);
    setPreview(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setPreview(null);
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error("Please choose an Excel file first");
      return;
    }
    setPreviewing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await previewItemImport(formData);
      setPreview(res?.data || null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Preview failed");
      }
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;
    const validRows = preview.rows
      .filter((r) => r.status === "valid")
      .map((r) => r.data);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    setImporting(true);
    try {
      const res = await confirmItemImport(validRows);
      const { created, skipped, failed } = res?.data || {};
      toast.success(`Imported ${created} items (skipped ${skipped}, failed ${failed})`);
      handleClose();
      onImported?.();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Import failed");
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered size="lg">
      <ModalBody className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h5 className="mb-1 fw-semibold">Import Items</h5>
            <p className="text-muted mb-0 small">
              Upload an Excel file (.xlsx). Required columns: Item Code, Short Description.
            </p>
          </div>
          <button type="button" className="im-close-btn" onClick={handleClose}>
            <i className="bx bx-x"></i>
          </button>
        </div>

        <div className="mb-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>

        <Button color="primary" outline onClick={handlePreview} disabled={previewing || !file}>
          {previewing ? "Checking..." : "Preview"}
        </Button>

        {preview && (
          <div className="mt-4">
            <div className="d-flex gap-3 mb-3">
              <span className="im-status-pill active">
                {preview.validCount} ready to import
              </span>
              {preview.errorCount > 0 && (
                <span className="im-status-pill inactive">
                  {preview.errorCount} with errors (will be skipped)
                </span>
              )}
            </div>

            <div style={{ maxHeight: 320, overflowY: "auto" }} className="im-table-card">
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Item Code</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r) => (
                    <tr key={r.rowNum}>
                      <td>{r.rowNum}</td>
                      <td>{r.data.itemCode || "—"}</td>
                      <td>{r.data.itemName || "—"}</td>
                      <td>
                        {r.status === "valid" ? (
                          <span className="text-success small fw-semibold">Valid</span>
                        ) : (
                          <span className="text-danger small fw-semibold">Error</span>
                        )}
                      </td>
                      <td className="small text-muted">
                        {r.errors.concat(r.notes).join("; ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="im-footer-bar d-flex justify-content-end gap-2">
              <Button color="light" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleImport}
                disabled={importing || preview.validCount === 0}
              >
                {importing ? "Importing..." : `Import ${preview.validCount} items`}
              </Button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ImportItemsModal;