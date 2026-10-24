import React from "react";
import { toast } from "react-toastify";
import {
  OUTER_FILE_ACCEPT,
  OUTER_FILE_ERROR,
  formatFileSize,
  isAllowedOuterFile,
} from "../../Helpers/uploadTrainingForm";

const OuterFileInput = ({ file, onChange, isSubmitted }) => {
  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!isAllowedOuterFile(selected)) {
      toast.error(OUTER_FILE_ERROR);
      e.target.value = "";
      return;
    }

    onChange(selected);
  };

  return (
    <div className="mb-3">
      <label className="form-label">File *</label>
      <input
        key={file ? "has-file" : "no-file"}
        type="file"
        className="form-control"
        accept={OUTER_FILE_ACCEPT}
        onChange={handleChange}
      />
      {file ? (
        <small className="d-block mt-2 text-success">
          ✓ {file.name} ({formatFileSize(file.size)})
        </small>
      ) : isSubmitted ? (
        <small className="d-block mt-2 text-danger">No file selected</small>
      ) : null}
    </div>
  );
};

export default OuterFileInput;
