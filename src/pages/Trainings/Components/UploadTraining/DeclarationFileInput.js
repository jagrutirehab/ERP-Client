import React, { useState } from "react";
import { toast } from "react-toastify";
import { formatFileSize } from "../../Helpers/uploadTrainingForm";
import { DECLARATION_ACCEPT, detectFormat, validateDeclarationFile } from "../../Helpers/declaration";
import PlacementModal from "../Declaration/PlacementModal";

const DeclarationFileInput = ({ file, placements, onChange, label = "Declaration form (optional)", compact = false }) => {
  const [placing, setPlacing] = useState(false);

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const error = validateDeclarationFile(selected);
    if (error) {
      toast.error(error);
      e.target.value = "";
      return;
    }

    onChange({ file: selected, placements: null });
    setPlacing(true);
  };

  return (
    <div className="mb-3" data-testid="declaration-input">
      <label className="form-label">{label}</label>
      <input
        key={file ? "has-file" : "no-file"}
        type="file"
        className="form-control"
        accept={DECLARATION_ACCEPT}
        onChange={handleChange}
      />
      {!compact && (
        <small className="text-muted d-block mt-1">
          PDF or Word (.docx), up to 20MB. Employee name, ID, center manager, designation and department are filled in automatically where the form has labelled empty cells. You only place the signature. The file cannot be changed after the training is created.
        </small>
      )}
      {file && (
        <div className="mt-2">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <small className="text-success">
              ✓ {file.name} ({formatFileSize(file.size)}) · {detectFormat(file.name)?.toUpperCase()}
            </small>
            <button type="button" className="btn btn-link btn-sm p-0 text-danger" onClick={() => onChange({ file: null, placements: null })}>
              Remove
            </button>
          </div>
          {placements ? (
            <div className="d-flex align-items-center gap-2 mt-1">
              <small className="text-success" data-testid="box-placed">
                ✓ Fields placed
              </small>
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setPlacing(true)}>
                Change placement
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2 mt-1">
              <small className="text-danger" data-testid="box-missing">
                Place the signature to continue
              </small>
              <button type="button" className="btn btn-outline-primary btn-sm py-0" onClick={() => setPlacing(true)}>
                Place fields
              </button>
            </div>
          )}
        </div>
      )}
      <PlacementModal
        isOpen={placing && !!file}
        file={file}
        onConfirm={(confirmed) => {
          onChange({ file, placements: confirmed });
          setPlacing(false);
        }}
        onCancel={() => setPlacing(false)}
      />
    </div>
  );
};

export default DeclarationFileInput;
