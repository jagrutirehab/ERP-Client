import { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { FileText, Paperclip } from "lucide-react";
import { downloadFile } from "../../../Components/Common/downloadFile";
import PropTypes from "prop-types";

const AttachmentCell = ({ attachments = [], showAsButton = false }) => {
    const [open, setOpen] = useState(false);

    if (!attachments.length) return "-";

    const visible = attachments.slice(0, 1);
    const hiddenCount = attachments.length - visible.length;

    return (
        <>
            <div>
                {showAsButton ? (
                    <Button
                        color="primary"
                        size="sm"
                        onClick={() => setOpen(true)}
                        className="gap-1 fs-6 d-flex align-items-center"
                        style={{ padding: "2px 6px" }}
                    >
                        <Paperclip size={11} />
                        Open ({attachments.length})
                    </Button>
                ) : (
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        {visible.map((file, i) => (
                            <p
                                key={file._id || i}
                                onClick={() => downloadFile(file)}
                                className="text-primary text-decoration-underline cursor-pointer mb-1 d-flex align-items-center gap-1"
                                style={{
                                    whiteSpace: "normal",
                                    wordBreak: "break-all"
                                }}
                            >
                                <Paperclip size={14} />
                                {file.originalName}
                            </p>
                        ))}
                        {hiddenCount > 0 && (
                            <span
                                className="text-muted cursor-pointer mb-1"
                                onClick={() => setOpen(true)}
                                style={{ whiteSpace: "nowrap" }}
                            >
                                +{hiddenCount} more
                            </span>
                        )}
                    </div>
                )}

                <Modal isOpen={open} toggle={() => setOpen(!open)}>
                    <ModalHeader toggle={() => setOpen(!open)}>Attachments</ModalHeader>
                    <ModalBody>
                        <ul style={{ listStyle: "none", paddingLeft: 0, marginBottom: 0 }}>
                            {attachments.map((file, i) => (
                                <li
                                    key={file._id || i}
                                    onClick={() => downloadFile(file)}
                                    className="text-primary text-decoration-underline cursor-pointer mb-2 d-flex align-items-center gap-2"
                                >
                                    <FileText size={15} />
                                    {file.originalName}
                                </li>
                            ))}
                        </ul>
                    </ModalBody>
                </Modal>
            </div>
        </>
    );
};

AttachmentCell.prototype = {
    attachments: PropTypes.array,
    showAsButton: PropTypes.bool
}

export default AttachmentCell;
