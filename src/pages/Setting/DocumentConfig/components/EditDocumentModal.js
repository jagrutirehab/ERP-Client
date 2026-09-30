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
import { editDocument } from "../../../../helpers/backend_helper";

const EditDocumentModal = ({ isOpen, toggle, document, onSuccess }) => {
  const [docName, setDocName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (document) {
      setDocName(document.docName || "");
    }
  }, [document]);

  const handleSubmit = async () => {
    const trimmed = docName.trim();
    if (!trimmed) {
      toast.error("Document name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await editDocument(document._id, { docName: trimmed });
      toast.success(res?.data?.message || "Document updated successfully");
      onSuccess && onSuccess();
      toggle();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update document";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Edit Document</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label className="small text-muted mb-1">Document Name</Label>
          <Input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
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

export default EditDocumentModal;
