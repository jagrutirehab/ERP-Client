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
import { deleteCenterFloorPhotoFile } from "../../../helpers/backend_helper";

const DeletePhotoConfirmModal = ({
  isOpen,
  toggle,
  recordId,
  fileId,
  fileName,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deleteCenterFloorPhotoFile(recordId, fileId);
      toast.success(res?.data?.message || "Photo deleted successfully");
      onSuccess && onSuccess();
      toggle();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to delete photo";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Delete Photo</ModalHeader>
      <ModalBody>
        Are you sure you want to delete{" "}
        <strong>{fileName || "this photo"}</strong>?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle} disabled={submitting}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={submitting}>
          {submitting ? (
            <>
              <Spinner size="sm" className="me-1" /> Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeletePhotoConfirmModal;
