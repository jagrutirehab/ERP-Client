import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Row, Spinner, Button } from "reactstrap";
import { toast } from "react-toastify";
import DocPreview from "./DocPreview";
import UploadDocumentModal from "./UploadDocumentModal";
import DeleteFileConfirmModal from "./DeleteFileConfirmModal";
import {
  getEmployeeDocumentFields,
  getEmployeeDocumentFieldsByEmployeeId,
} from "../../../helpers/backend_helper";

const PositionDocumentsCard = ({ employeeId }) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = employeeId
        ? await getEmployeeDocumentFieldsByEmployeeId(employeeId)
        : await getEmployeeDocumentFields();
      setFields(res?.data?.data || res?.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch document fields";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const openUploadModal = (documentId, docName) => {
    setActiveDocument({ documentId, docName });
    setModalOpen(true);
  };

  const openDeleteModal = (documentId, file) => {
    setSelectedFile({ documentId, fileId: file._id, fileName: file.fileName });
    setDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h5 className="mb-0">Additional Documents</h5>
        </CardHeader>
        <CardBody className="text-center py-4">
          <Spinner />
        </CardBody>
      </Card>
    );
  }

  if (fields.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h5 className="mb-0">Additional Documents</h5>
      </CardHeader>
      <CardBody>
        {fields.map((field) => {
          return (
            <div key={field.document} className="mb-4 pb-3 border-bottom">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <p className="fw-semibold mb-0">
                    {field.docName}
                    {field.markMandatory && (
                      <span className="text-danger ms-1">*</span>
                    )}
                  </p>
                  {field.legacy && (
                    <p className="text-muted small mb-0">
                      <i className="ri-information-line me-1" />
                      Retained from a previous position assignment.
                    </p>
                  )}
                </div>
                {!field.legacy && (
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() =>
                      openUploadModal(field.document, field.docName)
                    }
                  >
                    <i className="ri-upload-2-line me-1" />
                    {field.files.length > 0 ? "Upload More" : "Upload"}
                  </Button>
                )}
              </div>

              {field.files.length === 0 ? (
                <div className="border rounded p-3 text-center text-muted bg-light small">
                  No documents uploaded
                </div>
              ) : (
                <Row>
                  {field.files.map((file, index) => (
                    <DocPreview
                      key={file._id || index}
                      label={field.docName}
                      url={file.fileUrl}
                      detail={file.fileName}
                      status={file.status}
                      remarks={file.remarks}
                      uploadedAt={file.uploadedAt}
                      actionedAt={file.actionedAt}
                      onDelete={
                        file.status !== "verified"
                          ? () => openDeleteModal(field.document, file)
                          : undefined
                      }
                    />
                  ))}
                </Row>
              )}
            </div>
          );
        })}
      </CardBody>

      <UploadDocumentModal
        isOpen={modalOpen}
        toggle={() => setModalOpen((prev) => !prev)}
        documentId={activeDocument?.documentId}
        docName={activeDocument?.docName}
        onSuccess={fetchFields}
      />

      <DeleteFileConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen((prev) => !prev)}
        documentId={selectedFile?.documentId}
        fileId={selectedFile?.fileId}
        fileName={selectedFile?.fileName}
        onSuccess={fetchFields}
      />
    </Card>
  );
};

export default PositionDocumentsCard;
