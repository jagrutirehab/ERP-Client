import React from "react";
import PropTypes from "prop-types";
import { Col, Label, Row } from "reactstrap";
import { format } from "date-fns";

const OnlineTransaction = ({ data }) => {
  if (!data) return null;

  return (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <h6 className="mb-0 fs-15 text-primary fw-bold">
          <i className="ri-secure-payment-line me-2 align-middle"></i>
          Online Booking Transaction (Read-Only)
        </h6>
        <span
          className={`badge ${
            data.payment_Status === "Completed"
              ? "bg-success"
              : data.payment_Status === "Refund"
              ? "bg-warning"
              : "bg-secondary"
          } px-3 py-1 fs-12`}
        >
          {data.payment_Status || "Completed"}
        </span>
      </div>

      <Row className="g-3">
        <Col xs={6} md={3}>
          <Label className="text-muted fs-12 mb-1 d-block">Amount Paid</Label>
          <span className="fs-15 fw-bold text-success">
            ₹{data.booking_price ?? 0}
          </span>
        </Col>

        <Col xs={6} md={3}>
          <Label className="text-muted fs-12 mb-1 d-block">Payment Mode</Label>
          <span className="fs-13 fw-semibold text-uppercase">
            {data.payment_method || "ONLINE"}
          </span>
          {data.wallet_name && (
            <span className="text-muted fs-12 ms-1">({data.wallet_name})</span>
          )}
        </Col>

        <Col xs={6} md={3}>
          <Label className="text-muted fs-12 mb-1 d-block">Razorpay Payment ID</Label>
          <span className="fs-12 font-monospace text-dark text-break">
            {data.razorpay_payment_id || "-"}
          </span>
        </Col>

        <Col xs={6} md={3}>
          <Label className="text-muted fs-12 mb-1 d-block">Order ID</Label>
          <span className="fs-12 font-monospace text-muted text-break">
            {data.razorpay_order_id || data.order_id || "-"}
          </span>
        </Col>

        <Col xs={6} md={3}>
          <Label className="text-muted fs-12 mb-1 d-block">Completed Time</Label>
          <span className="fs-12 text-muted">
            {data.completedTime
              ? format(new Date(data.completedTime), "dd MMM yyyy, hh:mm a")
              : data.createdAt
              ? format(new Date(data.createdAt), "dd MMM yyyy, hh:mm a")
              : "-"}
          </span>
        </Col>

        {data.customer_email && (
          <Col xs={6} md={3}>
            <Label className="text-muted fs-12 mb-1 d-block">Customer Email</Label>
            <span className="fs-12 text-muted text-break">{data.customer_email}</span>
          </Col>
        )}

        {data.customer_contact && (
          <Col xs={6} md={3}>
            <Label className="text-muted fs-12 mb-1 d-block">Customer Contact</Label>
            <span className="fs-12 text-muted">{data.customer_contact}</span>
          </Col>
        )}

        {data.offerDetails?.discountAmount > 0 && (
          <Col xs={6} md={3}>
            <Label className="text-muted fs-12 mb-1 d-block">Discount Applied</Label>
            <span className="fs-12 text-danger fw-semibold">
              - ₹{data.offerDetails.discountAmount}
            </span>
          </Col>
        )}
      </Row>
    </div>
  );
};

OnlineTransaction.propTypes = {
  data: PropTypes.object,
};

export default OnlineTransaction;
