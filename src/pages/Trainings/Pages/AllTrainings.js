import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CardBody,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  Card,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import { getAllTrainings } from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import EditTrainingModal from "../Components/EditTrainingModal";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { getAudienceLabels } from "../Helpers/adminTrainingHelpers";

const roleBadgeColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6"];

const AllTrainings = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [activeTab, setActiveTab] = useState("active");
  const [editTraining, setEditTraining] = useState(null);
  const [fileModal, setFileModal] = useState({ open: false, file: null });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const hasWritePermission = hasPermission(
    "TRAININGS",
    "ALL_TRAININGS",
    "WRITE",
  );
  const hasDeletePermission = hasPermission(
    "TRAININGS",
    "ALL_TRAININGS",
    "DELETE",
  );
  const canEdit = hasWritePermission || hasDeletePermission;
  const limit = 5;

  const loadTrainings = async (pageNum = 1, tab = activeTab) => {
    try {
      setLoading(true);
      const response = await getAllTrainings({
        page: pageNum,
        limit,
        status: tab,
        ...(appliedFrom && { from: appliedFrom }),
        ...(appliedTo && { to: appliedTo }),
      });
      setTrainings(response?.data || []);
      setPagination(response?.pagination || {});
    } catch {
      toast.error("Failed to load trainings");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    loadTrainings(1, tab);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadTrainings(newPage);
  };

  const handleApplyFilter = () => {
    setAppliedFrom(from);
    setAppliedTo(to);
  };

  const handleClearDates = () => {
    setFrom("");
    setTo("");
    setAppliedFrom("");
    setAppliedTo("");
  };

  useEffect(() => {
    loadTrainings();
  }, [appliedFrom, appliedTo]);

  const file = fileModal.file;
  const isOfficeFile = /\.(docx?|pptx?)$/i.test(
    file?.originalName || file?.name || "",
  );

  return (
    <CardBody
      className="p-4 bg-white"
      style={{
        width: isMobile ? "100%" : "78%",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0" style={{ color: "#111827" }}>
          All Trainings
        </h4>
        <span className="text-muted small">
          {pagination.totalCount || 0} total
        </span>
      </div>

      <Nav tabs className="mb-4">
        {["active", "inactive"].map((tab) => (
          <NavItem key={tab}>
            <NavLink
              className={
                activeTab === tab ? "active fw-semibold" : "text-muted"
              }
              style={{ cursor: "pointer", textTransform: "capitalize" }}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <div className="d-flex gap-2 flex-wrap mb-4">
        <input
          type="date"
          className="form-control"
          style={{ width: 160 }}
          value={from}
          max={to || undefined}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="form-control"
          style={{ width: 160 }}
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" onClick={handleApplyFilter}>
          Apply
        </button>
        {(appliedFrom || appliedTo) && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleClearDates}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      ) : trainings.length === 0 ? (
        <p className="text-muted text-center py-5">
          No {activeTab} trainings found.
        </p>
      ) : (
        <>
          {trainings.map((training) => {
            const tFile = training.files?.[0];
            return (
              <Card key={training._id} className="mb-3">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                      <h6
                        className="fw-bold mb-1"
                        style={{
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {training.trainingName}
                      </h6>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <small className="text-muted">
                          Author: {training.author?.name}
                        </small>
                        <span className="text-muted">·</span>
                        <small className="text-muted">
                          {new Date(training.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </small>
                        {training.repeatFrequency && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              background: "#fff7ed",
                              color: "#c2410c",
                              border: "1px solid #fed7aa",
                            }}
                          >
                            Every {training.repeatFrequency}d
                          </span>
                        )}
                        {getAudienceLabels(training).map((label, idx) => (
                          <span
                            key={label}
                            style={{
                              padding: "2px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              background:
                                roleBadgeColors[idx % roleBadgeColors.length] +
                                "18",
                              color:
                                roleBadgeColors[idx % roleBadgeColors.length],
                              border: `1px solid ${roleBadgeColors[idx % roleBadgeColors.length]}30`,
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="d-flex gap-2 flex-shrink-0 ms-2">
                      <Button
                        color="secondary"
                        outline
                        size="sm"
                        title="Open the attendee progress"
                        onClick={() =>
                          navigate(
                            `/trainings/all/${training._id}?tab=progress`,
                            {
                              state: { from: "all" },
                            },
                          )
                        }
                      >
                        <i className="ri-group-line me-1" />
                        {training.acknowledgedBy?.length || 0} acknowledged
                      </Button>
                      <Button
                        color="primary"
                        size="sm"
                        onClick={() =>
                          navigate(`/trainings/all/${training._id}`, {
                            state: { from: "all" },
                          })
                        }
                      >
                        <i className="ri-eye-line me-1" /> View details
                      </Button>
                      {canEdit && (
                        <Button
                          color="primary"
                          outline
                          size="sm"
                          onClick={() => setEditTraining(training)}
                        >
                          <i className="ri-edit-line me-1" /> Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  {tFile && (
                    <Button
                      color="primary"
                      outline
                      size="sm"
                      className="mb-2"
                      onClick={() => setFileModal({ open: true, file: tFile })}
                    >
                      View File
                    </Button>
                  )}
                </CardBody>
              </Card>
            );
          })}

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(page - 1)}
              >
                ← Previous
              </button>
              <span className="text-muted small">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={fileModal.open}
        toggle={() => setFileModal({ open: false, file: null })}
        size="xl"
        centered
      >
        <ModalHeader toggle={() => setFileModal({ open: false, file: null })}>
          {file?.originalName || file?.name}
        </ModalHeader>
        <ModalBody>
          {file?.type === "application/pdf" && (
            <object
              data={file.url}
              type="application/pdf"
              width="100%"
              height="600px"
              style={{ border: "none" }}
            >
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm"
              >
                Open PDF
              </a>
            </object>
          )}
          {file?.type?.startsWith("image/") && (
            <img
              src={file?.url}
              alt={file?.originalName}
              className="img-fluid"
            />
          )}
          {isOfficeFile && (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="Document Viewer"
            />
          )}
          {!file?.type?.startsWith("image/") &&
            file?.type !== "application/pdf" &&
            !isOfficeFile && (
              <p className="text-muted text-center py-5">
                Preview not available for this file type
              </p>
            )}
        </ModalBody>
        <ModalFooter>
          <a
            href={file?.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
          >
            Download
          </a>
          <Button
            color="secondary"
            size="sm"
            onClick={() => setFileModal({ open: false, file: null })}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <EditTrainingModal
        isOpen={!!editTraining}
        training={editTraining}
        onClose={() => setEditTraining(null)}
        onRefresh={() => loadTrainings(page)}
      />
    </CardBody>
  );
};

export default AllTrainings;
