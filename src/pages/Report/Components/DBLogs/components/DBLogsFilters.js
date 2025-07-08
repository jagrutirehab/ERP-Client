import React from "react";
import { Card, CardBody, Row, Col, Input, Button } from "reactstrap";

const DBLogsFilters = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  loading,
}) => {
  return (
    <Card className="mb-4 border-light">
      <CardBody className="p-0">
        <Row>
          <Col md={2}>
            <div>
              <label htmlFor="action">
                <i className="fas fa-chart-line mr-1"></i>
                Action Type
              </label>
              <Input
                type="select"
                name="action"
                id="action"
                value={filters.action}
                onChange={onFilterChange}
              >
                <option value="">All Actions</option>
                <option value="delete">Delete</option>
                <option value="update">Update</option>
                <option value="create">Create</option>
              </Input>
            </div>
          </Col>
          <Col md={2}>
            <div>
              <label htmlFor="collectionName">
                <i className="fas fa-database mr-1"></i>
                Collection
              </label>
              <Input
                type="select"
                name="collectionName"
                id="collectionName"
                value={filters.collectionName}
                onChange={onFilterChange}
              >
                <option value="">All Collections</option>
                <option value="Patient">Patient</option>
                <option value="Bill">Bill</option>
                <option value="Chart">Chart</option>
                <option value="Center">Center</option>
                <option value="Lead">Lead</option>
                <option value="Intern">Intern</option>
                <option value="Addmission">Admission</option>
                <option value="User">User</option>
              </Input>
            </div>
          </Col>
          <Col md={2}>
            <div>
              <label htmlFor="startDate">
                <i className="fas fa-calendar mr-1"></i>
                Start Date
              </label>
              <Input
                type="date"
                name="startDate"
                id="startDate"
                value={filters.startDate}
                onChange={onFilterChange}
              />
            </div>
          </Col>
          <Col md={2}>
            <div>
              <label htmlFor="endDate">
                <i className="fas fa-calendar mr-1"></i>
                End Date
              </label>
              <Input
                type="date"
                name="endDate"
                id="endDate"
                value={filters.endDate}
                onChange={onFilterChange}
              />
            </div>
          </Col>
          <Col md={4}>
            <div>
              <label htmlFor="search">
                <i className="fas fa-search mr-1"></i>
                Search Notes
              </label>
              <Input
                type="text"
                name="search"
                id="search"
                placeholder="Search in notes..."
                value={filters.search}
                onChange={onFilterChange}
              />
            </div>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col md={12} className="d-flex gap-3 justify-content-end">
            <Button
              color="primary"
              onClick={onApplyFilters}
              className="btn-sm"
              style={{ minWidth: "100px" }}
              disabled={loading}
            >
              Apply Filters
            </Button>
            <Button
              color="secondary"
              onClick={onClearFilters}
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
  );
};

export default DBLogsFilters;
