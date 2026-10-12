import { useEffect, useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner,
    FormGroup,
    Label,
    Input,
} from "reactstrap";
import { toast } from "react-toastify";
import { updateUtilityBill } from "../../../helpers/backend_helper";
import AttachmentPicker from "../Components/AttachmentPicker";

const EditBillModal = ({ isOpen, onClose, bill, onRefresh, onSubmittingChange }) => {
    const [comment, setComment] = useState("");
    const [newFiles, setNewFiles] = useState([]);
    const [removedPaths, setRemovedPaths] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && bill) {
            setComment(bill.comment || "");
            setNewFiles([]);
            setRemovedPaths([]);
        }
    }, [isOpen, bill]);

    const handleClose = () => {
        if (submitting) return;
        setComment("");
        setNewFiles([]);
        setRemovedPaths([]);
        onClose();
    };

    const existingFiles = (bill?.files || []).filter(
        (f) => !removedPaths.includes(f.path),
    );

    const handleSubmit = async () => {
        if (!bill) return;

        if (existingFiles.length === 0 && newFiles.length === 0) {
            toast.error("At least one file is required");
            return;
        }

        setSubmitting(true);
        onSubmittingChange?.(true);
        try {
            const formData = new FormData();
            formData.append("comment", comment || "");
            formData.append("removeFilePaths", JSON.stringify(removedPaths));
            newFiles.forEach((file) => formData.append("files", file));

            await updateUtilityBill(bill._id, formData);

            toast.success("Bill updated successfully");
            onRefresh();
            handleClose();
        } catch (error) {
            toast.error(error?.message || "Failed to update bill");
        } finally {
            setSubmitting(false);
            onSubmittingChange?.(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={handleClose} centered size="lg">
            <ModalHeader toggle={handleClose}>Edit Bill</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label className="fw-semibold">Comment</Label>
                    <Input
                        type="textarea"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={submitting}
                        rows={3}
                    />
                </FormGroup>

                <AttachmentPicker
                    existingFiles={existingFiles}
                    newFiles={newFiles}
                    onAddFiles={(files) => setNewFiles((prev) => [...prev, ...files])}
                    onRemoveExisting={(file) =>
                        setRemovedPaths((prev) => [...prev, file.path])
                    }
                    onRemoveNew={(i) =>
                        setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    disabled={submitting}
                />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Spinner size="sm" /> : "Save"}
                </Button>
                <Button
                    color="secondary"
                    outline
                    onClick={handleClose}
                    disabled={submitting}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditBillModal;
