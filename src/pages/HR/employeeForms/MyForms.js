import React, { useEffect, useState, useCallback, useMemo } from "react";
import Select from "react-select";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { toast } from "react-toastify";
import { getMyEmploymentForms } from "../../../helpers/backend_helper";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";

const FILE_TYPE_OPTIONS = [
  { value: "Form26AS", label: "Form 26AS" },
  { value: "TDS", label: "TDS" },
  { value: "Form16", label: "Form 16" },
  { value: "Payslip", label: "Payslip" },
];

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((m) => ({ value: m, label: m }));

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

const renderPreviewContent = (file) => {
  if (!file) return null;

  const name = file?.originalName || file?.name || "";
  const url = file?.url || "";

  const isPdf =
    file?.type === "application/pdf" ||
    name.toLowerCase().endsWith(".pdf") ||
    url.toLowerCase().includes(".pdf");

  const isImage =
    file?.type?.startsWith("image/") ||
    /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name || url);

  const isWord =
    name.toLowerCase().endsWith(".doc") || name.toLowerCase().endsWith(".docx");

  if (isPdf) {
    return (
      <iframe
        src={url}
        width="100%"
        height="600px"
        style={{ border: "none" }}
        title={name}
      />
    );
  }

  if (isImage) {
    return <img src={url} alt={name} className="img-fluid d-block mx-auto" />;
  }

  if (isWord) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
        width="100%"
        height="600px"
        style={{ border: "none" }}
        title="Document Viewer"
      />
    );
  }

  return (
    <p className="text-muted text-center py-5">
      Preview not available for this file type.
    </p>
  );
};

const MyForms = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [filters, setFilters] = useState({
    fileType: null,
    year: null,
    month: null,
  });
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const loadMyForms = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await getMyEmploymentForms(params);
      setData(response?.data?.payload || response?.payload || []);
    } catch {
      toast.error("Failed to load your forms.");
    } finally {
      setLoading(false);
    }
  }, []);

  const buildParams = useCallback(() => {
    const params = {};
    if (filters.fileType) params.fileType = filters.fileType.value;
    if (filters.year) params.year = filters.year.value;
    if (filters.month) params.month = filters.month.value;
    return params;
  }, [filters]);

  useEffect(() => {
    loadMyForms(buildParams());
  }, [filters]);

  const handleFilterChange = (key, opt) =>
    setFilters((prev) => ({ ...prev, [key]: opt }));

  const handleReset = () => {
    setFilters({ fileType: null, year: null, month: null });
  };

  const hasActiveFilters = filters.fileType || filters.year || filters.month;

  const groupedByType = data.reduce((acc, entry) => {
    const key = entry?.fileType || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <>
      <CardBody
        className="p-4 bg-white"
        style={isMobile ? { width: "100%" } : { width: "78%" }}
      >
        <div className="mb-4 pb-3 border-bottom">
          <h4 className="fw-bold mb-0" style={{ color: "#111827" }}>
            My Forms
          </h4>
          <p className="text-muted small mt-1 mb-0">
            Your uploaded documents/forms.
          </p>
        </div>

        <Row className="g-3 mb-4 align-items-center">
          <Col md={3}>
            <Select
              placeholder="Form Type"
              isClearable
              options={FILE_TYPE_OPTIONS}
              classNamePrefix="react-select"
              value={filters.fileType}
              onChange={(opt) => handleFilterChange("fileType", opt)}
            />
          </Col>
          <Col md={3}>
            <Select
              placeholder="Year"
              isClearable
              options={YEAR_OPTIONS}
              classNamePrefix="react-select"
              value={filters.year}
              onChange={(opt) => handleFilterChange("year", opt)}
            />
          </Col>
          <Col md={3}>
            <Select
              placeholder="Month"
              isClearable
              options={MONTH_OPTIONS}
              classNamePrefix="react-select"
              value={filters.month}
              onChange={(opt) => handleFilterChange("month", opt)}
            />
          </Col>
          {hasActiveFilters && (
            <Col md={2}>
              <Button color="secondary" outline size="sm" onClick={handleReset}>
                Reset
              </Button>
            </Col>
          )}
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : data.length === 0 ? (
          <div
            className="text-center py-5 rounded"
            style={{ background: "#f9fafb", border: "1px dashed #d1d5db" }}
          >
            <svg
              className="mx-auto d-block mb-3"
              width="36"
              height="36"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#9ca3af"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="fw-semibold mb-1" style={{ color: "#374151" }}>
              {hasActiveFilters
                ? "No forms match the selected filters."
                : "No forms found"}
            </p>
            <p className="text-muted small mb-0">
              {hasActiveFilters
                ? "Try adjusting or resetting the filters."
                : "Your uploaded forms will appear here."}
            </p>
          </div>
        ) : (
          Object.entries(groupedByType).map(([fileType, entries]) => (
            <Card
              key={fileType}
              className="mb-4"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <CardHeader
                className="d-flex align-items-center justify-content-between py-3 px-4"
                style={{
                  background: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <span
                  className="fw-semibold"
                  style={{ fontSize: 14, color: "#111827" }}
                >
                  {fileType}
                </span>
              </CardHeader>

              <CardBody className="p-0">
                {entries.map((entry, idx) => (
                  <div
                    key={entry?._id || idx}
                    className="px-4 py-3"
                    style={{
                      borderBottom:
                        idx !== entries.length - 1
                          ? "1px solid #f3f4f6"
                          : "none",
                    }}
                  >
                    <Row className="align-items-center g-2">
                      <Col md={2} xs={6}>
                        <div
                          className="text-muted mb-1"
                          style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Year
                        </div>
                        <div
                          className="fw-semibold"
                          style={{ fontSize: 14, color: "#111827" }}
                        >
                          {entry?.year || "—"}
                        </div>
                      </Col>

                      {entry?.month && (
                        <Col md={2} xs={6}>
                          <div
                            className="text-muted mb-1"
                            style={{
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Month
                          </div>
                          <div
                            className="fw-semibold"
                            style={{ fontSize: 14, color: "#111827" }}
                          >
                            {entry.month}
                          </div>
                        </Col>
                      )}

                      <Col md={entry?.month ? 4 : 6} xs={12}>
                        <div
                          className="text-muted mb-1"
                          style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Document
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {entry?.files?.map((file) => (
                            <span
                              key={file?._id}
                              className="text-truncate d-inline-block"
                              title={file?.originalName || file?.name}
                              style={{
                                maxWidth: 220,
                                fontSize: 13,
                                color: "#374151",
                                background: "#f3f4f6",
                                border: "1px solid #e5e7eb",
                                borderRadius: 5,
                                padding: "3px 10px",
                              }}
                            >
                              {file?.originalName || file?.name || "File"}
                            </span>
                          ))}
                        </div>
                      </Col>

                      <Col md={4} xs={12}>
                        <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                          {entry?.files?.map((file) => (
                            <div key={file?._id} className="d-flex gap-1">
                              <Button
                                size="sm"
                                outline
                                color="secondary"
                                style={{ fontSize: 12 }}
                                onClick={() => setPreviewFile(file)}
                              >
                                View
                              </Button>
                              <a
                                href={file?.url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-secondary"
                                style={{ fontSize: 12 }}
                              >
                                Download
                              </a>
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </div>
                ))}
              </CardBody>
            </Card>
          ))
        )}
      </CardBody>

      <Modal
        isOpen={!!previewFile}
        toggle={() => setPreviewFile(null)}
        size="xl"
        centered
      >
        <ModalHeader toggle={() => setPreviewFile(null)}>
          {previewFile?.originalName || previewFile?.name}
        </ModalHeader>
        <ModalBody>{renderPreviewContent(previewFile)}</ModalBody>
        <ModalFooter>
          <a
            href={previewFile?.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
          >
            Download
          </a>
          <Button
            color="secondary"
            size="sm"
            onClick={() => setPreviewFile(null)}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default MyForms;
