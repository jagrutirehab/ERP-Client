import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Button, Label } from "reactstrap";
import { Camera, Paperclip, X } from "lucide-react";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

const PaymentModeEvidence = ({
  inputId,
  files,
  existingUrls,
  onAddFiles,
  onRemoveFile,
  labelClassName,
  required,
}) => {
  const inputRef = useRef(null);
  const cameraRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 1366px)");
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

  const handleCameraCapture = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_SIZE) return;

    onAddFiles([file]);
  };

  const openPicker = () => inputRef.current?.click();
  const openCamera = () => cameraRef.current?.click();

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

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        style={{
          position: "absolute",
          opacity: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      />

      <Label className={labelClassName}>
        Upload Evidence Screenshot
        {required && <span className="text-danger"> *</span>}
      </Label>

      <div className="d-flex flex-wrap align-items-center gap-2">
        <Button
          type="button"
          outline
          size="sm"
          // Red until something is attached, so the missing one is obvious in
          // a row of otherwise-complete fields.
          color={required ? "danger" : "primary"}
          onClick={openPicker}
          className="d-inline-flex align-items-center gap-1"
        >
          <Paperclip size={14} />
          Upload
        </Button>

        {isMobile && (
          <Button
            type="button"
            outline
            size="sm"
            color={required ? "danger" : "primary"}
            onClick={openCamera}
            className="d-inline-flex align-items-center gap-1"
          >
            <Camera size={14} />
            Take Photo
          </Button>
        )}

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
  // True when this row still needs proof attached before the bill can save.
  required: PropTypes.bool,
};

export default PaymentModeEvidence;
