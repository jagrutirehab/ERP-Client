import { Eye, FileText, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { Badge, Button, Input, Label } from "reactstrap";
import PreviewFile from "../../../Components/Common/PreviewFile";

const FileUpload = ({ setAttachment, attachment, existingFile }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const attachmentRef = useRef(null);

  const isNewFile = attachment instanceof File;
  const fileToDisplay = isNewFile ? attachment : existingFile;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAttachment(file);
    }
  };

  const handlePreview = () => {
    if (!fileToDisplay) return;

    if (isNewFile) {
      const fileUrl = URL.createObjectURL(attachment);
      setPreviewFile({
        url: fileUrl,
        type: attachment.type,
        name: attachment.name,
        isLocal: true
      });
    } else {
      if (typeof existingFile === "string") {
        setPreviewFile({
          url: existingFile,
          name: existingFile.split("/").pop(),
          type: existingFile.endsWith(".pdf")
            ? "application/pdf"
            : "image/*",
          isLocal: false
        });
      } else {
        setPreviewFile({
          url: existingFile?.url,
          name: existingFile?.name,
          type: existingFile?.type,
          isLocal: false
        });
      }
    }

    setIsPreviewOpen(true);
  };

  const handleRemoveFile = () => {
    setAttachment(null);

    if (attachmentRef.current) {
      attachmentRef.current.value = "";
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);

    if (previewFile?.isLocal && previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }

    setPreviewFile(null);
  };

  const getDisplayName = () => {
    if (isNewFile) return attachment.name;

    if (typeof existingFile === "string") {
      return existingFile.split("/").pop();
    }

    return existingFile?.name;
  };

  return (
    <>
      <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-white">
        <div className="mb-3">
          <FileText className="text-muted" size={48} />
        </div>

        <div className="mb-2">
          <Label
            htmlFor="attachment"
            className="text-primary cursor-pointer mb-0"
          >
            <Upload size={14} className="me-2" />
            Upload a file
          </Label>

          <Input
            id="attachment"
            type="file"
            className="d-none"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileChange}
            ref={attachmentRef}
          />
        </div>

        <p className="small text-muted mb-0">
          PNG, JPG, PDF up to 10MB
        </p>

        {fileToDisplay && (
          <div className="mt-3 pt-3 border-top">
            <Badge
              color="success"
              className="mb-2 text-break"
              style={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.4"
              }}
            >
              {getDisplayName()}
            </Badge>

            <div className="d-flex justify-content-center gap-2 mt-2">
              <Button
                color="primary"
                size="sm"
                onClick={handlePreview}
              >
                <Eye size={14} className="me-1" />
                Preview
              </Button>

              <Button
                color="outline-danger"
                size="sm"
                onClick={handleRemoveFile}
              >
                <X size={14} className="me-1" />
                Remove
              </Button>
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
