import React from "react";
import { Row, Col, Button } from "reactstrap";

const HubspotContactsFilters = ({
  onRefresh,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <Row className="mb-3">
      <Col md={6}>
        <Button
          color="outline-primary"
          size="sm"
          onClick={onRefresh}
          className="mr-2"
        >
          <i className="fas fa-sync-alt mr-1"></i>
          Refresh
        </Button>
        <Button color="outline-secondary" size="sm" onClick={onToggleFilters}>
          <i className="fas fa-filter mr-1"></i>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </Col>
    </Row>
  );
};

export default HubspotContactsFilters;
