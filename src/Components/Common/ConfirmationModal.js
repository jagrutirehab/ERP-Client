import React from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
} from "reactstrap";
import PropTypes from "prop-types";

const ConfirmationModal = ({
    isOpen,
    toggle,
    title = "Are you sure?",
    message = "Do you really want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "danger",
    onConfirm,
    onCancel,
}) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>{title}</ModalHeader>

            <ModalBody>
                <p className="mb-0">{message}</p>
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" className="text-white" onClick={onCancel || toggle}>
                    {cancelText}
                </Button>

                <Button color={confirmColor} className="text-white"
                    onClick={onConfirm}>
                    {confirmText}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    confirmColor: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
};

export default ConfirmationModal;
