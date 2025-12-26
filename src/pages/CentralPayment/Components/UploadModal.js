import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Spinner
} from "reactstrap";
import FileUpload from "./FileUpload";

const UploadModal = ({ isOpen, toggle, onUpload, loading }) => {
  const [files, setFiles] = useState([]);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setAttempted(false);
    }
  }, [isOpen]);

  const handleUpload = () => {
    setAttempted(true);
    if (!files.length) return;
    onUpload(files[0]);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md">
      <ModalHeader toggle={toggle}>
        Upload Transaction Proof
      </ModalHeader>

      <ModalBody>
        <FormGroup>
          <Label className="fw-medium">
            Attachment <span className="text-danger">*</span>
          </Label>

          <FileUpload
            multiple={false}
            files={files}
            setFiles={setFiles}
          />

          {attempted && !files.length && (
            <div className="invalid-feedback d-block mt-1">
              <i className="fas fa-exclamation-circle me-1"></i>
              Transaction proof is required
            </div>
          )}
        </FormGroup>
      </ModalBody>

      <ModalFooter>
        <Button
          outline
          onClick={toggle}
          disabled={loading}>
          Cancel
        </Button>

        <Button
          color="primary"
          className="text-white"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : "Upload"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UploadModal;
