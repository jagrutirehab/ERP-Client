import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
  Badge,
  Table,
  Button,
  UncontrolledTooltip,
} from "reactstrap";

const DocumentListCard = ({
  loading,
  documents,
  filteredDocuments,
  search,
  setSearch,
  onAddClick,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-white border-bottom py-3 px-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 32,
                height: 32,
                background: "#e7f5ff",
                color: "#1971c2",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              <i className="ri-file-list-3-line" />
            </div>
            <div>
              <h6 className="mb-0 fw-semibold">Document Master</h6>
              <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                Manage the document types used across configurations
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {!loading && (
              <Badge color="secondary" pill>
                {search
                  ? `${filteredDocuments.length} of ${documents.length}`
                  : `${documents.length}`}{" "}
                documents
              </Badge>
            )}
            <Button color="primary" size="sm" onClick={onAddClick}>
              <i className="ri-add-line me-1" />
              Add Document
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-0 py-0">
        {loading ? (
          <div className="d-flex align-items-center gap-2 p-4">
            <Spinner size="sm" color="primary" />
            <span className="text-muted small">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-5">
            <i
              className="ri-file-list-3-line text-muted"
              style={{ fontSize: 32 }}
            />
            <p className="text-muted small mb-0 mt-2">No documents found</p>
            <Button
              color="primary"
              size="sm"
              className="mt-3"
              onClick={onAddClick}
            >
              Add your first document
            </Button>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-bottom position-relative">
              <i
                className="ri-search-line position-absolute text-muted"
                style={{
                  left: 26,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                  pointerEvents: "none",
                }}
              />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: 13, maxWidth: 360 }}
              />
            </div>
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              <Table hover className="mb-0" style={{ fontSize: 13 }}>
                <thead
                  style={{ background: "#f8f9fa", position: "sticky", top: 0 }}
                >
                  <tr>
                    <th
                      className="px-4 py-3 fw-semibold text-muted border-0"
                      style={{ width: 60 }}
                    >
                      #
                    </th>
                    <th className="px-4 py-3 fw-semibold text-muted border-0">
                      Document Name
                    </th>
                    <th
                      className="px-4 py-3 fw-semibold text-muted border-0 text-end"
                      style={{ width: 140 }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-center text-muted small"
                      >
                        No documents match "{search}"
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((doc, idx) => (
                      <tr key={doc._id}>
                        <td className="px-4 py-2 text-muted">{idx + 1}</td>
                        <td className="px-4 py-2 fw-medium">{doc.docName}</td>
                        <td className="px-4 py-2 text-end">
                          <span id={`edit-btn-${doc._id}`}>
                            <Button
                              color="link"
                              className={
                                doc.canEdit
                                  ? "text-primary p-1"
                                  : "text-muted p-1"
                              }
                              onClick={() => doc.canEdit && onEditClick(doc)}
                              disabled={!doc.canEdit}
                            >
                              <i className="ri-pencil-line" />
                            </Button>
                          </span>
                          {!doc.canEdit && (
                            <UncontrolledTooltip
                              target={`edit-btn-${doc._id}`}
                              placement="top"
                            >
                              {doc?.employeeCount} employee
                              {doc?.employeeCount > 1 ? "s have" : " has"}{" "}
                              already uploaded documents under this name
                            </UncontrolledTooltip>
                          )}
                          <Button
                            color="link"
                            className="text-danger p-1"
                            onClick={() => onDeleteClick(doc)}
                            title="Delete"
                          >
                            <i className="ri-delete-bin-line" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default DocumentListCard;
