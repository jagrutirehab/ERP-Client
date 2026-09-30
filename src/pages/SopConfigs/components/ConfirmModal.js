// components/ConfirmModal.js
import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";

const ConfirmModal = ({
  isOpen,
  title = "Are you sure?",
  message = "Do you want to proceed?",
  confirmLabel = "Yes, Proceed",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}) => (
  <Modal isOpen={isOpen} toggle={onCancel} centered backdrop="static">
    <ModalHeader toggle={onCancel}>{title}</ModalHeader>
    <ModalBody>{message}</ModalBody>
    <ModalFooter>
      <Button color="secondary" outline onClick={onCancel} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button color="primary" onClick={onConfirm} disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : confirmLabel}
      </Button>
    </ModalFooter>
  </Modal>
);

export default ConfirmModal;