import { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { FileText, Paperclip } from "lucide-react";
import PropTypes from "prop-types";

const truncateMiddle = (name, maxLength = 28) => {
    if (!name || name.length <= maxLength) return name;
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
    const start = name.slice(0, Math.ceil((maxLength - ext.length) / 2));
    const end = name.slice(name.length - Math.floor((maxLength - ext.length) / 2) - ext.length);
    return `${start}...${end}`;
};

const AttachmentCell = ({ attachments = [], showAsButton = false, onPreview }) => {
    const [open, setOpen] = useState(false);

    if (!attachments.length) return "-";

    const visible = attachments.slice(0, 1);
    const hiddenCount = attachments.length - visible.length;

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {showAsButton ? (
                <Button
                    color="primary"
                    size="sm"
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(true);
                    }}
                    className="gap-1 fs-6 d-flex align-items-center text-white"
                    style={{ padding: "2px 6px" }}
                >
                    <Paperclip size={11} />
                    Open ({attachments.length})
                </Button>
            ) : (
                <div className="d-flex flex-wrap align-items-center gap-2">
                    {visible.map((file, i) => (
                        <button
                            key={file._id || i}
                            type="button"
                            className="btn btn-link p-0 text-primary text-decoration-underline mb-1 d-flex align-items-center gap-1"
                            style={{ whiteSpace: "nowrap" }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onPreview?.(file); 
                            }}
                        >
                            <Paperclip size={14} />
                            <span title={file.originalName}>{truncateMiddle(file.originalName)}</span>
                        </button>
                    ))}

                    {hiddenCount > 0 && (
                        <button
                            type="button"
                            className="btn btn-link p-0 text-muted mb-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(true);
                            }}
                        >
                            +{hiddenCount} more
                        </button>
                    )}
                </div>
            )}

            <Modal isOpen={open} toggle={() => setOpen(!open)}>
                <ModalHeader toggle={() => setOpen(!open)}>Attachments</ModalHeader>
                <ModalBody>
                    <ul style={{ listStyle: "none", paddingLeft: 0, marginBottom: 0 }}>
                        {attachments.map((file, i) => (
                            <li key={file._id || i}>
                                <button
                                    type="button"
                                    className="btn btn-link p-0 text-primary text-decoration-underline mb-2 d-flex align-items-center gap-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onPreview?.(file);
                                        setOpen(false);
                                    }}
                                >
                                    <FileText size={15} />
                                    <span title={file.originalName}>{truncateName(file.originalName)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </ModalBody>
            </Modal>
        </div>
    );
};

AttachmentCell.propTypes = {
    attachments: PropTypes.array,
    showAsButton: PropTypes.bool,
    onPreview: PropTypes.func,
};

export default AttachmentCell;
