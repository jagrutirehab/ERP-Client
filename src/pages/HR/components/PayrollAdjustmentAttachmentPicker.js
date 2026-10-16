import { useRef } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

const formatFileSize = (bytes) =>
    bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const sameFile = (a, b) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

const PayrollAdjustmentAttachmentPicker = ({
    existingFiles = [],
    newFiles = [],
    onAddFiles,
    onRemoveExisting,
    onRemoveNew,
    disabled = false,
}) => {
    const inputRef = useRef(null);
    const total = existingFiles.length + newFiles.length;

    const handleChange = (e) => {
        const selected = Array.from(e.target.files || []);
        e.target.value = "";
        if (!selected.length) return;

        const valid = [];
        selected.forEach((file) => {
            if (!SUPPORTED_TYPES.includes(file.type)) {
                toast.error(`${file.name}: only PDF, JPG and PNG files are allowed`);
            } else if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name}: file must be 10MB or smaller`);
            } else {
                valid.push(file);
            }
        });

        const fresh = valid.filter((file) => !newFiles.some((f) => sameFile(f, file)));
        if (fresh.length) onAddFiles(fresh);
    };

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: 11, letterSpacing: 1 }}>
                    Attachments <span className="text-lowercase fw-normal">(optional)</span>
                </span>
                <button
                    type="button"
                    className="btn btn-soft-primary btn-sm d-flex align-items-center gap-1"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                >
                    <i className="ri-attachment-2" />
                    {total > 0 ? "Add More" : "Add Files"}
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                className="d-none"
                onChange={handleChange}
            />

            {total === 0 ? (
                <div className="text-center py-3 border rounded-3 text-muted" style={{ background: "#f8f9fa", fontSize: 12 }}>
                    No attachments. PDF, JPG or PNG up to 10MB each.
                </div>
            ) : (
                <div className="border rounded-3 overflow-hidden">
                    {existingFiles.map((file, i) => (
                        <div key={file.path} className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom" style={{ fontSize: 13 }}>
                            <div className="overflow-hidden">
                                <div className="fw-medium">
                                    Attachment {i + 1}
                                    <span className="badge bg-soft-secondary text-secondary ms-1" style={{ fontSize: 10 }}>Saved</span>
                                </div>
                                <div className="text-muted text-truncate" style={{ fontSize: 11 }}>
                                    {file.originalName || file.name} · {formatFileSize(file.size || 0)}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-close ms-2"
                                aria-label="Remove"
                                disabled={disabled}
                                onClick={() => onRemoveExisting(file)}
                            />
                        </div>
                    ))}
                    {newFiles.map((file, i) => (
                        <div key={`${file.name}-${file.size}-${file.lastModified}`} className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom" style={{ fontSize: 13 }}>
                            <div className="overflow-hidden">
                                <div className="fw-medium">Attachment {existingFiles.length + i + 1}</div>
                                <div className="text-muted text-truncate" style={{ fontSize: 11 }}>
                                    {file.name} · {formatFileSize(file.size)}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-close ms-2"
                                aria-label="Remove"
                                disabled={disabled}
                                onClick={() => onRemoveNew(i)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

PayrollAdjustmentAttachmentPicker.propTypes = {
    existingFiles: PropTypes.array,
    newFiles: PropTypes.array,
    onAddFiles: PropTypes.func.isRequired,
    onRemoveExisting: PropTypes.func,
    onRemoveNew: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default PayrollAdjustmentAttachmentPicker;
