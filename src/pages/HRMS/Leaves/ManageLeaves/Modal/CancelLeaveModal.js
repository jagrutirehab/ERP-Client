import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";

const CancelLeaveModal = ({ show, onClose, onConfirm, loading }) => {
  return (
    <Modal isOpen={show} toggle={onClose} centered>

      <ModalHeader toggle={!loading ? onClose : undefined}>
        Confirm Cancellation
      </ModalHeader>

      <ModalBody className="text-center">
        Are you sure you want to cancel this leave?
      </ModalBody>

      <ModalFooter className="justify-content-center">
        <Button
          color="secondary"
          onClick={onClose}
          disabled={loading}
        >
          No
        </Button>

        <Button
          color="danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
            </>
          ) : (
            "Yes, Cancel"
          )}
        </Button>
      </ModalFooter>

    </Modal>
  );
};

export default CancelLeaveModal;