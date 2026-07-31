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
import { addDocuments } from "../../../../helpers/backend_helper";

const AddDocumentsModal = ({ isOpen, toggle, onSuccess }) => {
  const [docs, setDocs] = useState([{ docName: "" }]);
  const [submitting, setSubmitting] = useState(false);

  const handleDocChange = (index, value) => {
    const updated = [...docs];
    updated[index].docName = value;
    setDocs(updated);
  };

  const addDocField = () => setDocs([...docs, { docName: "" }]);

  const removeDocField = (index) => {
    if (docs.length === 1) return;
    setDocs(docs.filter((_, i) => i !== index));
  };

  const resetAndClose = () => {
    setDocs([{ docName: "" }]);
    toggle();
  };

  const handleSubmit = async () => {
    const documents = docs
      .map((d) => ({ docName: d.docName.trim() }))
      .filter((d) => d.docName.length > 0);

    if (documents.length === 0) {
      toast.error("Add at least one document name");
      return;
    }

    const uniqueNames = new Set(documents.map((d) => d.docName));
    if (uniqueNames.size !== documents.length) {
      toast.error("Duplicate document names in this form");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addDocuments({ documents });
      toast.success(res?.data?.message || "Documents added successfully");
      onSuccess && onSuccess();
      resetAndClose();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to add documents";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={resetAndClose} centered>
      <ModalHeader toggle={resetAndClose}>Add Documents</ModalHeader>
      <ModalBody>
        {docs.map((doc, index) => (
          <FormGroup key={index} className="d-flex align-items-center gap-2">
            <div className="flex-grow-1">
              <Label className="small text-muted mb-1">
                Document {index + 1}
              </Label>
              <Input
                type="text"
                placeholder="e.g. Aadhar Card"
                value={doc.docName}
                onChange={(e) => handleDocChange(index, e.target.value)}
              />
            </div>
            {docs.length > 1 && (
              <Button
                color="link"
                className="text-danger p-0 mt-4"
                onClick={() => removeDocField(index)}
              >
                <i className="ri-close-line" />
              </Button>
            )}
          </FormGroup>
        ))}
        <Button color="link" size="sm" className="px-0" onClick={addDocField}>
          + Add another document
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
            "Save Documents"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddDocumentsModal;
