import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import {
  Card,
  CardBody,
  Row,
  Col,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
  Alert,
} from "reactstrap";
import { fetchDBLogs } from "../../../../store/actions";
import DBLogsHeader from "./components/DBLogsHeader";
import DBLogsFilters from "./components/DBLogsFilters";
import DBLogsTable from "./components/DBLogsTable";

const DBLogs = ({ data, loading, pagination }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalItems] = useState(150);
  const [localFilters, setLocalFilters] = useState({
    action: "",
    collectionName: "",
    startDate: "",
    endDate: "",
    search: "",
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
  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    fetchData();
  };

  // Clear filters
  const handleClearFilters = () => {
    setLocalFilters({
      action: "",
      collectionName: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = Number(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Fetch data function
  const fetchData = () => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: "date",
      sortOrder: "desc",
      ...localFilters,
    };

    // Remove empty filters
    Object.keys(params).forEach((key) => {
      if (
        params[key] === "" ||
        params[key] === null ||
        params[key] === undefined
      ) {
        delete params[key];
      }
    });
    dispatch(fetchDBLogs(params));
  };

  // Refresh data
  const handleRefresh = () => {
    fetchData();
  };

  // Effect to fetch data when pagination or filters change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  // Effect to fetch data on initial load
  useEffect(() => {
    fetchData();
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

  return (
    <React.Fragment>
      <div className="">
        <div className="row mt-4">
          <div className="col-12">
            <Card>
              <DBLogsHeader
                onRefresh={handleRefresh}
                onToggleFilters={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
                loading={loading}
              />
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
                      onChange={handleItemsPerPageChange}
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

                {showFilters && (
                  <DBLogsFilters
                    filters={localFilters}
                    onFilterChange={handleFilterChange}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                    loading={loading}
                  />
                )}

                <DBLogsTable data={data} loading={loading} />

                {/* Pagination */}
                {totalPages > 1 && (
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
                )}
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
