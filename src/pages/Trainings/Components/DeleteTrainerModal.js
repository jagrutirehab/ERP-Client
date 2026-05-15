import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap'

const DeleteTrainerModal = ({ isOpen, record, onConfirm, onClose, loading }) => {
    return (
        <Modal isOpen={isOpen} toggle={onClose} centered>
            <ModalHeader toggle={onClose}>Confirm Delete</ModalHeader>
            <ModalBody>
                Are you sure you want to delete <strong>{record?.trainingName}</strong>? This action cannot be undone.
            </ModalBody>
            <ModalFooter>
                <Button color="danger" onClick={onConfirm} disabled={loading}>{loading ? <Spinner size="sm" /> : "Yes, Delete"}</Button>
                <Button color="secondary" outline onClick={onClose}>Cancel</Button>
            </ModalFooter>
        </Modal>
    )
}

export default DeleteTrainerModal