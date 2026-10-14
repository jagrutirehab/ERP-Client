import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";

const DeleteModal = ({ isOpen, toggle, onConfirm, date }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Confirm Delete</ModalHeader>

      <ModalBody>
        Are you sure you want to delete{" "}
        <strong>{date}</strong> leave?
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          No
        </Button>

        <Button color="danger" onClick={onConfirm}>
          Yes, Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
