import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Card, CardBody, Badge, Row, Col, Spinner } from "reactstrap";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { fetchIncidentById } from "../../../store/features/incident/incidentSlice";

const IncidentDetailsModal = ({ incident, loading }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (incident?._id) {
      dispatch(fetchIncidentById(incident._id));
    }
  }, [incident?._id, dispatch]);

  const getStatusBadge = (status) => {
    const colorMap = {
      Raised: "warning",
      "Under Investigation": "info",
      "Pending Approval": "primary",
      Approved: "success",
      Rejected: "danger",
      Closed: "secondary",
    };
    return <Badge color={colorMap[status] || "secondary"}>{status}</Badge>;
  };

  const getStageStatus = (stageName) => {
    if (!incident) return "pending";

    const status = incident.status;
    const stageMap = {
      raise: {
        completed: [
          "Raised",
          "Under Investigation",
          "Pending Approval",
          "Approved",
          "Rejected",
          "Closed",
        ],
        current: ["Raised"],
      },
      investigation: {
        completed: ["Pending Approval", "Approved", "Rejected", "Closed"],
        current: ["Under Investigation"],
      },
      approval: {
        completed: ["Approved", "Rejected", "Closed"],
        current: ["Pending Approval"],
      },
      closure: {
        completed: ["Closed"],
        current: ["Approved"],
      },
    };

    const stage = stageMap[stageName];
    if (!stage) return "pending";

    if (stage.completed.includes(status)) return "completed";
    if (stage.current.includes(status)) return "current";
    return "pending";
  };

  const stages = [
    {
      name: "raise",
      title: "1. Raise Incident",
      icon: "ri-alert-line",
      data: {
        title: incident?.title,
        description: incident?.description,
        incidentType: incident?.incidentType,
        patientIncidentType: incident?.patientIncidentType,
        patientIncidentOther: incident?.patientIncidentOther,
        patient: incident?.patient,
        reporter: incident?.reporter,
        occurrenceDate: incident?.occurrenceDate,
        location: incident?.location,
        immediateAction: incident?.immediateAction,
        center: incident?.center,
        attachments: incident?.attachments,
        createdAt: incident?.createdAt,
      },
    },
    {
      name: "investigation",
      title: "2. Investigation",
      icon: "ri-search-line",
      data: incident?.investigation,
    },
    {
      name: "approval",
      title: "3. Approval",
      icon: "ri-checkbox-circle-line",
      data: incident?.approval,
    },
    {
      name: "closure",
      title: "4. Closure",
      icon: "ri-close-circle-line",
      data: incident?.closure,
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
      </div>
    );
  }

  const getStageIconStyle = (status) => {
    const baseStyle = {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      position: "relative",
      zIndex: 2,
      transition: "all 0.3s ease",
    };

    if (status === "completed") {
      return {
        ...baseStyle,
        background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
        color: "white",
        boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
      };
    } else if (status === "current") {
      return {
        ...baseStyle,
        background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
        color: "white",
        boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)",
        animation: "pulse 2s infinite",
      };
    } else {
      return {
        ...baseStyle,
        background: "#e9ecef",
        color: "#6c757d",
        border: "2px solid #dee2e6",
      };
    }
  };

  const getConnectorStyle = (status) => {
    const baseStyle = {
      width: "2px",
      height: "calc(100% + 1rem)",
      marginTop: "5px",
      position: "absolute",
      top: "50px",
      left: "25px",
      transform: "translateX(-50%)",
      zIndex: 1,
    };

    if (status === "completed") {
      return {
        ...baseStyle,
        background: "linear-gradient(to bottom, #28a745 0%, #20c997 100%)",
      };
    } else {
      return {
        ...baseStyle,
        background: "#e9ecef",
      };
    }
  };

  const getCardStyle = (isCurrent) => {
    return {
      borderLeft: "4px solid",
      borderLeftColor: isCurrent ? "#007bff" : "#28a745",
      transition: "all 0.3s ease",
      boxShadow: isCurrent ? "0 2px 10px rgba(0, 123, 255, 0.1)" : "none",
    };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{incident?.title || "Incident Details"}</h4>
          {incident?.status && getStatusBadge(incident.status)}
        </div>
        <div className="text-muted small">
          {/* <span>Incident ID: {incident?._id}</span> */}
          {incident?.createdAt && (
            <span className="ms-3">
              Created:{" "}
              {format(new Date(incident.createdAt), "MMM dd, yyyy HH:mm")}
            </span>
          )}
        </div>
      </div>

      {/* Stage Timeline */}
      <div className="mb-4" style={{ position: "relative" }}>
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.name);
          const isCompleted = status === "completed";
          const isCurrent = status === "current";
          const isPending = status === "pending";

          return (
            <div key={stage.name} className="stage-item mb-4">
              <div className="position-relative d-flex align-items-start">
                {/* Stage Icon */}
                <div className="stage-icon-wrapper me-3">
                  <div
                    style={getStageIconStyle(
                      isCompleted
                        ? "completed"
                        : isCurrent
                        ? "current"
                        : "pending"
                    )}
                  >
                    <i className={stage.icon}></i>
                  </div>
                  {index < stages.length - 1 && (
                    <div
                      style={getConnectorStyle(
                        isCompleted ? "completed" : "pending"
                      )}
                    ></div>
                  )}
                </div>

                {/* Stage Content */}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <h5
                      className={`mb-0 me-2 ${
                        isCompleted
                          ? "text-success"
                          : isCurrent
                          ? "text-primary"
                          : "text-muted"
                      }`}
                    >
                      {stage.title}
                    </h5>
                    {isCompleted && (
                      <Badge color="success" className="ms-2">
                        <i className="ri-check-line me-1"></i>Completed
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge color="primary" className="ms-2">
                        <i className="ri-time-line me-1"></i>Current
                      </Badge>
                    )}
                    {isPending && (
                      <Badge color="secondary" className="ms-2">
                        <i className="ri-time-line me-1"></i>Pending
                      </Badge>
                    )}
                  </div>

                  {/* Stage Data */}
                  {isCompleted || isCurrent ? (
                    <Card style={getCardStyle(isCurrent)}>
                      <CardBody>
                        {stage.name === "raise" && stage.data && (
                          <div>
                            <Row>
                              <Col md={6} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Incident Type
                                </strong>
                                <span>{stage.data.incidentType || "N/A"}</span>
                              </Col>
                              {stage.data.incidentType === "Patient" && (
                                <>
                                  <Col md={6} className="mb-3">
                                    <strong className="text-muted d-block mb-1">
                                      Patient Incident Type
                                    </strong>
                                    <span>
                                      {stage.data.patientIncidentType || "N/A"}
                                      {stage.data.patientIncidentOther &&
                                        ` - ${stage.data.patientIncidentOther}`}
                                    </span>
                                  </Col>
                                  <Col md={6} className="mb-3">
                                    <strong className="text-muted d-block mb-1">
                                      Patient
                                    </strong>
                                    <span>
                                      {stage.data.patient?.name || "N/A"}
                                      {stage.data.patient?.uid && (
                                        <span className="text-muted ms-2">
                                          (UID: {stage.data.patient.uid})
                                        </span>
                                      )}
                                    </span>
                                    {stage.data.patient?.ward && (
                                      <div className="text-muted small mt-1">
                                        Ward: {stage.data.patient.ward}
                                        {stage.data.patient?.bedNo &&
                                          ` | Bed: ${stage.data.patient.bedNo}`}
                                      </div>
                                    )}
                                  </Col>
                                </>
                              )}
                              <Col md={6} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Reporter
                                </strong>
                                <span>
                                  {stage.data.reporter?.name || "N/A"}
                                  {stage.data.reporter?.email && (
                                    <div className="text-muted small">
                                      {stage.data.reporter.email}
                                    </div>
                                  )}
                                </span>
                              </Col>
                              <Col md={6} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Occurrence Date
                                </strong>
                                <span>
                                  {stage.data.occurrenceDate
                                    ? format(
                                        new Date(stage.data.occurrenceDate),
                                        "MMM dd, yyyy HH:mm"
                                      )
                                    : "N/A"}
                                </span>
                              </Col>
                              <Col md={6} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Location
                                </strong>
                                <span>{stage.data.location || "N/A"}</span>
                              </Col>
                              <Col md={12} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Description
                                </strong>
                                <span>
                                  {stage.data.description || "No description"}
                                </span>
                              </Col>
                              {stage.data.immediateAction && (
                                <Col md={12} className="mb-3">
                                  <strong className="text-muted d-block mb-1">
                                    Immediate Action Taken
                                  </strong>
                                  <span>{stage.data.immediateAction}</span>
                                </Col>
                              )}
                              {stage.data.attachments &&
                                stage.data.attachments.length > 0 && (
                                  <Col md={12} className="mb-3">
                                    <strong className="text-muted d-block mb-2">
                                      Attachments
                                    </strong>
                                    <div className="d-flex flex-wrap gap-2">
                                      {stage.data.attachments.map(
                                        (att, idx) => (
                                          <a
                                            key={idx}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                          >
                                            <i className="ri-file-line me-1"></i>
                                            {att.originalName || att.name}
                                          </a>
                                        )
                                      )}
                                    </div>
                                  </Col>
                                )}
                              {stage.data.createdAt && (
                                <Col md={12}>
                                  <small className="text-muted">
                                    Submitted on:{" "}
                                    {format(
                                      new Date(stage.data.createdAt),
                                      "MMM dd, yyyy HH:mm"
                                    )}
                                  </small>
                                </Col>
                              )}
                            </Row>
                          </div>
                        )}

                        {stage.name === "investigation" && stage.data && (
                          <div>
                            <Row>
                              <Col md={6} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Investigated By
                                </strong>
                                <span>
                                  {stage.data.by?.name || "N/A"}
                                  {stage.data.by?.email && (
                                    <div className="text-muted small">
                                      {stage.data.by.email}
                                    </div>
                                  )}
                                </span>
                              </Col>
                              <Col md={12} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Findings
                                </strong>
                                <span>
                                  {stage.data.findings || "No findings"}
                                </span>
                              </Col>
                              <Col md={12} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Root Cause
                                </strong>
                                <span>
                                  {stage.data.rootCause || "No root cause"}
                                </span>
                              </Col>
                              <Col md={12} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Preventive Actions
                                </strong>
                                <span>
                                  {stage.data.preventiveActions ||
                                    "No preventive actions"}
                                </span>
                              </Col>
                              {stage.data.attachments &&
                                stage.data.attachments.length > 0 && (
                                  <Col md={12} className="mb-3">
                                    <strong className="text-muted d-block mb-2">
                                      Investigation Attachments
                                    </strong>
                                    <div className="d-flex flex-wrap gap-2">
                                      {stage.data.attachments.map(
                                        (att, idx) => (
                                          <a
                                            key={idx}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                          >
                                            <i className="ri-file-line me-1"></i>
                                            {att.originalName || att.name}
                                          </a>
                                        )
                                      )}
                                    </div>
                                  </Col>
                                )}
                              {stage.data.date && (
                                <Col md={12}>
                                  <small className="text-muted">
                                    Completed on:{" "}
                                    {format(
                                      new Date(stage.data.date),
                                      "MMM dd, yyyy HH:mm"
                                    )}
                                  </small>
                                </Col>
                              )}
                            </Row>
                          </div>
                        )}

                        {stage.name === "approval" && stage.data && (
                          <div>
                            <Row>
                              <Col md={6} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Decision
                                </strong>
                                <Badge
                                  color={
                                    stage.data.decision === "Approved"
                                      ? "success"
                                      : "danger"
                                  }
                                >
                                  {stage.data.decision}
                                </Badge>
                              </Col>
                              <Col md={6} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Approved By
                                </strong>
                                <span>
                                  {stage.data.by?.name || "N/A"}
                                  {stage.data.by?.email && (
                                    <div className="text-muted small">
                                      {stage.data.by.email}
                                    </div>
                                  )}
                                </span>
                              </Col>
                              <Col md={12} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Remarks
                                </strong>
                                <span>
                                  {stage.data.remarks || "No remarks"}
                                </span>
                              </Col>
                              {stage.data.date && (
                                <Col md={12}>
                                  <small className="text-muted">
                                    Approved on:{" "}
                                    {format(
                                      new Date(stage.data.date),
                                      "MMM dd, yyyy HH:mm"
                                    )}
                                  </small>
                                </Col>
                              )}
                            </Row>
                          </div>
                        )}

                        {stage.name === "closure" && stage.data && (
                          <div>
                            <Row>
                              <Col md={6} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Closed By
                                </strong>
                                <span>
                                  {stage.data.by?.name || "N/A"}
                                  {stage.data.by?.email && (
                                    <div className="text-muted small">
                                      {stage.data.by.email}
                                    </div>
                                  )}
                                </span>
                              </Col>
                              <Col md={12} className="mb-3">
                                <strong className="text-muted d-block mb-1">
                                  Closure Comments
                                </strong>
                                <span>
                                  {stage.data.comments || "No comments"}
                                </span>
                              </Col>
                              {stage.data.attachments &&
                                stage.data.attachments.length > 0 && (
                                  <Col md={12} className="mb-3">
                                    <strong className="text-muted d-block mb-2">
                                      Closure Attachments
                                    </strong>
                                    <div className="d-flex flex-wrap gap-2">
                                      {stage.data.attachments.map(
                                        (att, idx) => (
                                          <a
                                            key={idx}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                          >
                                            <i className="ri-file-line me-1"></i>
                                            {att.originalName || att.name}
                                          </a>
                                        )
                                      )}
                                    </div>
                                  </Col>
                                )}
                              {stage.data.date && (
                                <Col md={12}>
                                  <small className="text-muted">
                                    Closed on:{" "}
                                    {format(
                                      new Date(stage.data.date),
                                      "MMM dd, yyyy HH:mm"
                                    )}
                                  </small>
                                </Col>
                              )}
                            </Row>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="text-muted p-3 bg-light rounded">
                      <i className="ri-time-line me-2"></i>
                      This stage is pending completion.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

IncidentDetailsModal.propTypes = {
  incident: PropTypes.object,
  loading: PropTypes.bool,
};

export default IncidentDetailsModal;
