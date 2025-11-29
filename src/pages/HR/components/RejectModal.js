import React, { useState } from "react";
import { toast } from "react-toastify";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Label,
    Input,
} from "reactstrap";

const RejectModal = ({ isOpen, toggle, onSubmit }) => {
    const [reason, setReason] = useState("");

    const handleReject = () => {
        if (!reason.trim()) {
            toast.error("Please enter a reason before rejecting.");
            return;
        }
        onSubmit(reason);
        setReason("");
        toggle();
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>
                Reject Request
            </ModalHeader>

            <ModalBody>
                <Label className="fw-bold">Reason for Rejection *</Label>
                <Input
                    type="textarea"
                    rows="4"
                    placeholder="Mention the reason for rejecting this request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" className="text-white" onClick={toggle}>
                    Cancel
                </Button>
                <Button color="danger" className="text-white" onClick={handleReject}>
                    Reject
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default RejectModal;
