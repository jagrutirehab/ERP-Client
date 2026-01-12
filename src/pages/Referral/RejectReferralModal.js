import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const RejectReferralModal = ({ isOpen, toggle, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Reject Referral</ModalHeader>
      <ModalBody>
        <p>Are you sure you want to reject this referral?</p>
        <p className="text-muted">
          This referral will not be available for use.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={toggle}>
          Cancel
        </Button>
        <Button color="danger" onClick={onConfirm}>
          Reject
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RejectReferralModal;
