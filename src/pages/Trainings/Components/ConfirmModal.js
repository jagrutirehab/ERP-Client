import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap'

const ConfirmModal = ({ isOpen, onConfirm, onCancel, loading }) => {
    return (
        <Modal isOpen={isOpen} toggle={onCancel} centered>
            <ModalHeader toggle={onCancel}>Confirm Acknowledgement</ModalHeader>
            <ModalBody>
                Are you sure you want to acknowledge this training? This action cannot be undone.
            </ModalBody>
            <ModalFooter>
                <Button color="primary" disabled={loading} onClick={onConfirm}>
                    {loading ? <Spinner size="sm" /> : 'Yes, Acknowledge'}
                </Button>
                <Button color="secondary" disabled={loading} onClick={onCancel}>No</Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmModal