import { Eye, FileText, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { Badge, Button, Input, Label } from "reactstrap";
import PreviewFile from "../../../Components/Common/PreviewFile";

const FileUpload = ({ files, setFiles, multiple = true, maxFiles = 10 }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  const fileList = Array.isArray(files) ? files : [];

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);

    if (!selected.length) return;

    const validFiles = selected.filter(file =>
      ["image/png", "image/jpeg", "application/pdf"].includes(file.type)
    );

    if (!validFiles.length) return;

    let finalFiles;

    if (multiple) {
      const merged = [...fileList, ...validFiles];
      const unique = merged.filter(
        (f, i, arr) => arr.findIndex(x => x.name === f.name) === i
      );
      finalFiles = unique.slice(0, maxFiles);
    } else {
      // 🔥 SINGLE MODE → override
      finalFiles = [validFiles[0]];
    }

    setFiles(finalFiles);
    e.target.value = "";
  };

  const handlePreview = (file) => {
    const fileUrl = URL.createObjectURL(file);
    setPreviewFile({
      url: fileUrl,
      type: file.type,
      name: file.name,
    });
    setIsPreviewOpen(true);
  };

  const handleRemoveFile = (index = 0) => {
    if (multiple) {
      setFiles(fileList.filter((_, i) => i !== index));
    } else {
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
      setPreviewFile(null);
    }
  };

  return (
    <>
      <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-white">
        <div className="mb-3">
          <FileText className="icon text-muted" size={48} />
        </div>
        <div className="mb-2">
          <Label htmlFor="fileInput" className="text-primary cursor-pointer mb-0">
            <Upload size={14} className="me-2" />
            {multiple ? "Upload files" : "Upload file"}
          </Label>
          <Input
            id="fileInput"
            name="fileInput"
            type="file"
            className="d-none"
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.pdf"
            ref={fileInputRef}
            multiple={multiple}
          />
        </div>
        {multiple && <p className="small text-muted mb-0">
          Upload up to 10 supported files. Max 100 MB per file.
        </p>}

        {fileList.length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">
                {fileList.length} file{fileList.length !== 1 ? "s" : ""} selected
              </span>
              {fileList.length > 1 && (
                <Button
                  color="outline-danger"
                  size="sm"
                  onClick={handleRemoveAllFiles}
                  className="d-flex align-items-center"
                >
                  <X size={14} className="me-1" />
                  Remove All
                </Button>
              )}
            </div>

            <div className="file-list">
              {fileList.map((file, index) => (
                <div
                  key={index}
                  className="file-item mb-2 p-2 border rounded bg-light"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge
                      color="secondary"
                      className="text-break flex-grow-1 me-2"
                      style={{
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        lineHeight: "1.4",
                      }}
                    >
                      {file.name}
                    </Badge>
                    <div className="preview-actions d-flex gap-1">
                      <Button
                        color="primary"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        className="d-flex align-items-center"
                      >
                        <Eye size={14} className="me-1" />
                      </Button>
                      <Button
                        color="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="d-flex align-items-center"
                      >
                        <X size={14} className="me-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PreviewFile
        title={previewFile?.name}
        file={previewFile}
        isOpen={isPreviewOpen}
        toggle={closePreview}
      />
    </>
  );
};

export default FileUpload;