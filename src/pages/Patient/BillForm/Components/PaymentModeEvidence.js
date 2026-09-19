import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Button, Label } from "reactstrap";
import { Paperclip, X } from "lucide-react";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

const PaymentModeEvidence = ({
  inputId,
  files,
  existingUrls,
  onAddFiles,
  onRemoveFile,
  labelClassName,
}) => {
  const inputRef = useRef(null);
  const fileList = Array.isArray(files) ? files : [];
  const urlList = Array.isArray(existingUrls) ? existingUrls : [];

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    if (!selected.length) return;

    const validFiles = selected.filter(
      (f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SIZE,
    );
    if (!validFiles.length) return;

    onAddFiles(validFiles);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    // Capped width + wrap keeps the button, existing-evidence links and picked-file
    // rows from overflowing the row on narrow/mobile screens — they stack instead.
    <div style={{ maxWidth: "170px" }}>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.pdf"
        onChange={handleFileChange}
        style={{
          position: "absolute",
          opacity: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      />

      <Label className={labelClassName}>Upload Evidence Screenshot</Label>

      <div className="d-flex flex-wrap align-items-center gap-2">
        <Button
          type="button"
          outline
          size="sm"
          color="primary"
          onClick={openPicker}
          className="d-inline-flex align-items-center gap-1"
        >
          <Paperclip size={14} />
          Upload
        </Button>

        {urlList.map((url, i) => (
          <a
            key={`existing-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="small d-inline-flex align-items-center"
          >
            View{urlList.length > 1 ? ` ${i + 1}` : ""}
          </a>
        ))}
      </div>

      {fileList.length > 0 && (
        <div className="mt-1">
          {fileList.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="d-flex align-items-center gap-1"
            >
              <span
                className="small text-truncate"
                style={{ maxWidth: "110px", display: "inline-block" }}
                title={file.name}
              >
                {file.name}
              </span>
              <span
                role="button"
                onClick={() => onRemoveFile(i)}
                className="text-muted"
                style={{ cursor: "pointer", lineHeight: 0 }}
              >
                <X size={14} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

PaymentModeEvidence.propTypes = {
  inputId: PropTypes.string.isRequired,
  files: PropTypes.array,
  existingUrls: PropTypes.array,
  onAddFiles: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  labelClassName: PropTypes.string,
};

export default PaymentModeEvidence;
