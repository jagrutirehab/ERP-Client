import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { FiUploadCloud, FiFileText } from "react-icons/fi";

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
        Upload Excel File
      </ModalHeader>

      <ModalBody>

        <div
          style={{
            border: "2px dashed #dee2e6",
            borderRadius: "10px",
            padding: "35px",
            textAlign: "center",
            background: "#fafafa",
            cursor: "pointer"
          }}
        >

          <FiUploadCloud size={45} color="#6c757d" />

          <h6 className="mt-3 mb-1">
            Upload XLSX File
          </h6>

          <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
            Choose an Excel file (.xlsx or .xls)
          </p>

          <input
            type="file"
            accept=".xlsx,.xls"
            className="form-control"
            onChange={handleFileChange}
          />

        </div>

        {file && (
          <div
            className="d-flex align-items-center justify-content-center mt-3 p-2"
            style={{
              border: "1px solid #e9ecef",
              borderRadius: "6px",
              background: "#f8f9fa"
            }}
          >
            <FiFileText size={18} className="me-2 text-success" />
            <span className="text-dark">{file.name}</span>
          </div>
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