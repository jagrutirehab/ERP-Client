import React, { useState } from "react";
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
import { addFloors } from "../../../../helpers/backend_helper";

const AddFloorsModal = ({ isOpen, toggle, onSuccess }) => {
  const [rows, setRows] = useState([{ floorName: "" }]);
  const [submitting, setSubmitting] = useState(false);

  const handleFloorChange = (index, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { floorName: value } : row)),
    );
  };

  const addFloorField = () => setRows((prev) => [...prev, { floorName: "" }]);

  const removeFloorField = (index) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const resetAndClose = () => {
    setRows([{ floorName: "" }]);
    toggle();
  };

  const handleSubmit = async () => {
    const floors = rows
      .map((r) => ({ floorName: r.floorName.trim() }))
      .filter((r) => r.floorName.length > 0);

    if (floors.length === 0) {
      toast.error("Add at least one floor name");
      return;
    }

    const uniqueNames = new Set(floors.map((f) => f.floorName));
    if (uniqueNames.size !== floors.length) {
      toast.error("Duplicate floor names in this form");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addFloors({ floors });
      toast.success(res?.data?.message || "Floors added successfully");
      onSuccess && onSuccess();
      resetAndClose();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to add floors";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={resetAndClose} centered>
      <ModalHeader toggle={resetAndClose}>Add Floors</ModalHeader>
      <ModalBody>
        {rows.map((row, index) => (
          <FormGroup key={index} className="d-flex align-items-center gap-2">
            <div className="flex-grow-1">
              <Label className="small text-muted mb-1">Floor {index + 1}</Label>
              <Input
                type="text"
                placeholder="e.g. Floor 1"
                value={row.floorName}
                onChange={(e) => handleFloorChange(index, e.target.value)}
              />
            </div>
            {rows.length > 1 && (
              <Button
                color="link"
                className="text-danger p-0 mt-4"
                onClick={() => removeFloorField(index)}
              >
                <i className="ri-close-line" />
              </Button>
            )}
          </FormGroup>
        ))}
        <Button color="link" size="sm" className="px-0" onClick={addFloorField}>
          + Add another floor
        </Button>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={resetAndClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <span className="d-inline-flex align-items-center justify-content-center gap-1">
              <Spinner size="sm" /> Saving...
            </span>
          ) : (
            "Save Floors"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddFloorsModal;
