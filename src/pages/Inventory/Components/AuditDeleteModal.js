import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";
import { deleteAudit } from "../../../store/features/pharmacy/pharmacySlice";

const AuditDeleteModal = ({ selectedAudit, setSelectedAudit, toggle, isOpen }) => {
    const dispatch = useDispatch();
    const [deleteLoading, setDeleteLoading] = useState(false);


    const handleDeleteAudit = async () => {
        if (!selectedAudit?.auditId) return;

        setDeleteLoading(true);

        try {
            await dispatch(deleteAudit({ _id: selectedAudit._id, status: "COMPLETED" })).unwrap();
            toast.success("Audit deleted successfully");
            toggle();
            setSelectedAudit(null);
        } catch (err) {
            toast.error("Failed to delete audit");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={() => !deleteLoading && toggle()} centered>
            <ModalHeader toggle={() => !deleteLoading && toggle()}>
                Confirm Delete
            </ModalHeader>

            <ModalBody>
                <p className="mb-1 fw-semibold">
                    Are you sure you want to delete this audit?
                </p>
            </ModalBody>

            <ModalFooter className="d-flex gap-2">
                <Button
                    color="secondary"
                    onClick={() => toggle()}
                    disabled={deleteLoading}
                >
                    Cancel
                </Button>

                <Button
                    color="danger"
                    disabled={deleteLoading}
                    onClick={handleDeleteAudit}
                >
                    {deleteLoading ? <Spinner size="sm" /> : "Delete"}
                </Button>
            </ModalFooter>
        </Modal >

    )
}

export default AuditDeleteModal