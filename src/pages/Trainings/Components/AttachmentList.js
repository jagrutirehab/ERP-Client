import { useState } from "react";
import PreviewFile from "../../../Components/Common/PreviewFile";

const AttachmentList = ({ files }) => {
    const [previewFile, setPreviewFile] = useState(null);

    if (!files?.length) return null;

    return (
        <>
            <div className="d-flex flex-wrap gap-2 mt-2">
                {files.map((file, i) => (
                    <div
                        key={file.path || i}
                        className="d-flex align-items-center gap-2 border rounded-2 px-2 py-1"
                        style={{ fontSize: 12, background: "#fff", maxWidth: 320 }}
                    >
                        <i className="ri-attachment-2 text-muted" />
                        <span className="text-truncate" title={file.originalName || file.name}>
                            Attachment {i + 1}
                        </span>
                        <button
                            type="button"
                            className="btn btn-soft-primary btn-sm py-0 px-2"
                            onClick={() => setPreviewFile(file)}
                        >
                            View
                        </button>
                    </div>
                ))}
            </div>
            <PreviewFile
                title={previewFile?.originalName || previewFile?.name || "Attachment"}
                file={previewFile}
                isOpen={!!previewFile}
                toggle={() => setPreviewFile(null)}
                allowDownload
            />
        </>
    );
};

export default AttachmentList;
