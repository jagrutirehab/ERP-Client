import { useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { downloadFile } from "../../../Components/Common/downloadFile";

const AttachmentCell = ({ attachments }) => {
    const [open, setOpen] = useState(false);
    const visible = attachments.slice(0, 1);
    const hiddenCount = attachments.length - visible.length;

    return (
        <>
            {attachments.length ? (
                <div>
                    {visible.map((file, i) => (
                        <p
                            key={file._id || i}
                            onClick={() => downloadFile(file)}
                            className="text-primary text-decoration-underline cursor-pointer mb-1"
                        >
                            {file.originalName}
                        </p>
                    ))}
                    {hiddenCount > 0 && (
                        <span
                            className="text-muted cursor-pointer"
                            onClick={() => setOpen(true)}
                        >
                            +{hiddenCount} more
                        </span>
                    )}

                    <Modal isOpen={open} toggle={() => setOpen(!open)}>
                        <ModalHeader toggle={() => setOpen(!open)}>Attachments</ModalHeader>
                        <ModalBody>
                            <ul style={{ paddingLeft: "1.2rem", marginBottom: 0 }}>
                                {attachments.map((file, i) => (
                                    <li
                                        key={file._id || i}
                                        onClick={() => downloadFile(file)}
                                        className="text-primary text-decoration-underline cursor-pointer mb-1"
                                        style={{ listStyleType: "disc" }}
                                    >
                                        {file.originalName}
                                    </li>
                                ))}
                            </ul>
                        </ModalBody>
                    </Modal>
                </div>
            ) : (
                "-"
            )}
        </>
    );
};

export default AttachmentCell;
