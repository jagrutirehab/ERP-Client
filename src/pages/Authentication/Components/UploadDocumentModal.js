import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Alert,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import { uploadEmployeeDocument } from "../../../helpers/backend_helper";

const UploadDocumentModal = ({
  isOpen,
  toggle,
  documentId,
  docName,
  onSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetAndClose = () => {
    setSelectedFiles([]);
    setError("");
    toggle();
  };

  const handleSubmit = async () => {
    setError("");

    if (selectedFiles.length === 0) {
      setError("Select at least one file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("document", documentId);
    selectedFiles.forEach((file) => formData.append("files", file));

    setSubmitting(true);
    try {
      const res = await uploadEmployeeDocument(formData);
      toast.success(res?.data?.message || "Document uploaded successfully");
      onSuccess && onSuccess();
      resetAndClose();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to upload document";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={resetAndClose} centered>
      <ModalHeader toggle={resetAndClose}>Upload {docName}</ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}

        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-3"
        />

        {selectedFiles.length > 0 && (
          <div className="border rounded p-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="d-flex align-items-center justify-content-between py-1 px-2"
                style={{ fontSize: 13 }}
              >
                <span className="text-truncate" style={{ maxWidth: 260 }}>
                  {file.name}
                </span>
                <Button
                  color="link"
                  className="text-danger p-0"
                  onClick={() => removeFile(index)}
                >
                  <i className="ri-close-line" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={resetAndClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Spinner size="sm" className="me-1" /> Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UploadDocumentModal;
