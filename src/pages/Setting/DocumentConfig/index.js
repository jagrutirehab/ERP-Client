import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import { getDocuments } from "../../../helpers/backend_helper";
import DocumentListCard from "./components/DocumentListCard";
import AddDocumentsModal from "./components/AddDocumentsModal";
import EditDocumentModal from "./components/EditDocumentModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

const DocumentConfig = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await getDocuments();
      setDocuments(res?.data || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch documents";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc) =>
    doc.docName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEditClick = (doc) => {
    setSelectedDocument(doc);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (doc) => {
    setSelectedDocument(doc);
    setDeleteModalOpen(true);
  };

  return (
    <div className="container-fluid px-3 py-4">
      <div className="mb-4">
        <h4 className="fw-semibold mb-1">Document Configuration</h4>
        <p className="text-muted small mb-0">
          Manage the document types available for position configurations
        </p>
      </div>

      <Row>
        <Col xs={12}>
          <DocumentListCard
            loading={loading}
            documents={documents}
            filteredDocuments={filteredDocuments}
            search={search}
            setSearch={setSearch}
            onAddClick={() => setAddModalOpen(true)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </Col>
      </Row>

      <AddDocumentsModal
        isOpen={addModalOpen}
        toggle={() => setAddModalOpen((prev) => !prev)}
        onSuccess={fetchDocuments}
      />

      <EditDocumentModal
        isOpen={editModalOpen}
        toggle={() => setEditModalOpen((prev) => !prev)}
        document={selectedDocument}
        onSuccess={fetchDocuments}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen((prev) => !prev)}
        document={selectedDocument}
        onSuccess={fetchDocuments}
      />
    </div>
  );
};

export default DocumentConfig;
