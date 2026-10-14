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
import { addAreas } from "../../../../helpers/backend_helper";

const AddAreasModal = ({ isOpen, toggle, onSuccess }) => {
  const [rows, setRows] = useState([{ areaName: "" }]);
  const [submitting, setSubmitting] = useState(false);

  const handleAreaChange = (index, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { areaName: value } : row)),
    );
  };

  const addAreaField = () => setRows((prev) => [...prev, { areaName: "" }]);

  const removeAreaField = (index) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const resetAndClose = () => {
    setRows([{ areaName: "" }]);
    toggle();
  };

  const handleSubmit = async () => {
    const areas = rows
      .map((r) => ({ areaName: r.areaName.trim() }))
      .filter((r) => r.areaName.length > 0);

    if (areas.length === 0) {
      toast.error("Add at least one area name");
      return;
    }

    const uniqueNames = new Set(areas.map((a) => a.areaName));
    if (uniqueNames.size !== areas.length) {
      toast.error("Duplicate area names in this form");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addAreas({ areas });
      toast.success(res?.data?.message || "Areas added successfully");
      onSuccess && onSuccess();
      resetAndClose();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to add areas";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={resetAndClose} centered>
      <ModalHeader toggle={resetAndClose}>Add Rooms &amp; Areas</ModalHeader>
      <ModalBody>
        {rows.map((row, index) => (
          <FormGroup key={index} className="d-flex align-items-center gap-2">
            <div className="flex-grow-1">
              <Label className="small text-muted mb-1">Area {index + 1}</Label>
              <Input
                type="text"
                placeholder="e.g. Kitchen, Bathroom, Room 101"
                value={row.areaName}
                onChange={(e) => handleAreaChange(index, e.target.value)}
              />
            </div>
            {rows.length > 1 && (
              <Button
                color="link"
                className="text-danger p-0 mt-4"
                onClick={() => removeAreaField(index)}
              >
                <i className="ri-close-line" />
              </Button>
            )}
          </FormGroup>
        ))}
        <Button color="link" size="sm" className="px-0" onClick={addAreaField}>
          + Add another area
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
            "Save Areas"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddAreasModal;
