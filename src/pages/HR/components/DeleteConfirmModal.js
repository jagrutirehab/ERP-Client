import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner
} from "reactstrap";

const DeleteConfirmModal = ({
    isOpen,
    toggle,
    title = "Delete Confirmation",
    message = "Are you sure you want to delete this item?",
    onConfirm,
    loading = false
}) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>{title}</ModalHeader>

            <ModalBody>
                <p className="mb-0">{message}</p>
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>

                <Button
                    color="danger"
                    onClick={onConfirm}
                    disabled={loading}
                    className="text-white"
                >
                    {loading ? <Spinner size={"sm"} /> : "Delete"}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default DeleteConfirmModal;
