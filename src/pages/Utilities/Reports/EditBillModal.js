import { useEffect, useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner,
    FormGroup,
    Label,
    Input,
    FormFeedback,
} from "reactstrap";
import { toast } from "react-toastify";
import { FileText, Download } from "lucide-react";
import { updateUtilityBill } from "../../../helpers/backend_helper";

const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const ALLOWED_FILE_TYPES = ["application/pdf", DOCX_MIME, "image/jpeg", "image/png"];
const INVALID_FILE_MESSAGE =
    "Only PDF, DOCX, JPG, JPEG, and PNG files are allowed";

const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EditBillModal = ({ isOpen, onClose, bill, onRefresh, onSubmittingChange }) => {
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (file && file.type?.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(null);
    }, [file]);

    const handleClose = () => {
        if (submitting) return;
        setFile(null);
        setFileError("");
        onClose();
    };

    const handleFileChange = (selectedFile) => {
        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
            setFileError(INVALID_FILE_MESSAGE);
            toast.error(INVALID_FILE_MESSAGE);
            setFile(null);
            return;
        }

        setFileError("");
        setFile(selectedFile);
    };

    const handleSubmit = async () => {
        if (!file || fileError || !bill) return;

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error(INVALID_FILE_MESSAGE);
            return;
        }

        setSubmitting(true);
        onSubmittingChange?.(true);
        try {
            const formData = new FormData();
            formData.append("billFile", file);
            await updateUtilityBill(bill._id, formData);

            toast.success("File updated successfully");
            onRefresh();
            handleClose();
        } catch (error) {
            toast.error(error?.message || "Failed to update file");
        } finally {
            setSubmitting(false);
            onSubmittingChange?.(false);
        }
    };

    const isCurrentPdf = bill?.fileType === "application/pdf";
    const isCurrentDocx = bill?.fileType === DOCX_MIME;
    const isCurrentImage = bill?.fileType?.startsWith("image/");

    const isNewPdf = file?.type === "application/pdf";
    const isNewDocx = file?.type === DOCX_MIME;
    const isNewImage = file?.type?.startsWith("image/");

    return (
        <Modal isOpen={isOpen} toggle={handleClose} centered size="lg">
            <ModalHeader toggle={handleClose}>Replace Bill File</ModalHeader>
            <ModalBody>
                {bill && (
                    <div className="mb-3">
                        <Label className="fw-semibold">Current File</Label>
                        {isCurrentPdf && (
                            <iframe
                                src={bill.fileUrl}
                                title={bill.fileName || "Current Bill"}
                                width="100%"
                                height="400"
                                style={{ border: "1px solid #dee2e6", borderRadius: 4 }}
                            />
                        )}
                        {isCurrentImage && (
                            <div className="text-center">
                                <img
                                    src={bill.fileUrl}
                                    alt={bill.fileName || "Current Bill"}
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: 400,
                                        objectFit: "contain",
                                    }}
                                />
                            </div>
                        )}
                        {isCurrentDocx && (
                            <a
                                href={bill.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-flex align-items-center gap-2 p-3 border rounded text-decoration-none"
                            >
                                <Download size={18} />
                                Word Document — click to download
                            </a>
                        )}
                        {!isCurrentPdf && !isCurrentImage && !isCurrentDocx && (
                            <p className="text-muted mb-0">
                                Preview not supported for this file type
                            </p>
                        )}
                    </div>
                )}

                <FormGroup className="mb-0">
                    <Label className="fw-semibold">
                        Replacement File <span className="text-danger">*</span>
                    </Label>
                    <Input
                        type="file"
                        accept=".pdf,.docx,.jpg,.jpeg,.png"
                        disabled={submitting}
                        onChange={(e) => handleFileChange(e.currentTarget.files[0])}
                        invalid={!!fileError}
                    />
                    <FormFeedback>{fileError}</FormFeedback>
                </FormGroup>

                {file && !fileError && (
                    <div className="mt-3 p-2 px-3 border rounded bg-light">
                        {isNewImage && previewUrl && (
                            <img
                                src={previewUrl}
                                alt={file.name}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: 200,
                                    objectFit: "contain",
                                    display: "block",
                                    margin: "0 auto",
                                }}
                            />
                        )}
                        {(isNewPdf || isNewDocx) && (
                            <div className="d-flex align-items-center gap-2">
                                <FileText size={20} />
                                <div>
                                    <div className="fw-semibold">{file.name}</div>
                                    <div className="text-muted" style={{ fontSize: 12 }}>
                                        {formatFileSize(file.size)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!file || !!fileError || submitting}
                >
                    {submitting ? <Spinner size="sm" /> : "Save"}
                </Button>
                <Button
                    color="secondary"
                    outline
                    onClick={handleClose}
                    disabled={submitting}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditBillModal;
