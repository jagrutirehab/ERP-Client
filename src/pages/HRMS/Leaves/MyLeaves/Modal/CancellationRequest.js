import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";

const CancellationRequest = ({ isOpen, toggle, onConfirm, loading }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>
                Cancel Leave
            </ModalHeader>

            <ModalBody className="text-center">
                <h5>Are you sure you want to cancel this leave?</h5>
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    No
                </Button>
                <Button color="danger" onClick={onConfirm}>
                    {loading ? <Spinner size="sm" /> : "Yes"}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default CancellationRequest;