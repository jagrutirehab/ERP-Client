import React from "react";
import { Row, Col, Input } from "reactstrap";

const HubspotContactsHeader = ({
  search,
  onSearchChange,
  onSearch,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) => {
  return (
    <Row className="mb-3">
      <Col md={4}>
        <Input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={onSearchChange}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
      </Col>
      <Col md={2}>
        <Input
          type="select"
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </Input>
      </Col>
      <Col md={6} className="text-right">
        <small className="text-muted">Total: {totalItems || 0} contacts</small>
      </Col>
    </Row>
  );
};

export default HubspotContactsHeader;
