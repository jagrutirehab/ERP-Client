import React, { useRef } from "react";
import { Button } from "reactstrap";
import { toast } from "react-toastify";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ESICAttachmentPicker = ({
  existingFiles = [],
  newFiles = [],
  onAddFiles,
  onRemoveExisting,
  onRemoveNew,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const total = existingFiles.length + newFiles.length;

  const handleChange = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";

    const accepted = [];
    picked.forEach((file) => {
      if (!SUPPORTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported file type`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: file exceeds 10MB`);
        return;
      }
      const isDuplicate = [...newFiles, ...accepted].some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified,
      );
      if (isDuplicate) return;
      accepted.push(file);
    });

    if (accepted.length > 0) {
      onAddFiles(accepted);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={SUPPORTED_TYPES.join(",")}
        className="d-none"
        onChange={handleChange}
        disabled={disabled}
      />
      <Button
        type="button"
        color="light"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        <i className="bx bx-upload me-1" />
        {total > 0 ? "Add More Files" : "Add Files"}
      </Button>

      {total === 0 && (
        <p className="text-muted small mt-2 mb-0">No files attached yet.</p>
      )}

      {total > 0 && (
        <ul className="list-unstyled mt-2 mb-0">
          {existingFiles.map((file) => (
            <li
              key={file.path}
              className="d-flex align-items-center justify-content-between border rounded px-2 py-1 mb-1"
            >
              <span className="text-truncate" style={{ maxWidth: "70%" }}>
                {file.originalName || file.name}
                <span className="badge bg-soft-secondary text-secondary ms-2">
                  Saved
                </span>
              </span>
              <button
                type="button"
                className="btn-close"
                aria-label="Remove file"
                disabled={disabled}
                onClick={() => onRemoveExisting(file)}
              />
            </li>
          ))}
          {newFiles.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="d-flex align-items-center justify-content-between border rounded px-2 py-1 mb-1"
            >
              <span className="text-truncate" style={{ maxWidth: "70%" }}>
                {file.name}{" "}
                <span className="text-muted small">
                  ({formatFileSize(file.size)})
                </span>
              </span>
              <button
                type="button"
                className="btn-close"
                aria-label="Remove file"
                disabled={disabled}
                onClick={() => onRemoveNew(index)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ESICAttachmentPicker;
