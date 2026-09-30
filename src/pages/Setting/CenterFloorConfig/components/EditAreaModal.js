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
import { editArea } from "../../../../helpers/backend_helper";

const EditAreaModal = ({ isOpen, toggle, area, onSuccess }) => {
  const [areaName, setAreaName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (area) {
      setAreaName(area.areaName || "");
    }
  }, [area]);

  const handleSubmit = async () => {
    const trimmed = areaName.trim();
    if (!trimmed) {
      toast.error("Area name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await editArea(area._id, { areaName: trimmed });
      toast.success(res?.data?.message || "Area updated successfully");
      onSuccess && onSuccess();
      toggle();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to update area";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Edit Area</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label className="small text-muted mb-1">Area Name</Label>
          <Input
            type="text"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
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

export default EditAreaModal;
