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
import { deleteFloor } from "../../../../helpers/backend_helper";

const DeleteConfirmModal = ({ isOpen, toggle, floor, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deleteFloor(floor._id);
      toast.success(res?.data?.message || "Floor deleted successfully");
      onSuccess && onSuccess();
      toggle();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to delete floor";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Delete Floor</ModalHeader>
      <ModalBody>
        Are you sure you want to delete <strong>{floor?.floorName}</strong>? It
        will also be removed from every center configuration that uses it.
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={submitting}>
          {submitting ? (
            <span className="d-inline-flex align-items-center justify-content-center gap-1">
              <Spinner size="sm" /> Deleting...
            </span>
          ) : (
            "Delete Floor"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfirmModal;
