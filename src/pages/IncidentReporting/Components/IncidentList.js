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
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { format } from "date-fns";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { useDispatch } from "react-redux";
import { deleteIncidentAction } from "../../../store/features/incident/incidentSlice";
import RenderWhen from "../../../Components/Common/RenderWhen";
import { capitalizeWords } from "../../../utils/toCapitalize";

const IncidentList = ({
  incidents,
  loading,
  onIncidentClick,
  onEdit,
  filters,
  setFilters,
  onRefresh,
  pagination = { total: 0, page: 1, limit: 10, totalPages: 0 },
  showStatusFilter = true,
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
    "WRITE"
  );
  const hasIncidentInvestigatePermission = hasPermission(
    "INCIDENT_REPORTING",
    "INVESTIGATE_INCIDENT",
    "WRITE"
  );
  const hasIncidentApprovePermission = hasPermission(
    "INCIDENT_REPORTING",
    "APPROVE_INCIDENT",
    "WRITE"
  );
  const hasIncidentClosePermission = hasPermission(
    "INCIDENT_REPORTING",
    "CLOSE_INCIDENT",
    "WRITE"
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

  console.log({ hasIncidentRaisePermission });

  const hasActionPermission = (incident) => {
    if (incident.status === "Closed" || incident.status === "Rejected")
      return false;
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

  // console.log({ hasActionPermission: hasActionPermission(incidents[1]) });

  const totalPages = Math.max(1, pagination?.totalPages || 1);

  const renderPagination = () => {
    console.log("hello");

    // if (!totalPages || totalPages <= 1) return null;
    const current = filters.page || 1;
    const maxButtons = 5;
    const start = Math.max(1, current - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);

    const pages = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    const from = (current - 1) * (filters.limit || 10) + 1;
    const to = Math.min(
      current * (filters.limit || 10),
      pagination?.total || incidents.length
    );

    return (
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-3 pt-3 border-top">
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">
            Showing {from}-{to} of {pagination?.total || 0}
          </small>
        </div>
        <div className="d-flex align-items-center gap-3 ms-md-auto">
          <div className="d-none d-md-flex align-items-center gap-2">
            <small className="text-muted">Items per page:</small>
            <Input
              type="select"
              bsSize="sm"
              value={filters.limit}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  limit: Number(e.target.value),
                  page: 1,
                })
              }
              style={{ width: 100 }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Input>
          </div>
          <Pagination className="mb-0">
            <PaginationItem disabled={current === 1}>
              <PaginationLink
                first
                onClick={() => setFilters({ ...filters, page: 1 })}
              />
            </PaginationItem>
            <PaginationItem disabled={current === 1}>
              <PaginationLink
                previous
                onClick={() => setFilters({ ...filters, page: current - 1 })}
              />
            </PaginationItem>
            {pages.map((p) => (
              <PaginationItem key={p} active={p === current}>
                <PaginationLink
                  onClick={() => setFilters({ ...filters, page: p })}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem disabled={current === totalPages}>
              <PaginationLink
                next
                onClick={() => setFilters({ ...filters, page: current + 1 })}
              />
            </PaginationItem>
            <PaginationItem disabled={current === totalPages}>
              <PaginationLink
                last
                onClick={() => setFilters({ ...filters, page: totalPages })}
              />
            </PaginationItem>
          </Pagination>
        </div>
      </div>
    );
  };

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
          {showStatusFilter && (
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
          )}
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
          {/* <Col md={2}>
            <Input
              type="select"
              value={filters.limit}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  limit: Number(e.target.value),
                  page: 1,
                })
              }
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </Input>
          </Col> */}
          <Col md={2}>
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
                    <th>#S.No</th>
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
                  {incidents.map((incident, index) => (
                    <tr key={incident._id}>
                      <td>
                        <strong>{index + 1}</strong>
                      </td>
                      <td>
                        <strong>{capitalizeWords(incident.title)}</strong>
                      </td>
                      <td>{getTypeBadge(incident.incidentType)}</td>
                      <td>
                        {capitalizeWords(incident.patient?.name || "") || (
                          <span className="text-muted">N/A</span>
                        )}
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
                          <RenderWhen isTrue={hasActionPermission(incident)}>
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

            {renderPagination()}
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
  pagination: PropTypes.object,
  showStatusFilter: PropTypes.bool,
};

export default IncidentList;
