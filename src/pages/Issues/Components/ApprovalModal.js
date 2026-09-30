import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const approvers = ["HEMANT", "SURJEET", "SHIVANI", "VIKAS"];

const ApprovalModal = ({ isOpen, toggle, issue, onSubmit }) => {
  const [approvedBy, setApprovedBy] = useState("");

  const handleSubmit = () => {
    if (!approvedBy) return;

    onSubmit({
      issueId: issue?._id,
      approvedBy,
    });

    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Approve Issue</ModalHeader>

      <ModalBody>
        <label className="form-label">Approved By</label>

        <select
          className="form-select"
          value={approvedBy}
          onChange={(e) => setApprovedBy(e.target.value)}
        >
          <option value="">Select Approver</option>
          {approvers.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </ModalBody>

      <ModalFooter>
        <Button color="success" onClick={handleSubmit}>
          Submit
        </Button>

        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ApprovalModal;