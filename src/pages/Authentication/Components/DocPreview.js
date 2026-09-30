import React, { useState } from "react";
import { Col, Modal, ModalBody, ModalHeader, Button, Badge } from "reactstrap";

const getFileType = (url) => {
  if (!url) return null;
  const clean = url.split("?")[0];
  const filename = clean.split("/").pop();
  const ext = filename.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  return "other";
};

const statusColorMap = {
  uploaded: "warning",
  verified: "success",
  rejected: "danger",
};
const statusIconMap = {
  uploaded: "ri-error-warning-line",
  verified: "ri-checkbox-circle-line",
  rejected: "ri-close-circle-line",
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const DocPreview = ({
  label,
  url,
  detail,
  status,
  remarks,
  uploadedAt,
  actionedAt,
  onDelete,
}) => {
  const [modal, setModal] = useState(false);
  const fileType = getFileType(url);

  const renderPreview = () => {
    if (fileType === "image") {
      return (
        <div
          className="border rounded overflow-hidden position-relative"
          style={{ height: 140, cursor: "pointer" }}
          onClick={() => setModal(true)}
        >
          <img
            src={url}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(0,0,0,0.35)",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
          >
            <i className="ri-zoom-in-line text-white fs-2" />
          </div>
        </div>
      );
    }

    if (fileType === "pdf") {
      return (
        <div
          className="border rounded overflow-hidden position-relative"
          style={{ height: 140, cursor: "pointer" }}
          onClick={() => setModal(true)}
        >
          <iframe
            src={url}
            title={label}
            width="100%"
            height="100%"
            style={{ border: "none", pointerEvents: "none" }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(0,0,0,0.2)",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
          >
            <i className="ri-zoom-in-line text-white fs-2" />
          </div>
        </div>
      );
    }

    if (fileType === "doc") {
      return (
        <div
          className="border rounded overflow-hidden position-relative"
          style={{ height: 140, cursor: "pointer" }}
          onClick={() => setModal(true)}
        >
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
            title={label}
            width="100%"
            height="100%"
            style={{ border: "none", pointerEvents: "none" }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(0,0,0,0.2)",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
          >
            <i className="ri-zoom-in-line text-white fs-2" />
          </div>
        </div>
      );
    }

    return (
      <div
        className="border rounded d-flex flex-column align-items-center justify-content-center bg-light"
        style={{ height: 140 }}
      >
        <i className="ri-file-line text-secondary" style={{ fontSize: 48 }} />
        <span className="text-muted small mt-1">No Preview Available</span>
      </div>
    );
  };

  const renderModal = () => {
    if (fileType === "image") {
      return (
        <ModalBody className="text-center">
          <img
            src={url}
            alt={label}
            style={{ maxWidth: "100%", maxHeight: "75vh" }}
          />
        </ModalBody>
      );
    }

    if (fileType === "pdf") {
      return (
        <ModalBody style={{ height: "80vh", padding: 0 }}>
          <iframe
            src={url}
            title={label}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </ModalBody>
      );
    }

    if (fileType === "doc") {
      return (
        <ModalBody style={{ height: "80vh", padding: 0 }}>
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
            title={label}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </ModalBody>
      );
    }

    return null;
  };

  return (
    <Col md={4} className="mb-3">
      {/* <div style={{ minHeight: 48 }}>
        <p className="text-muted mb-1 fw-semibold">{label}</p>
        {detail && <p className="text-muted small mb-1">{detail}</p>}
      </div> */}

      <div style={{ minHeight: 48 }} className="mb-2">
        <p className="text-muted mb-1 fw-semibold">{label}</p>
        {/* {detail && <p className="text-muted small mb-1">{detail}</p>} */}
        {status && (
          <Badge
            color={statusColorMap[status] || "secondary"}
            className="text-capitalize mb-1 d-inline-flex align-items-center gap-1"
          >
            <i className={statusIconMap[status]} />
            {status === "uploaded" ? "Verification Pending" : status}
          </Badge>
        )}

        {uploadedAt && (
          <p className="text-muted small mb-0">
            <i className="ri-upload-cloud-2-line me-1" />
            Uploaded: {formatDate(uploadedAt)}
          </p>
        )}
        {status !== "uploaded" && actionedAt && (
          <p className="text-muted small mb-0">
            <i className="ri-eye-line me-1" />
            Reviewed: {formatDate(actionedAt)}
          </p>
        )}

        {remarks && (
          <p
            className={`small mb-0 mt-1 ${status === "rejected" ? "text-danger" : "text-muted"}`}
          >
            <i className="ri-chat-1-line me-1" />
            {remarks}
          </p>
        )}
      </div>

      {!url ? (
        <div
          className="border rounded p-3 text-center text-muted bg-light"
          style={{ height: 140 }}
        >
          No Document
        </div>
      ) : (
        <>
          {renderPreview()}

          <div className="mt-1 d-flex gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-primary w-100"
            >
              <i className="ri-external-link-line me-1" /> Open
            </a>
            <a
              href={url}
              download
              className="btn btn-sm btn-outline-secondary w-100"
            >
              <i className="ri-download-line me-1" /> Download
            </a>
            {onDelete && (
              <Button
                color="outline-danger"
                size="sm"
                className="w-100"
                onClick={onDelete}
              >
                <i className="ri-delete-bin-line me-1" /> Delete
              </Button>
            )}
          </div>

          {(fileType === "image" ||
            fileType === "pdf" ||
            fileType === "doc") && (
            <Modal
              isOpen={modal}
              toggle={() => setModal(false)}
              size="lg"
              centered
            >
              <ModalHeader toggle={() => setModal(false)}>{label}</ModalHeader>
              {renderModal()}
            </Modal>
          )}
        </>
      )}
    </Col>
  );
};

export default DocPreview;
