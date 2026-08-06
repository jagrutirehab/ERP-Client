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
import { deleteArea } from "../../../../helpers/backend_helper";

const DeleteAreaConfirmModal = ({ isOpen, toggle, area, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deleteArea(area._id);
      toast.success(res?.data?.message || "Area deleted successfully");
      onSuccess && onSuccess();
      toggle();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to delete area";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Delete Area</ModalHeader>
      <ModalBody>
        Are you sure you want to delete <strong>{area?.areaName}</strong>? It
        will also be removed from every floor of every center that uses it.
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
            "Delete Area"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteAreaConfirmModal;
