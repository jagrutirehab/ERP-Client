import { FileText, Upload } from "lucide-react";
import { Badge, Input, Label } from "reactstrap";

const FileUpload = ({ setAttachment, attachment }) => {
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setAttachment(file);
    } else {
      setAttachment(null);
    }
  };
  return (
    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-white">
      <div className="mb-3">
        <FileText className="icon text-muted" size={48} />
      </div>
      <div className="mb-2">
        <Label
          htmlFor="attachment-spending"
          className="text-primary cursor-pointer mb-0"
        >
          <Upload size={14} className="me-2" />
          Upload a file
        </Label>
        <Input
          id="attachment-spending"
          name="attachment"
          type="file"
          className="d-none"
          onChange={handleFileChange}
          accept=".png,.jpg,.jpeg,.pdf"
        />
        {/* <span className="text-muted ms-2">or drag and drop</span> */}
      </div>
      <p className="small text-muted mb-0">PNG, JPG, PDF up to 10MB</p>
      {attachment && (
        <Badge color="success" className="mt-2">
          <i className="fas fa-check me-1"></i>
          {attachment.name}
        </Badge>
      )}
    </div>
  );
};

export default FileUpload;
