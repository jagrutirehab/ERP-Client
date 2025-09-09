import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const DeleteConfirmModal = ({ isOpen, item, onCancel, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} toggle={onCancel}>
      <ModalHeader toggle={onCancel}>Delete Therapy</ModalHeader>
      <ModalBody>
        <p>Are you sure you want to delete this therapy?</p>
        <p>
          <strong>{item?.title}</strong>
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button color="danger" onClick={onConfirm}>
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfirmModal;
