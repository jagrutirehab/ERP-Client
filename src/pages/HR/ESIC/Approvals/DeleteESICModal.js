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
import { deleteESICRecord } from "../../../../helpers/backend_helper";

const DeleteESICModal = ({ record, isOpen, toggle, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const response = await deleteESICRecord(record._id);
      toast.success(response.message || "ESIC record deleted successfully");
      onSuccess();
    } catch (error) {
      toast.error(error?.message || "Failed to delete ESIC record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      backdrop="static"
      keyboard={false}
    >
      <ModalHeader toggle={toggle}>Delete ESIC Record</ModalHeader>
      <ModalBody>
        <p className="mb-0">
          Are you sure you want to delete the ESIC record for{" "}
          <strong>{record.employee?.name}</strong> ({record.employee?.eCode})?
          This cannot be undone.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          className="text-white"
          onClick={toggle}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={submitting}>
          {submitting ? <Spinner size="sm" /> : "Delete"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteESICModal;
