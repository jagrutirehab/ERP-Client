import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";

const DeleteBillModal = ({ isOpen, onClose, onConfirm, loading }) => {
    return (
        <Modal isOpen={isOpen} toggle={onClose} centered>
            <ModalHeader toggle={onClose}>Confirm Delete</ModalHeader>
            <ModalBody>
                Are you sure you want to delete this bill? This action cannot be undone.
            </ModalBody>
            <ModalFooter>
                <Button color="danger" onClick={onConfirm} disabled={loading}>
                    {loading ? <Spinner size="sm" /> : "Confirm Delete"}
                </Button>
                <Button color="secondary" outline onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default DeleteBillModal;
