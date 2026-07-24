import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { toast } from "react-toastify";
import {
  deleteEmployeeDocumentFile,
  deleteEmployeeDocumentFileByEmployeeId,
} from "../../../helpers/backend_helper";

const DeleteFileConfirmModal = ({
  isOpen,
  toggle,
  documentId,
  docName,
  fileId,
  fileName,
  onSuccess,
  employeeId,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = employeeId
        ? await deleteEmployeeDocumentFileByEmployeeId(
            employeeId,
            documentId,
            fileId,
          )
        : await deleteEmployeeDocumentFile(documentId, fileId);
      toast.success(res?.data?.message || "File deleted successfully");
      onSuccess && onSuccess();
      toggle();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to delete file";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Delete File</ModalHeader>
      <ModalBody>
        Are you sure you want to delete <strong>{fileName}</strong>
        {docName && (
          <>
            {" "}
            from <strong>{docName}</strong>
          </>
        )}
        ? This action cannot be undone by you.
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={submitting}>
          {submitting ? "Deleting..." : "Delete"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteFileConfirmModal;
