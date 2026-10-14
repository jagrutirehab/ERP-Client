import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Label, Input } from "reactstrap";

const InvoiceDateRange = ({ validation }) => {
  return (
    <Row className="mb-3">
      <Col md={3}>
        <Label>From Date</Label>
        <Input
          type="date"
          name="fromDate"
          value={validation.values.fromDate || ""}
          onChange={validation.handleChange}
          invalid={
            validation.touched.fromDate && Boolean(validation.errors.fromDate)
          }
        />
        {validation.touched.fromDate && validation.errors.fromDate && (
          <div className="text-danger small">{validation.errors.fromDate}</div>
        )}
      </Col>

      <Col md={3}>
        <Label>To Date</Label>
        <Input
          type="date"
          name="toDate"
          value={validation.values.toDate || ""}
          onChange={validation.handleChange}
          invalid={
            validation.touched.toDate && Boolean(validation.errors.toDate)
          }
        />
        {validation.touched.toDate && validation.errors.toDate && (
          <div className="text-danger small">{validation.errors.toDate}</div>
        )}
      </Col>
    </Row>
  );
};

InvoiceDateRange.propTypes = {
  validation: PropTypes.object.isRequired,
};

export default InvoiceDateRange;
