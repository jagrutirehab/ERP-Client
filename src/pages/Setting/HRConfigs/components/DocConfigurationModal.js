import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Alert,
  Spinner,
} from "reactstrap";
import {
  postEmployeeDocsConfiguration,
  getEmployeeDocsConfiguration,
  getDocuments,
} from "../../../../helpers/backend_helper";
import { toast } from "react-toastify";

const DocConfigurationModal = ({ isOpen, toggle, position, onSuccess }) => {
  const [docsList, setDocsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState({});
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !position?._id) return;

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [docsRes, configRes] = await Promise.all([
          getDocuments(),
          getEmployeeDocsConfiguration(position._id),
        ]);

        const list = docsRes?.data || [];
        const existingDocs = configRes?.data || [];

        const existingMap = existingDocs.reduce(
          (acc, d) => ({ ...acc, [d.document]: d.markMandatory }),
          {},
        );

        setDocsList(list);
        setSelections(
          list.reduce((acc, d) => {
            const isExisting = Object.prototype.hasOwnProperty.call(
              existingMap,
              d._id,
            );
            return {
              ...acc,
              [d._id]: {
                selected: isExisting,
                markMandatory: isExisting ? !!existingMap[d._id] : false,
              },
            };
          }, {}),
        );
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

    fetchAll();
  }, [isOpen, position]);

  const handleSelectChange = (id, checked) => {
    setSelections((prev) => ({
      ...prev,
      [id]: {
        selected: checked,
        markMandatory: checked ? prev[id]?.markMandatory : false,
      },
    }));
  };

  const handleMandatoryChange = (id, checked) => {
    setSelections((prev) => ({
      ...prev,
      [id]: { ...prev[id], markMandatory: checked },
    }));
  };

  const handleSelectAll = (checked) => {
    setSelections((prev) => {
      const updated = {};
      docsList.forEach((d) => {
        updated[d._id] = {
          selected: checked,
          markMandatory: checked ? prev[d._id]?.markMandatory || false : false,
        };
      });
      return updated;
    });
  };

  const resetAndClose = () => {
    setSearch("");
    setError("");
    toggle();
  };

  const handleSubmit = async () => {
    setError("");

    const requiredDocs = docsList
      .filter((d) => selections[d._id]?.selected)
      .map((d) => ({
        document: d._id,
        docName: d.docName,
        markMandatory: !!selections[d._id]?.markMandatory,
      }));

    if (requiredDocs.length === 0) {
      setError("Select at least one document");
      return;
    }

    setSubmitting(true);
    try {
      const res = await postEmployeeDocsConfiguration({
        position: position._id,
        requiredDocs,
      });

      onSuccess && onSuccess(res.data);
      resetAndClose();

      toast.success(
        res?.data?.message || "Document Configuration Saved Successfully.",
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to save configuration";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDocs = docsList.filter((d) =>
    d.docName.toLowerCase().includes(search.toLowerCase()),
  );

  const allSelected =
    docsList.length > 0 && docsList.every((d) => selections[d._id]?.selected);

  const selectedCount = docsList.filter(
    (d) => selections[d._id]?.selected,
  ).length;

  return (
    <Modal isOpen={isOpen} toggle={resetAndClose} centered size="lg">
      <style>{`
        .doc-toggle {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 22px;
          flex-shrink: 0;
        }
        .doc-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .doc-toggle-slider {
          position: absolute;
          inset: 0;
          background-color: #dee2e6;
          transition: background-color 0.25s ease;
          border-radius: 34px;
          cursor: pointer;
        }
        .doc-toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: #fff;
          transition: transform 0.25s ease;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        }
        .doc-toggle input:checked + .doc-toggle-slider {
          background-color: #0d6efd;
        }
        .doc-toggle input:checked + .doc-toggle-slider:before {
          transform: translateX(20px);
        }
        .doc-toggle input:disabled + .doc-toggle-slider {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .doc-row {
          display: grid;
          grid-template-columns: 24px 1fr 76px 42px;
          align-items: center;
          gap: 14px;
          padding: 10px 4px;
          border-bottom: 1px solid #f1f3f5;
        }
        .doc-row:last-child {
          border-bottom: none;
        }
      `}</style>

      <ModalHeader toggle={resetAndClose}>
        Configure Documents{" "}
        {position?.positionName ? `— ${position.positionName}` : ""}
      </ModalHeader>

      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}

        {loading ? (
          <div className="d-flex align-items-center gap-2 py-4">
            <Spinner size="sm" color="primary" />
            <span className="text-muted small">Loading documents...</span>
          </div>
        ) : docsList.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted small mb-0">
              No documents available. Add documents in Document Configuration
              first.
            </p>
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
              <div className="position-relative flex-grow-1">
                <i
                  className="ri-search-line position-absolute text-muted"
                  style={{
                    left: 10,
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
                  style={{ paddingLeft: 30, fontSize: 13 }}
                />
              </div>
              <span
                className="text-muted flex-shrink-0"
                style={{ fontSize: 12, whiteSpace: "nowrap" }}
              >
                {selectedCount} selected
              </span>
            </div>

            <div
              className="doc-row"
              style={{ borderBottom: "2px solid #e9ecef" }}
            >
              <Input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="fw-semibold small text-muted">Document</span>
              <span className="fw-semibold small text-muted">Mandatory</span>
              <span />
            </div>

            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {filteredDocs.length === 0 ? (
                <p className="text-muted small text-center py-3 mb-0">
                  No documents match "{search}"
                </p>
              ) : (
                filteredDocs.map((doc) => {
                  const sel = selections[doc._id] || {
                    selected: false,
                    markMandatory: false,
                  };
                  return (
                    <div className="doc-row" key={doc._id}>
                      <Input
                        type="checkbox"
                        checked={sel.selected}
                        onChange={(e) =>
                          handleSelectChange(doc._id, e.target.checked)
                        }
                      />
                      <span
                        className="small"
                        style={{ opacity: sel.selected ? 1 : 0.6 }}
                      >
                        {doc.docName}
                      </span>
                      <span
                        className="text-muted"
                        style={{
                          fontSize: 11,
                          opacity: sel.selected ? 1 : 0.4,
                        }}
                      >
                        {sel.markMandatory ? "Required" : "Optional"}
                      </span>
                      <label className="doc-toggle">
                        <input
                          type="checkbox"
                          checked={sel.markMandatory}
                          disabled={!sel.selected}
                          onChange={(e) =>
                            handleMandatoryChange(doc._id, e.target.checked)
                          }
                        />
                        <span className="doc-toggle-slider" />
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" outline onClick={resetAndClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={submitting || loading}
        >
          {submitting ? (
            <span className="d-inline-flex align-items-center justify-content-center gap-1">
              <Spinner size="sm" /> Saving...
            </span>
          ) : (
            "Save Configuration"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DocConfigurationModal;
