import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
  Label,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import { editFloor } from "../../../../helpers/backend_helper";

const EditFloorModal = ({ isOpen, toggle, floor, onSuccess }) => {
  const [floorName, setFloorName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (floor) {
      setFloorName(floor.floorName || "");
    }
  }, [floor]);

  const handleSubmit = async () => {
    const trimmed = floorName.trim();
    if (!trimmed) {
      toast.error("Floor name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await editFloor(floor._id, { floorName: trimmed });
      toast.success(res?.data?.message || "Floor updated successfully");
      onSuccess && onSuccess();
      toggle();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to update floor";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Edit Floor</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label className="small text-muted mb-1">Floor Name</Label>
          <Input
            type="text"
            value={floorName}
            onChange={(e) => setFloorName(e.target.value)}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <span className="d-inline-flex align-items-center justify-content-center gap-1">
              <Spinner size="sm" /> Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditFloorModal;
