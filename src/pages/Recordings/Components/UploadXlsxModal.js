import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";

const UploadXlsxModal = ({ isOpen, toggle, onUpload, loading }) => {

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (!selected.name.endsWith(".xlsx") && !selected.name.endsWith(".xls")) {
      toast.error("Please upload a valid XLSX file");
      return;
    }

    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    onUpload(file); 
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        Upload XLSX File
      </ModalHeader>

      <ModalBody className="text-center">

        <div style={{ fontSize: "60px" }}>
          ☁️
        </div>

        <p className="mt-2">
          Select an Excel file
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          className="form-control"
          onChange={handleFileChange}
        />

        {file && (
          <p className="text-success mt-2">
            {file.name}
          </p>
        )}

      </ModalBody>

      <ModalFooter>

        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>

        <Button color="primary" onClick={handleUpload} disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Upload"}
        </Button>

      </ModalFooter>
    </Modal>
  );
};

export default UploadXlsxModal;