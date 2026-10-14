import React, { useState } from "react";
import { toast } from "react-toastify";
import PreviewFile from "../../../../Components/Common/PreviewFile";
import { markChapterFileOpened } from "../../../../helpers/backend_helper";
import { formatFileSize } from "../../Helpers/uploadTrainingForm";
import { getErrorMessage } from "../../Helpers/learnHelpers";

const ChapterFiles = ({ trainingId, chapterId, files, onLearnChange }) => {
  const [previewFile, setPreviewFile] = useState(null);

  const handleOpen = async (file) => {
    setPreviewFile(file);
    if (file.opened) return;

    try {
      const response = await markChapterFileOpened(trainingId, file._id, {
        chapterId,
      });
      if (response?.data) onLearnChange(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not record that this file was opened"));
    }
  };

  return (
    <>
      <div className="border rounded">
        {files.map((file) => (
          <div
            key={file._id}
            className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
            style={{ fontSize: 13 }}
          >
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <i className="ri-file-line" />
              <span className="text-truncate">{file.originalName || file.name}</span>
              {file.size > 0 && (
                <span className="text-muted flex-shrink-0">
                  {formatFileSize(file.size)}
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              {file.opened ? (
                <span className="badge bg-success">Opened</span>
              ) : (
                <span className="badge bg-soft-danger text-danger">Not opened</span>
              )}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleOpen(file)}
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>

      <PreviewFile
        title={previewFile?.originalName || previewFile?.name || "File"}
        file={previewFile}
        isOpen={!!previewFile}
        toggle={() => setPreviewFile(null)}
        allowDownload
      />
    </>
  );
};

export default ChapterFiles;
