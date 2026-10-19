import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Input,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import { esicAction } from "../../../../helpers/backend_helper";

const ESICActionModal = ({ record, actionType, isOpen, toggle, onSuccess }) => {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isApprove = actionType === "APPROVE";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await esicAction(record._id, {
        action: actionType,
        note: note.trim(),
      });
      toast.success(
        response.message ||
          (isApprove
            ? "ESIC record approved successfully"
            : "ESIC record rejected successfully"),
      );
      onSuccess();
    } catch (error) {
      toast.error(
        error?.message ||
          `Failed to ${isApprove ? "approve" : "reject"} ESIC record`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      backdrop="static"
      keyboard={false}
    >
      <ModalHeader toggle={toggle}>
        {isApprove ? "Approve" : "Reject"} ESIC Record
      </ModalHeader>
      <ModalBody>
        <p>
          {isApprove ? "Approve" : "Reject"} the ESIC record for{" "}
          <strong>{record.employee?.name}</strong> ({record.employee?.eCode})?
        </p>
        <Label className="fw-semibold">Note (Optional)</Label>
        <Input
          type="textarea"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={submitting}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          className="text-white"
          onClick={toggle}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          color={isApprove ? "success" : "danger"}
          className="text-white"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <Spinner size="sm" /> : isApprove ? "Approve" : "Reject"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ESICActionModal;
