import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    FormGroup,
    Label,
    Input
} from "reactstrap";

const ManagerApproveRejectModal = ({
    show,
    onClose,
    onConfirm,
    actionType,
    loading
}) => {
    const [note, setNote] = useState("");

    useEffect(() => {
        if (show) setNote("");
    }, [show]);

    const handleSubmit = () => {
        onConfirm(note);
    };

    return (
        <Modal isOpen={show} toggle={onClose} centered>
            <ModalHeader toggle={onClose}>
                {actionType === "approved" ? "Approve Request" : "Reject Request"}
            </ModalHeader>

            <ModalBody>
                <FormGroup>
                    <Label>Enter Note</Label>
                    <Input
                        type="textarea"
                        rows="3"
                        placeholder="Enter your note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </FormGroup>
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" onClick={onClose}>
                    No
                </Button>
                <Button
                    color={actionType === "approved" ? "success" : "danger"}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Yes"}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ManagerApproveRejectModal;