import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Badge,
  Button,
  Row,
  Col,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
  Alert,
  Spinner,
} from "reactstrap";
import { fetchDBLogs } from "../../../../store/actions";
import { format } from "date-fns";

const DBLogs = ({ data, loading, pagination }) => {
  const dispatch = useDispatch();
  // Mock data for demonstration
  // const [logs] = useState([
  //   {
  //     _id: "1",
  //     action: "delete",
  //     patientId: "P001",
  //     idType: "ID_TYPE_001",
  //     source: "changeStream",
  //     note: "Patient record deleted",
  //     createdAt: new Date("2024-01-15T10:30:00"),
  //     updatedFields: {},
  //     removedFields: ["name", "email"],
  //   },
  //   {
  //     _id: "2",
  //     action: "update",
  //     patientId: "P002",
  //     idType: "ID_TYPE_002",
  //     source: "changeStream",
  //     note: "Patient information updated",
  //     createdAt: new Date("2024-01-15T09:15:00"),
  //     updatedFields: { name: "John Doe", email: "john@example.com" },
  //     removedFields: [],
  //   },
  //   {
  //     _id: "3",
  //     action: "create",
  //     patientId: "P003",
  //     idType: "ID_TYPE_003",
  //     source: "changeStream",
  //     note: "New patient created",
  //     createdAt: new Date("2024-01-15T08:45:00"),
  //     updatedFields: {},
  //     removedFields: [],
  //   },
  // ]);

  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalItems] = useState(150);
  const [localFilters, setLocalFilters] = useState({
    action: "",
    startDate: "",
    endDate: "",
  });

  // Calculate pagination
  const totalPages = Math.ceil(pagination.totalItems / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  // const handleApplyFilters = () => {
  //   setLoading(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     setLoading(false);
  //     setCurrentPage(1);
  //   }, 1000);
  // };

  // Clear filters
  const handleClearFilters = () => {
    setLocalFilters({
      action: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchDBLogs());
    // setLoading(true);
    // setTimeout(() => {
    //   setLoading(false);
    // }, 1000);
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Get action badge color and icon
  const getActionBadge = (action) => {
    switch (action?.toLowerCase()) {
      case "delete":
        return { color: "danger", icon: "🗑️", text: "Delete" };
      case "update":
        return { color: "warning", icon: "✏️", text: "Update" };
      case "create":
        return { color: "success", icon: "➕", text: "Create" };
      default:
        return { color: "secondary", icon: "📝", text: action || "Unknown" };
    }
  };

  // Get entity type badge
  const getEntityBadge = (patientId) => {
    if (patientId) {
      return { color: "info", text: "Patient" };
    }
    return { color: "secondary", text: "System" };
  };

  console.log(pagination, "pagination");

  return (
    <React.Fragment>
      <div className="">
        {/* Page Header */}
        <div className="row mt-4">
          <div className="col-12">
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">
                    <i className="fas fa-chart-line mr-2"></i>
                    Activity Logs
                  </h5>
                  <small className="text-muted">
                    Monitor system activities and user actions
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    color="primary"
                    outline
                    onClick={handleRefresh}
                    disabled={loading}
                    className="btn-sm"
                    style={{ minWidth: "120px" }}
                  >
                    <i className="fas fa-sync-alt mr-1"></i>
                    Refresh
                  </Button>
                  <Button
                    color="outline-secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-sm"
                    style={{ minWidth: "120px" }}
                  >
                    <i className="fas fa-filter mr-1"></i>
                    {showFilters ? "Hide" : "Show"} Filters
                    <i
                      className={`fas fa-chevron-${
                        showFilters ? "up" : "down"
                      } ml-1`}
                    ></i>
                  </Button>
                  {/* <Dropdown>
                    <DropdownToggle
                      color="outline-primary"
                      className="btn-sm"
                      style={{ minWidth: "120px" }}
                    >
                      <i className="fas fa-download mr-1"></i>
                      Export
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>Export as CSV</DropdownItem>
                      <DropdownItem>Export as PDF</DropdownItem>
                      <DropdownItem>Export as Excel</DropdownItem>
                    </DropdownMenu>
                  </Dropdown> */}
                </div>
              </CardHeader>

              <CardBody>
                {/* Error Alert */}
                {error && (
                  <Alert color="danger" className="mb-3">
                    <strong>Error:</strong> {error}
                  </Alert>
                )}

                {/* Items Per Page and Total Count */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Input
                      type="select"
                      name="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </Input>
                  </Col>
                  <Col md={6}>
                    <div className="text-right">
                      <small className="text-muted">
                        Total: {pagination.totalItems} logs
                      </small>
                    </div>
                  </Col>
                </Row>

                {/* Filters */}
                {showFilters && (
                  <Card className="mb-4 border-light">
                    <CardBody className="p-0">
                      <Row>
                        <Col md={3}>
                          <div>
                            <label htmlFor="action">
                              <i className="fas fa-chart-line mr-1"></i>
                              Action Type
                            </label>
                            <Input
                              type="select"
                              name="action"
                              id="action"
                              value={localFilters.action}
                              onChange={handleFilterChange}
                            >
                              <option value="">All Actions</option>
                              <option value="delete">Delete</option>
                              <option value="update">Update</option>
                              <option value="create">Create</option>
                            </Input>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div>
                            <label htmlFor="startDate">
                              <i className="fas fa-calendar mr-1"></i>
                              Start Date
                            </label>
                            <Input
                              type="date"
                              name="startDate"
                              id="startDate"
                              value={localFilters.startDate}
                              onChange={handleFilterChange}
                            />
                          </div>
                        </Col>
                        <Col md={3}>
                          <div>
                            <label htmlFor="endDate">
                              <i className="fas fa-calendar mr-1"></i>
                              End Date
                            </label>
                            <Input
                              type="date"
                              name="endDate"
                              id="endDate"
                              value={localFilters.endDate}
                              onChange={handleFilterChange}
                            />
                          </div>
                        </Col>
                        <Col md={3} className="d-flex gap-3 align-items-end">
                          <Button
                            color="primary"
                            // onClick={handleApplyFilters}
                            className="mr-2 btn-sm"
                            style={{ minWidth: "100px" }}
                            disabled={loading}
                          >
                            Apply Filters
                          </Button>
                          <Button
                            color="secondary"
                            onClick={handleClearFilters}
                            className="btn-sm"
                            style={{ minWidth: "100px" }}
                            disabled={loading}
                          >
                            Clear Filters
                          </Button>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-4">
                    <Spinner color="primary" />
                    <p className="mt-2">Loading logs...</p>
                  </div>
                )}

                {/* Logs Table */}
                {!loading && (
                  <div className="table-responsive">
                    <Table striped hover className="mb-0">
                      <thead className="thead-light">
                        <tr>
                          <th>
                            <i className="fas fa-clock mr-1"></i>
                            Timestamp
                          </th>
                          <th>
                            <i className="fas fa-chart-line mr-1"></i>
                            Action
                          </th>
                          <th>
                            <i className="fas fa-user mr-1"></i>
                            Entity
                          </th>
                          <th>
                            <i className="fas fa-database mr-1"></i>
                            Source
                          </th>
                          <th>Details</th>
                          <th>Changes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data || []).map((log, index) => {
                          const actionBadge = getActionBadge(log.action);
                          const entityBadge = getEntityBadge(log.patientId);
                          const timestamp = log.date;

                          return (
                            <tr key={log._id || index}>
                              <td>
                                <div className="d-flex flex-column">
                                  <small className="text-muted">
                                    {timestamp &&
                                      format(
                                        new Date(timestamp),
                                        "dd/MM/yyyy hh:mm a"
                                      )}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <Badge
                                  color={actionBadge.color}
                                  className="d-flex align-items-center"
                                >
                                  <span className="mr-1">
                                    {actionBadge.icon}
                                  </span>
                                  {actionBadge.text}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <Badge
                                    color={entityBadge.color}
                                    className="mr-2"
                                  >
                                    {entityBadge.text}
                                  </Badge>
                                  {log.patientId && (
                                    <small className="text-muted">
                                      ID: {log.uid}
                                    </small>
                                  )}
                                </div>
                              </td>
                              <td>
                                <Badge color="info" outline>
                                  {log.source || "System"}
                                </Badge>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {log.note || "No description"}
                                </small>
                              </td>
                              <td>
                                {log.updatedFields &&
                                  Object.keys(log.updatedFields).length > 0 && (
                                    <div className="mb-1">
                                      <small className="text-success">
                                        <strong>Updated:</strong>{" "}
                                        {Object.keys(log.updatedFields).join(
                                          ", "
                                        )}
                                      </small>
                                    </div>
                                  )}
                                {log.removedFields &&
                                  log.removedFields.length > 0 && (
                                    <div>
                                      <small className="text-danger">
                                        <strong>Removed:</strong>{" "}
                                        {log.removedFields.join(", ")}
                                      </small>
                                    </div>
                                  )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}

                {/* No Data */}
                {!loading && (data || []).length === 0 && (
                  <div className="text-center py-5">
                    <i className="fas fa-database fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No logs found</h5>
                    <p className="text-muted">
                      {localFilters.action || localFilters.startDate
                        ? "Try adjusting your filters"
                        : "No activity logs available"}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {/* {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <small className="text-muted">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          pagination.totalItems
                        )}{" "}
                        of {pagination.totalItems} entries
                      </small>
                    </div>
                    <Pagination
                      className="mb-0"
                      style={{ marginBottom: "0px" }}
                    >
                      <PaginationItem disabled={!hasPrevPage}>
                        <PaginationLink
                          previous
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!hasPrevPage}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 2
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <PaginationItem disabled>
                                <PaginationLink>...</PaginationLink>
                              </PaginationItem>
                            )}
                            <PaginationItem active={page === currentPage}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}

                      <PaginationItem disabled={!hasNextPage}>
                        <PaginationLink
                          next
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!hasNextPage}
                        />
                      </PaginationItem>
                    </Pagination>
                  </div>
                )} */}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  data: state.DBLogs?.logs,
  loading: state.DBLogs?.loading,
  totalItems: state.DBLogs?.totalItems,
  pagination: state.DBLogs.pagination,
});

export default connect(mapStateToProps)(DBLogs);
