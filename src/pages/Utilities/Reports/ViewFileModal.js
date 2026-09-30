import { Button } from "reactstrap";
import { Download } from "lucide-react";
import CustomModal from "../../../Components/Common/Modal";

const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ViewFileModal = ({ isOpen, toggle, bill }) => {
    if (!bill) return null;

    const isPdf = bill.fileType === "application/pdf";
    const isImage = bill.fileType?.startsWith("image/");
    const isDocx = bill.fileType === DOCX_MIME;

    const handlePrint = () => {
        window.open(bill.fileUrl, "_blank");
    };

    return (
        <CustomModal
            size="lg"
            centered
            title={bill.fileName || "View Bill"}
            isOpen={isOpen}
            toggle={toggle}
            footer={
                <>
                    <Button color="primary" onClick={handlePrint}>
                        Print
                    </Button>
                    <Button color="secondary" outline onClick={toggle}>
                        Close
                    </Button>
                </>
            }
        >
            {isPdf && (
                <iframe
                    src={bill.fileUrl}
                    title={bill.fileName || "Bill Preview"}
                    width="100%"
                    height="600"
                    style={{ border: "none" }}
                />
            )}
            {isImage && (
                <img
                    src={bill.fileUrl}
                    alt={bill.fileName || "Bill Preview"}
                    className="img-fluid mx-auto d-block"
                />
            )}
            {isDocx && (
                <div className="text-center py-5">
                    <a
                        href={bill.fileUrl}
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
                <p className="text-center text-muted py-5">
                    Preview not supported for this file type
                </p>
            )}
        </CustomModal>
    );
};

export default ViewFileModal;
