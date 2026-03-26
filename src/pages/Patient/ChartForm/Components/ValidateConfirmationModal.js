import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import PropTypes from "prop-types";

const ValidateConfirmationModal = ({ isOpen, toggle, onConfirm, loading, isVerified }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>
                Confirm Validation
            </ModalHeader>

            <ModalBody>
                {isVerified ? (
                    <p className="mb-0">
                        Are you sure you want to <strong>remove validation</strong> from this discharge summary?
                    </p>
                ) : (
                    <p className="mb-0">
                        I have read all the details carefully and confirm that the discharge summary is accurate.
                    </p>
                )}
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>

                <Button color={isVerified ? "danger" : "primary"} onClick={onConfirm} disabled={loading}>
                    {loading
                        ? isVerified
                            ? "Removing..."
                            : "Validating..."
                        : isVerified
                            ? "Yes, Remove Validation"
                            : "Yes, Validate"}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ValidateConfirmationModal.propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    onConfirm: PropTypes.func,
    loading: PropTypes.bool,
};

export default ValidateConfirmationModal;