import React from "react";
import { toast } from "react-toastify";
import {
  MAX_FILE_SIZE,
  formatFileSize,
  newId,
} from "../../Helpers/uploadTrainingForm";

const isSameFile = (a, b) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

const ChapterFileInput = ({ files, onChange }) => {
  const handleChange = (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";

    const accepted = [];
    selected.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: file must be 500MB or smaller`);
        return;
      }
      const duplicate =
        files.some((item) => isSameFile(item.file, file)) ||
        accepted.some((item) => isSameFile(item.file, file));
      if (!duplicate) accepted.push({ id: newId(), file });
    });

    if (accepted.length > 0) onChange([...files, ...accepted]);
  };

  return (
    <div className="mb-3">
      <label className="form-label">Files</label>
      <input
        type="file"
        multiple
        className="form-control"
        onChange={handleChange}
      />
      <small className="text-muted d-block mt-1">
        Any format (PDF, PPT, Word, images, …), up to 500MB each. Learners must
        open every file before moving on.
      </small>
      {files.length > 0 && (
        <div className="border rounded mt-2">
          {files.map((item) => (
            <div
              key={item.id}
              className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
              style={{ fontSize: 13 }}
            >
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <i className="ri-file-line" />
                <span className="text-truncate">{item.file.name}</span>
                <span className="text-muted flex-shrink-0">
                  {formatFileSize(item.file.size)}
                </span>
              </div>
              <button
                type="button"
                className="btn-close ms-2"
                aria-label="Remove"
                onClick={() =>
                  onChange(files.filter((entry) => entry.id !== item.id))
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChapterFileInput;
