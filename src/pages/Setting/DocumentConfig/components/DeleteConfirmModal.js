import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import { deleteDocument } from "../../../../helpers/backend_helper";

const DeleteConfirmModal = ({ isOpen, toggle, document, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deleteDocument(document._id);
      toast.success(res?.data?.message || "Document deleted successfully");
      onSuccess && onSuccess();
      toggle();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete document";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Delete Document</ModalHeader>
      <ModalBody>
        Are you sure you want to delete <strong>{document?.docName}</strong>?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={submitting}>
          {submitting ? (
            <span className="d-inline-flex align-items-center justify-content-center gap-1">
              <Spinner size="sm" /> Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfirmModal;
