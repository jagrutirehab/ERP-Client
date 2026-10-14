import { useRef } from "react";
import { toast } from "react-toastify";
import { FILE_ACCEPT, formatFileSize, validateNewFiles } from "../Helpers/Helper";

const AttachmentPicker = ({
    existingFiles = [],
    newFiles = [],
    onAddFiles,
    onRemoveExisting,
    onRemoveNew,
}) => {
    const inputRef = useRef(null);
    const total = existingFiles.length + newFiles.length;

    const handleChange = (e) => {
        const selected = Array.from(e.target.files || []);
        e.target.value = "";
        if (!selected.length) return;

        const { valid, errors } = validateNewFiles(selected);
        errors.forEach((message) => toast.error(message));

        const fresh = valid.filter(
            (file) => !newFiles.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)
        );
        if (fresh.length) onAddFiles(fresh);
    };

    return (
        <div className="mt-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase text-muted fw-semibold mb-0" style={{ fontSize: 11, letterSpacing: 1 }}>
                    Attachments <span className="text-lowercase fw-normal">(optional)</span>
                </h6>
                <button
                    type="button"
                    className="btn btn-soft-primary btn-sm d-flex align-items-center gap-1"
                    onClick={() => inputRef.current?.click()}
                >
                    <i className="ri-attachment-2" />
                    {total > 0 ? "Add More" : "Add Files"}
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept={FILE_ACCEPT}
                className="d-none"
                onChange={handleChange}
            />

            {total === 0 ? (
                <div className="text-center py-3 border rounded-3 text-muted" style={{ background: "#f8f9fa", fontSize: 12 }}>
                    No attachments. PDF, Word or images up to 20MB each.
                </div>
            ) : (
                <div className="border rounded-3 overflow-hidden">
                    {existingFiles.map((file, i) => (
                        <div key={file.path} className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom" style={{ fontSize: 13 }}>
                            <div className="overflow-hidden">
                                <div className="fw-medium">Attachment {i + 1} <span className="badge bg-soft-secondary text-secondary ms-1" style={{ fontSize: 10 }}>Saved</span></div>
                                <div className="text-muted text-truncate" style={{ fontSize: 11 }}>{file.originalName || file.name} · {formatFileSize(file.size || 0)}</div>
                            </div>
                            <button type="button" className="btn-close ms-2" aria-label="Remove" onClick={() => onRemoveExisting(file)} />
                        </div>
                    ))}
                    {newFiles.map((file, i) => (
                        <div key={`${file.name}-${file.size}-${file.lastModified}`} className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom" style={{ fontSize: 13 }}>
                            <div className="overflow-hidden">
                                <div className="fw-medium">Attachment {existingFiles.length + i + 1}</div>
                                <div className="text-muted text-truncate" style={{ fontSize: 11 }}>{file.name} · {formatFileSize(file.size)}</div>
                            </div>
                            <button type="button" className="btn-close ms-2" aria-label="Remove" onClick={() => onRemoveNew(i)} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttachmentPicker;
