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
import { editESICRecord } from "../../../../helpers/backend_helper";
import ESICAttachmentPicker from "../components/ESICAttachmentPicker";

const EditESICModal = ({ record, isOpen, toggle, onSuccess }) => {
  const [description, setDescription] = useState(record.description || "");
  const [removedPaths, setRemovedPaths] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const existingFiles = (record.files || []).filter(
    (file) => !removedPaths.includes(file.path),
  );
  const totalFiles = existingFiles.length + newFiles.length;

  const handleSubmit = async () => {
    if (totalFiles === 0) {
      toast.error("At least one file is required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("description", description.trim());
      formData.append("removeFilePaths", JSON.stringify(removedPaths));
      newFiles.forEach((file) => formData.append("files", file));

      const response = await editESICRecord(record._id, formData);
      toast.success(response.message || "ESIC record updated successfully");
      onSuccess();
    } catch (error) {
      toast.error(error?.message || "Failed to update ESIC record");
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
      <ModalHeader toggle={toggle}>Edit ESIC Record</ModalHeader>
      <ModalBody>
        <Label className="fw-semibold">Description (optional)</Label>
        <Input
          type="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={submitting}
        />

        <Label className="fw-semibold mt-3 d-block">Files</Label>
        <ESICAttachmentPicker
          existingFiles={existingFiles}
          newFiles={newFiles}
          onAddFiles={(added) => setNewFiles((prev) => [...prev, ...added])}
          onRemoveExisting={(file) =>
            setRemovedPaths((prev) => [...prev, file.path])
          }
          onRemoveNew={(index) =>
            setNewFiles((prev) => prev.filter((_, i) => i !== index))
          }
          disabled={submitting}
        />
        {totalFiles === 0 && (
          <p className="text-danger small mt-1 mb-0">
            At least one file is required.
          </p>
        )}
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
          color="primary"
          onClick={handleSubmit}
          disabled={submitting || totalFiles === 0}
        >
          {submitting ? <Spinner size="sm" /> : "Save Changes"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditESICModal;
