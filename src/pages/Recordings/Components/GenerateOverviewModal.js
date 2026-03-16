import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";

const GenerateOverviewModal = ({
    isOpen,
    toggle,
    selectedRecording,
    onGenerate,
    loading
}) => {
    console.log("selectedRecording", selectedRecording);
    
    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>
                Generate AI Overview
            </ModalHeader>

            <ModalBody className="text-center">

                {selectedRecording?.Files?.recording_url && (
                    <audio controls style={{ width: "100%" }}>
                        <source src={selectedRecording?.Files?.recording_url} type="audio/mpeg" />
                    </audio>
                )}

                <div className="mt-4">
                    <p>
                        Do you want to generate the <b>AI overview</b> of this recording ❓
                    </p>
                </div>

            </ModalBody>

            <ModalFooter>

                <Button color="success" onClick={onGenerate} disabled={loading}>
                    {loading ? <Spinner size="sm" /> : "Yes"}
                </Button>

                <Button color="secondary" onClick={toggle}>
                    No
                </Button>

            </ModalFooter>
        </Modal>
    );
};

export default GenerateOverviewModal;