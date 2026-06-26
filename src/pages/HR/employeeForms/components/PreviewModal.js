import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const PreviewModal = ({ isOpen, onClose, row }) => {
  if (!row) return null;

  const isPdf =
    row.type === "application/pdf" ||
    row.fileName?.toLowerCase().endsWith(".pdf") ||
    row.url?.toLowerCase().includes(".pdf");

  const isImage =
    row.type?.startsWith("image/") ||
    /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(row.fileName || row.url || "");

  const isWord =
    row.fileName?.toLowerCase().endsWith(".doc") ||
    row.fileName?.toLowerCase().endsWith(".docx") ||
    row.url?.toLowerCase().includes(".doc");

  const renderContent = () => {
    if (isPdf) {
      return (
        <iframe
          src={row.url}
          width="100%"
          height="600px"
          style={{ border: "none" }}
          title={row.fileName}
        />
      );
    }

    if (isImage) {
      return (
        <img
          src={row.url}
          alt={row.fileName}
          className="img-fluid d-block mx-auto"
        />
      );
    }

    if (isWord) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(row.url)}`}
          width="100%"
          height="600px"
          style={{ border: "none" }}
          title="Document Viewer"
        />
      );
    }

    return (
      <p className="text-muted text-center py-5">
        Preview not available for this file type.
      </p>
    );
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" centered>
      <ModalHeader toggle={onClose}>{row.fileName}</ModalHeader>
      <ModalBody>{renderContent()}</ModalBody>
      <ModalFooter>
        <a
          href={row.url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-sm"
        >
          Download
        </a>
        <Button color="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PreviewModal;
