// import React, { useState } from "react";
// import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Input } from "reactstrap";

// const CancellationRequest = ({ isOpen, toggle, onConfirm, loading }) => {
//     const [reason, setReason] = useState("");
//     return (
//         <Modal isOpen={isOpen} toggle={toggle} centered>
//             <ModalHeader toggle={toggle}>
//                 Cancel Leave
//             </ModalHeader>

//             <ModalBody className="text-center">
//                 <h5>Are you sure you want to cancel this leave?</h5>
//                 <Input
//                     type="textarea"
//                     placeholder="Enter reason..."
//                     className="mt-3"
//                     value={reason}
//                     onChange={(e) => setReason(e.target.value)}
//                     disabled={loading}
//                 />
//             </ModalBody>

//             <ModalFooter>
//                 <Button color="secondary" onClick={toggle}>
//                     No
//                 </Button>
//                 <Button color="danger" onClick={() => onConfirm(reason)}>
//                     {loading ? <Spinner size="sm" /> : "Yes"}
//                 </Button>
//             </ModalFooter>
//         </Modal>
//     );
// };

// export default CancellationRequest;

import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Input } from "reactstrap";

const CancellationRequest = ({ isOpen, toggle, onConfirm, loading }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>
                Cancel Leave
            </ModalHeader>

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

            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
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
                >
                    {loading ? <Spinner size="sm" /> : "Yes"}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default CancellationRequest;