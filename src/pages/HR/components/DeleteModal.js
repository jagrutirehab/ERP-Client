import React from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "reactstrap";

const DeleteModal = ({ isOpen, toggle, onConfirm, itemName = "this item" }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>Delete Confirmation</ModalHeader>

            <ModalBody>
                <p className="fw-bold text-muted mb-0">
                    Are you sure you want to delete <span >{itemName}</span>?
                </p>
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" className="text-white" onClick={toggle}>
                    Cancel
                </Button>

                <Button color="danger" className="text-white" onClick={onConfirm}>
                    Delete
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default DeleteModal;
