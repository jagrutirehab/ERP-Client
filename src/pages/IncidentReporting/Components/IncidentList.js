import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardBody,
  Table,
  Badge,
  Button,
  Input,
  Row,
  Col,
  Spinner,
} from "reactstrap";
import { format } from "date-fns";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { useDispatch } from "react-redux";
import { deleteIncidentAction } from "../../../store/features/incident/incidentSlice";
import RenderWhen from "../../../Components/Common/RenderWhen";

const IncidentList = ({
  incidents,
  loading,
  onIncidentClick,
  onEdit,
  filters,
  setFilters,
  onRefresh,
}) => {
  const dispatch = useDispatch();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const getTypeBadge = (type) => {
    return (
      <Badge color={type === "Patient" ? "primary" : "info"}>{type}</Badge>
    );
  };

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission } = usePermissions(token);
  const hasIncidentDeletePermission = hasPermission(
    "INCIDENT_REPORTING",
    null,
    "DELETE"
  );
  const hasIncidentRaisePermission = hasPermission(
    "INCIDENT_REPORTING",
    "RAISE_INCIDENT",
    "READ"
  );
  const hasIncidentInvestigatePermission = hasPermission(
    "INCIDENT_REPORTING",
    "INVESTIGATE_INCIDENT",
    "READ"
  );
  const hasIncidentApprovePermission = hasPermission(
    "INCIDENT_REPORTING",
    "APPROVE_INCIDENT",
    "READ"
  );
  const hasIncidentClosePermission = hasPermission(
    "INCIDENT_REPORTING",
    "CLOSE_INCIDENT",
    "READ"
  );

  // (hasIncidentRaisePermission ||
  //   hasIncidentInvestigatePermission ||
  //   hasIncidentApprovePermission ||
  //   hasIncidentClosePermission) &&
  // [
  //   "Raised",
  //   "Under Investigation",
  //   "Pending Approval",
  //   "Approved",
  //   "Rejected",
  //   "Closed",
  // ].incident.status

  const hasActionPermission = (incident) => {
    if (hasIncidentRaisePermission && incident.status === "Raised") return true;
    else if (
      hasIncidentInvestigatePermission &&
      (incident.status === "Raised" ||
        incident.status === "Under Investigation")
    )
      return true;
    else if (
      hasIncidentApprovePermission &&
      (incident.status === "Pending Approval" || incident.status === "Rejected")
    )
      return true;
    else if (
      hasIncidentClosePermission &&
      (incident.status === "Closed" || incident.status === "Approved")
    )
      return true;
    else return false;
  };

  // const handlePageChange = (page) => {
  //   setFilters({ ...filters, page });
  // };

  const canDelete = (incident) => incident.status === "Raised"; // backend enforces further guards

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    dispatch(deleteIncidentAction(deleteTarget._id));
    setShowDeleteModal(false);
    setDeleteTarget(null);
    // optionally refresh from server if needed
    // onRefresh();
  };

  return (
    <Card>
      <CardBody>
        <Row className="mb-3">
          <Col md={3}>
            <Input
              type="text"
              placeholder="Search incidents..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
            />
          </Col>
          <Col md={3}>
            <Input
              type="select"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
            >
              <option value="">All Statuses</option>
              <option value="Raised">Raised</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </Input>
          </Col>
          <Col md={3}>
            <Input
              type="select"
              value={filters.incidentType}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  incidentType: e.target.value,
                  page: 1,
                })
              }
            >
              <option value="">All Types</option>
              <option value="Patient">Patient-related</option>
              <option value="Non-Patient">Non-patient</option>
            </Input>
          </Col>
          <Col md={3}>
            <Button color="primary" onClick={onRefresh}>
              <i className="ri-refresh-line me-1"></i>
              Refresh
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-5">
            <p>No incidents found</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Patient</th>
                    <th>Reporter</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident._id}>
                      <td>
                        <strong>{incident.title}</strong>
                      </td>
                      <td>{getTypeBadge(incident.incidentType)}</td>
                      <td>
                        {incident.patient?.name ||
                          incident.patient?.fullName ||
                          incident.patient?.title ||
                          (typeof incident.patient === "string"
                            ? incident.patient
                            : null) || <span className="text-muted">N/A</span>}
                      </td>
                      <td>
                        <div>
                          <div>
                            {incident.reporter?.name ||
                              incident.reporter?.fullName ||
                              incident.reporter?.title ||
                              incident.reporter?.id?.name ||
                              "N/A"}
                          </div>
                          <small className="text-muted">
                            {incident.reporter?.email ||
                              incident.reporter?.id?.email ||
                              ""}
                          </small>
                        </div>
                      </td>
                      <td>{getStatusBadge(incident.status)}</td>
                      <td>
                        {format(
                          new Date(incident.occurrenceDate),
                          "MMM dd, yyyy"
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            color="info"
                            size="sm"
                            onClick={() => onIncidentClick(incident)}
                            title="View Details"
                          >
                            <i className="ri-eye-line"></i>
                          </Button>
                          <RenderWhen isTrue={hasActionPermission}>
                            <Button
                              color="warning"
                              size="sm"
                              onClick={() => onEdit(incident)}
                              title="Edit"
                            >
                              <i className="ri-edit-line"></i>
                            </Button>
                          </RenderWhen>
                          <RenderWhen
                            isTrue={
                              canDelete(incident) && hasIncidentDeletePermission
                            }
                          >
                            <Button
                              color="danger"
                              size="sm"
                              title="Delete"
                              onClick={() => {
                                setDeleteTarget(incident);
                                setShowDeleteModal(true);
                              }}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </Button>
                          </RenderWhen>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Pagination would go here if needed */}
          </>
        )}
      </CardBody>
      <DeleteModal
        show={showDeleteModal}
        onCloseClick={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onDeleteClick={confirmDelete}
        messsage={`Are you sure you want to delete "${
          deleteTarget?.title || "this incident"
        }"? This will soft delete it.`}
        buttonMessage="Yes, Delete"
      />
    </Card>
  );
};

IncidentList.propTypes = {
  incidents: PropTypes.array,
  loading: PropTypes.bool,
  onIncidentClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  filters: PropTypes.object,
  setFilters: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default IncidentList;
