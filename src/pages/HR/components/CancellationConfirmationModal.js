import React, { useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner,
    Input,
} from "reactstrap";

const CancelLeaveModal = ({ show, onClose, onConfirm, loading }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    return (
        <Modal isOpen={show} toggle={!loading ? onClose : undefined} centered>

            {/* Header */}
            <ModalHeader toggle={!loading ? onClose : undefined}>
                Confirm Cancellation
            </ModalHeader>

            {/* Body */}
            <ModalBody className="text-center">
                <h5>Are you sure you want to cancel this leave?</h5>

                <Input
                    type="textarea"
                    placeholder="Enter reason..."
                    className="mt-3"
                    value={reason}
                    invalid={!!error}
                    onChange={(e) => {
                        setReason(e.target.value);
                        if (error) setError("");
                    }}
                    disabled={loading}
                />

                {error && <div className="text-danger mt-1">{error}</div>}
            </ModalBody>


            {/* Footer (EXACT SAME AS REFERENCE) */}
            <ModalFooter className="justify-content-end">
                <Button
                    color="secondary"
                    onClick={onClose}
                    disabled={loading}
                >
                    No
                </Button>

                <Button
                    color="danger"
                    onClick={() => {
                        if (!reason.trim()) {
                            setError("Reason is required");
                            return;
                        }
                        onConfirm(reason);
                    }}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner size="sm"/>
                        </>
                    ) : (
                        "Yes, Cancel"
                    )}
                </Button>
            </ModalFooter>

        </Modal>
    );
};

export default CancelLeaveModal;