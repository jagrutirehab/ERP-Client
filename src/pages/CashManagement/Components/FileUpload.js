import { Eye, FileText, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { Badge, Button, Input, Label } from "reactstrap";
import PreviewFile from "../../../Components/Common/PreviewFile";

const FileUpload = ({ setAttachment, attachment }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const attachmentRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setAttachment(file);
    } else {
      setAttachment(null);
    }
  };

  const handlePreview = () => {
    if (attachment) {
      const fileUrl = URL.createObjectURL(attachment);
      setPreviewFile({
        url: fileUrl,
        type: attachment.type,
        name: attachment.name
      });
      setIsPreviewOpen(true);
    }
  };

  const handleRemoveFile = () => {
    setAttachment(null);
    if (attachmentRef.current) {
      attachmentRef.current.value = '';
    }
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
          <Label
            htmlFor="attachment"
            className="text-primary cursor-pointer mb-0"
          >
            <Upload size={14} className="me-2" />
            Upload a file
          </Label>
          <Input
            id="attachment"
            name="attachment"
            type="file"
            className="d-none"
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.pdf"
            ref={attachmentRef}
          />
        </div>
        <p className="small text-muted mb-0">PNG, JPG, PDF up to 10MB</p>

        {attachment && (
          <div className="mt-3 pt-3 border-top">
            <Badge color="success" className="mb-2">
              <i className="fas fa-check me-1"></i>
              {attachment.name}
            </Badge>
            <div className="preview-actions d-flex justify-content-center gap-2 mt-2">
              <Button
                color="primary"
                size="sm"
                onClick={handlePreview}
                className="d-flex align-items-center"
              >
                <Eye size={14} className="me-1" />
                Preview
              </Button>
              <Button
                color="outline-danger"
                size="sm"
                onClick={handleRemoveFile}
                className="d-flex align-items-center"
              >
                <X size={14} className="me-1" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>

      <PreviewFile
        title={attachment?.name}
        file={previewFile}
        isOpen={isPreviewOpen}
        toggle={closePreview}
      />
    </>
  );
};

export default FileUpload;