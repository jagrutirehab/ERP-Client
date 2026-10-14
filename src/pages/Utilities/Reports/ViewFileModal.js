import { Button } from "reactstrap";
import { Download } from "lucide-react";
import CustomModal from "../../../Components/Common/Modal";

const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const FilePreview = ({ file }) => {
    const isPdf = file.type === "application/pdf";
    const isImage = file.type?.startsWith("image/");
    const isDocx = file.type === DOCX_MIME;

    return (
        <div>
            {isPdf && (
                <iframe
                    src={file.url}
                    title={file.originalName || "Bill Preview"}
                    width="100%"
                    height="500"
                    style={{ border: "none" }}
                />
            )}
            {isImage && (
                <img
                    src={file.url}
                    alt={file.originalName || "Bill Preview"}
                    className="img-fluid mx-auto d-block"
                />
            )}
            {isDocx && (
                <div className="text-center py-4 border rounded">
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-inline-flex align-items-center gap-2"
                    >
                        <Download size={18} />
                        Word Document — click to download
                    </a>
                </div>
            )}
            {!isPdf && !isImage && !isDocx && (
                <p className="text-center text-muted py-4 border rounded">
                    Preview not supported for this file type
                </p>
            )}
        </div>
    );
};

const ViewFileModal = ({ isOpen, toggle, file }) => {
    if (!file) return null;

    const handlePrint = () => {
        if (file.url) window.open(file.url, "_blank");
    };

    return (
        <CustomModal
            size="lg"
            centered
            title={file.originalName || file.name || "View Bill"}
            isOpen={isOpen}
            toggle={toggle}
            footer={
                <>
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-secondary d-flex align-items-center gap-1"
                    >
                        <Download size={16} />
                        Open
                    </a>
                    <Button color="primary" onClick={handlePrint}>
                        Print
                    </Button>
                    <Button color="secondary" outline onClick={toggle}>
                        Close
                    </Button>
                </>
            }
        >
            <FilePreview file={file} />
        </CustomModal>
    );
};

export default ViewFileModal;
