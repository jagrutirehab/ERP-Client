import React, { useState } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
} from "reactstrap";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

const isDocx = (type, name) =>
  type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
  /\.docx$/i.test(name || "");

const isPdf = (type, name) =>
  type === "application/pdf" || /\.pdf$/i.test(name || "");

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

// PDFs render directly via the S3 inline URL; DOCX is embedded through
// Microsoft Office's web viewer (the S3 object is public-read).
export const buildDocumentViewerSrc = (doc) => {
  if (!doc?.url) return null;
  if (isPdf(doc.type, doc.originalName || doc.name)) return doc.url;
  if (isDocx(doc.type, doc.originalName || doc.name)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.url)}`;
  }
  return doc.url;
};

/**
 * Two-mode section:
 *   - `mode="create"` → dropzone → pending-file chip. The file is sent with the
 *     form's create submit (single multipart call).
 *   - `mode="edit"`   → existing document chip (View + Delete) OR, if no
 *     document is attached, the dropzone reappears and drops trigger an
 *     immediate upload via the parent's `onUploadFile` callback. The main
 *     rule save (PATCH) never touches the document.
 */
const SOPDocumentSection = ({
  mode = "create",
  document,
  pendingFile,
  onPendingFileChange,
  onUploadFile,
  onRemoveExisting,
  isSubmitting,
  isRemoving,
  isUploading,
}) => {
  const [rejectMsg, setRejectMsg] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isEdit = mode === "edit";
  const hasExisting = Boolean(document?.url);

  const handleDrop = (accepted, rejected) => {
    if (rejected?.length) {
      setRejectMsg("Only one PDF or DOCX file is allowed.");
      return;
    }
    setRejectMsg(null);
    const file = accepted?.[0] || null;
    if (!file) {
      // "Cancel" path in create mode — pending null is meaningful there.
      if (!isEdit) onPendingFileChange?.(null);
      return;
    }
    if (isEdit) {
      // Edit mode immediately ships the file — no pending state.
      onUploadFile?.(file);
    } else {
      onPendingFileChange?.(file);
    }
  };

  // Create: dropzone when no pending file, otherwise pending chip.
  // Edit:   chip when a doc is attached; otherwise dropzone (or spinner while
  //         an upload is in flight).
  const showDropzone = isEdit
    ? !hasExisting && !isUploading
    : !pendingFile;
  const showChip = isEdit ? hasExisting : Boolean(pendingFile);
  const showUploadingState = isEdit && !hasExisting && isUploading;

  const fileForPreview =
    !isEdit && pendingFile
      ? {
          url: URL.createObjectURL(pendingFile),
          type: pendingFile.type,
          originalName: pendingFile.name,
        }
      : document;

  const viewerSrc = fileForPreview ? buildDocumentViewerSrc(fileForPreview) : null;
  const isPdfPreview = fileForPreview
    ? isPdf(fileForPreview.type, fileForPreview.originalName || fileForPreview.name)
    : false;

  return (
    <Card className="mb-4">
      <CardHeader className="fw-semibold d-flex justify-content-between align-items-center">
        <span>Reference Document</span>
        <Badge color="light" className="text-dark border">
          PDF or DOCX · 1 file
        </Badge>
      </CardHeader>
      <CardBody>
        {rejectMsg && (
          <Alert color="warning" toggle={() => setRejectMsg(null)}>
            {rejectMsg}
          </Alert>
        )}

        {showUploadingState && (
          <div className="d-flex align-items-center justify-content-center gap-2 py-4 text-muted small">
            <Spinner size="sm" />
            Uploading document…
          </div>
        )}

        {showDropzone && (
          <Dropzone
            onDrop={handleDrop}
            multiple={false}
            accept={ACCEPT}
            disabled={isSubmitting || isUploading}
          >
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className="dropzone dz-clickable text-center border border-dashed rounded p-4"
                style={{
                  cursor:
                    isSubmitting || isUploading ? "not-allowed" : "pointer",
                  background: isDragActive ? "rgba(13,110,253,0.05)" : "#fafbfc",
                }}
              >
                <input {...getInputProps()} />
                <div className="mb-2">
                  <i
                    className="display-5 text-muted ri-file-upload-line"
                    aria-hidden="true"
                  />
                </div>
                <h6 className="mb-1">
                  {isDragActive
                    ? "Drop the file here…"
                    : "Drop a PDF or DOCX here, or click to browse"}
                </h6>
                <small className="text-muted">
                  {isEdit
                    ? "Attach a reference document. It's uploaded as soon as you drop it."
                    : "Attach the source protocol document for this SOP. Optional — but if you add one, it's saved alongside the rule."}
                </small>
              </div>
            )}
          </Dropzone>
        )}

        {showChip && (
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2 p-2 border rounded bg-light">
            <div className="d-flex align-items-center gap-2 min-w-0">
              <i
                className={`bx ${
                  isPdfPreview ? "bxs-file-pdf text-danger" : "bxs-file-doc text-primary"
                }`}
                style={{ fontSize: "1.5rem" }}
              />
              <div className="min-w-0">
                <div className="fw-semibold text-truncate">
                  {pendingFile
                    ? pendingFile.name
                    : document?.originalName || document?.name}
                </div>
                <small className="text-muted">
                  {pendingFile ? (
                    <>Pending upload · {formatSize(pendingFile.size)}</>
                  ) : (
                    <>
                      {formatSize(document?.size)}
                      {document?.uploadedAt && (
                        <>
                          {" · "}
                          Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                        </>
                      )}
                    </>
                  )}
                </small>
              </div>
            </div>
            <div className="d-flex gap-2 flex-shrink-0">
              {viewerSrc && (
                <Button
                  type="button"
                  size="sm"
                  color="primary"
                  outline
                  onClick={() => setPreviewOpen(true)}
                >
                  <i className="bx bx-show me-1" /> View
                </Button>
              )}
              {!isEdit && pendingFile && (
                <Button
                  type="button"
                  size="sm"
                  color="danger"
                  outline
                  onClick={() => onPendingFileChange?.(null)}
                  disabled={isSubmitting}
                >
                  <i className="bx bx-x me-1" /> Cancel
                </Button>
              )}
              {isEdit && hasExisting && (
                <Button
                  type="button"
                  size="sm"
                  color="danger"
                  outline
                  onClick={onRemoveExisting}
                  disabled={isSubmitting || isRemoving}
                >
                  {isRemoving ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <i className="bx bx-trash me-1" /> Delete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        <Modal
          isOpen={previewOpen}
          toggle={() => setPreviewOpen(false)}
          size="xl"
          centered
          fade={false}
        >
          <ModalHeader toggle={() => setPreviewOpen(false)}>
            {pendingFile
              ? pendingFile.name
              : document?.originalName || document?.name || "Document"}
          </ModalHeader>
          <ModalBody className="p-0">
            {viewerSrc && (
              <iframe
                title="SOP Document Preview"
                src={viewerSrc}
                style={{ width: "100%", height: "75vh", border: "none" }}
              />
            )}
          </ModalBody>
        </Modal>
      </CardBody>
    </Card>
  );
};

SOPDocumentSection.propTypes = {
  mode: PropTypes.oneOf(["create", "edit"]),
  document: PropTypes.shape({
    name: PropTypes.string,
    originalName: PropTypes.string,
    url: PropTypes.string,
    path: PropTypes.string,
    size: PropTypes.number,
    type: PropTypes.string,
    uploadedAt: PropTypes.string,
  }),
  pendingFile: PropTypes.object,
  onPendingFileChange: PropTypes.func,
  onUploadFile: PropTypes.func,
  onRemoveExisting: PropTypes.func,
  isSubmitting: PropTypes.bool,
  isRemoving: PropTypes.bool,
  isUploading: PropTypes.bool,
};

export default SOPDocumentSection;
