import React, { useRef } from "react";
import PropTypes from "prop-types";
import { UploadCloud, X } from "lucide-react";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

const PaymentModeEvidence = ({ inputId, file, existingUrl, onSelect, onRemove }) => {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) return;
    if (selected.size > MAX_SIZE) return;
    onSelect(selected);
  };

  const openPicker = () => inputRef.current?.click();

  const hiddenInput = (
    <input
      id={inputId}
      ref={inputRef}
      type="file"
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
  );

  if (file) {
    return (
      <div className="d-inline-flex align-items-center gap-1" style={{ lineHeight: 1 }}>
        {hiddenInput}
        <span
          className="small text-truncate"
          style={{ maxWidth: "90px", display: "inline-block", lineHeight: "normal" }}
          title={file.name}
        >
          {file.name}
        </span>
        <Wrapping onClick={onRemove}>
          <X size={14} />
        </Wrapping>
      </div>
    );
  }

  if (existingUrl) {
    return (
      <div className="d-inline-flex align-items-center gap-2" style={{ lineHeight: 1 }}>
        {hiddenInput}
        <a
          href={existingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="small d-inline-flex align-items-center"
        >
          View
        </a>
        <Wrapping onClick={openPicker} title="Replace">
          <UploadCloud size={14} />
        </Wrapping>
      </div>
    );
  }

  return (
    <div
      role="button"
      onClick={openPicker}
      className="d-inline-flex align-items-center gap-1 text-primary"
      style={{ cursor: "pointer", lineHeight: 1 }}
    >
      {hiddenInput}
      <UploadCloud size={20} />
      <span className="small" style={{ whiteSpace: "nowrap" }}>
        Upload evidence screenshot
      </span>
    </div>
  );
};

const Wrapping = ({ onClick, title, children }) => (
  <span
    role="button"
    onClick={onClick}
    title={title}
    className="text-muted d-inline-flex align-items-center"
    style={{ cursor: "pointer", lineHeight: 0 }}
  >
    {children}
  </span>
);

PaymentModeEvidence.propTypes = {
  inputId: PropTypes.string.isRequired,
  file: PropTypes.object,
  existingUrl: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default PaymentModeEvidence;
